import mongoose from "mongoose";
import { env } from "../config/env.js";
import { InventoryAdjustmentModel } from "../models/InventoryAdjustment.js";
import { OrderModel } from "../models/Order.js";
import { ProductModel } from "../models/Product.js";
import { createAuditLog } from "./audit.service.js";
import { ApiError } from "../utils/apiError.js";
import type { PaymentMethod } from "../lib/constants.js";

export interface CheckoutItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderInput {
  customerId: string;
  recipientName: string;
  contactNumber: string;
  deliveryAddress: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  items: CheckoutItemInput[];
}

export async function createOrderWithInventory(input: CreateOrderInput) {
  if (!input.items.length) {
    throw new ApiError(400, "At least one item is required");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const productIds = input.items.map((item) => new mongoose.Types.ObjectId(item.productId));
    const products = await ProductModel.find({ _id: { $in: productIds }, isActive: true }).session(
      session
    );

    if (products.length !== input.items.length) {
      throw new ApiError(400, "Some products are unavailable");
    }

    const items = input.items.map((item) => {
      const product = products.find((entry) => String(entry._id) === item.productId);
      if (!product) {
        throw new ApiError(400, "Product not found");
      }

      if (item.quantity <= 0) {
        throw new ApiError(400, "Quantity must be greater than zero");
      }

      if (product.stockQuantity < item.quantity) {
        throw new ApiError(400, `${product.name} does not have enough stock`);
      }

      return {
        product,
        quantity: item.quantity
      };
    });

    const orderItems = items.map(({ product, quantity }) => ({
      product: product._id,
      productName: product.name,
      productSlug: product.slug,
      imageUrl: product.imageUrl,
      price: product.price,
      quantity,
      lineTotal: product.price * quantity
    }));

    const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const shippingFee = env.FLAT_SHIPPING_FEE;
    const total = subtotal + shippingFee;

    const [order] = await OrderModel.create(
      [
        {
          customer: input.customerId,
          items: orderItems,
          recipientName: input.recipientName,
          contactNumber: input.contactNumber,
          deliveryAddress: input.deliveryAddress,
          notes: input.notes,
          paymentMethod: input.paymentMethod,
          paymentStatus: "pending",
          status: "pending_payment",
          subtotal,
          shippingFee,
          total,
          statusHistory: [
            {
              status: "pending_payment",
              note: "Order placed and awaiting payment.",
              updatedBy: input.customerId,
              updatedAt: new Date()
            }
          ]
        }
      ],
      { session }
    );

    for (const entry of items) {
      entry.product.stockQuantity -= entry.quantity;
      await entry.product.save({ session });

      await InventoryAdjustmentModel.create(
        [
          {
            product: entry.product._id,
            order: order._id,
            adjustmentType: "order_hold",
            quantity: -entry.quantity,
            remarks: "Stock reserved when customer placed an order.",
            balanceAfter: entry.product.stockQuantity
          }
        ],
        { session }
      );
    }

    await session.commitTransaction();

    await createAuditLog({
      actorId: input.customerId,
      actorRole: "customer",
      action: "order.created",
      entityType: "order",
      entityId: order._id,
      summary: `Customer placed order ${order._id}`,
      meta: { total, subtotal, itemCount: input.items.length }
    });

    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function cancelOrderAndRestoreStock(orderId: string, adminId: string) {
  return restoreOrderStock({
    orderId,
    actorId: adminId,
    actorRole: "admin",
    note: "Order cancelled and stock restored.",
    auditAction: "order.cancelled",
    auditSummary: `Admin cancelled order ${orderId}`,
    paymentStatus: undefined
  });
}

export async function restoreFailedPaymentOrder(orderId: string, customerId: string) {
  return restoreOrderStock({
    orderId,
    actorId: customerId,
    actorRole: "customer",
    note: "Payment failed. Order cancelled and stock restored.",
    auditAction: "payment.failed.stock_restored",
    auditSummary: `Payment failed and stock was restored for order ${orderId}`,
    paymentStatus: "failed"
  });
}

interface RestoreOrderStockOptions {
  orderId: string;
  actorId: string;
  actorRole: "admin" | "customer";
  note: string;
  auditAction: string;
  auditSummary: string;
  paymentStatus?: "failed";
}

async function restoreOrderStock(options: RestoreOrderStockOptions) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const order = await OrderModel.findById(options.orderId).session(session);
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    if (order.status === "cancelled") {
      throw new ApiError(400, "Order is already cancelled");
    }

    for (const item of order.items) {
      const product = await ProductModel.findById(item.product).session(session);
      if (!product) {
        continue;
      }

      product.stockQuantity += item.quantity;
      await product.save({ session });

      await InventoryAdjustmentModel.create(
        [
          {
            product: product._id,
            order: order._id,
            admin: options.actorRole === "admin" ? options.actorId : undefined,
            adjustmentType: "cancel_restore",
            quantity: item.quantity,
            remarks: options.note,
            balanceAfter: product.stockQuantity
          }
        ],
        { session }
      );
    }

    order.status = "cancelled";
    if (options.paymentStatus) {
      order.paymentStatus = options.paymentStatus;
    }
    order.statusHistory.push({
      status: "cancelled",
      note: options.note,
      updatedBy: new mongoose.Types.ObjectId(options.actorId),
      updatedAt: new Date()
    });

    await order.save({ session });
    await session.commitTransaction();

    await createAuditLog({
      actorId: options.actorId,
      actorRole: options.actorRole,
      action: options.auditAction,
      entityType: "order",
      entityId: order._id,
      summary: options.auditSummary,
      meta: { restoredItems: order.items.length }
    });

    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
