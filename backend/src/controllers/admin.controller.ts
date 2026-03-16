import mongoose from "mongoose";
import { z } from "zod";
import { OrderModel } from "../models/Order.js";
import { ProductModel } from "../models/Product.js";
import { InventoryAdjustmentModel } from "../models/InventoryAdjustment.js";
import { AuditLogModel } from "../models/AuditLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { ApiError } from "../utils/apiError.js";
import { ORDER_STATUSES } from "../lib/constants.js";
import { cancelOrderAndRestoreStock } from "../services/order.service.js";
import { listPaymentTransactions } from "../services/payment.service.js";
import { getDashboardSummary } from "../services/report.service.js";
import { createAuditLog } from "../services/audit.service.js";

const orderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  note: z.string().min(4).default("Order status updated by admin.")
});

const stockAdjustmentSchema = z.object({
  productId: z.string().min(1),
  adjustment: z.number().int().refine((value) => value !== 0, "Adjustment cannot be zero"),
  remarks: z.string().min(4)
});

export const getAdminDashboard = asyncHandler(async (_req, res) => {
  const summary = await getDashboardSummary();
  return sendSuccess(res, summary);
});

export const listAdminOrders = asyncHandler(async (_req, res) => {
  const orders = await OrderModel.find()
    .populate("customer", "fullName email")
    .sort({ createdAt: -1 });

  return sendSuccess(res, orders);
});

export const updateAdminOrderStatus = asyncHandler(async (req, res) => {
  if (!req.currentUser) {
    throw new ApiError(401, "Authentication required");
  }

  const payload = orderStatusSchema.parse(req.body);
  if (payload.status === "cancelled") {
    const cancelledOrder = await cancelOrderAndRestoreStock(
      String(req.params.orderId),
      String(req.currentUser._id)
    );
    return sendSuccess(res, cancelledOrder, "Order cancelled and stock restored");
  }

  const order = await OrderModel.findById(String(req.params.orderId));
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  order.status = payload.status;
  order.statusHistory.push({
    status: payload.status,
    note: payload.note,
    updatedBy: new mongoose.Types.ObjectId(String(req.currentUser._id)),
    updatedAt: new Date()
  });

  await order.save();

  await createAuditLog({
    actorId: req.currentUser._id,
    actorRole: req.currentUser.role,
    action: "order.status.updated",
    entityType: "order",
    entityId: order._id,
    summary: `Order ${order._id} marked as ${payload.status}`
  });

  return sendSuccess(res, order, "Order status updated");
});

export const adjustStock = asyncHandler(async (req, res) => {
  if (!req.currentUser) {
    throw new ApiError(401, "Authentication required");
  }

  const payload = stockAdjustmentSchema.parse(req.body);
  const product = await ProductModel.findById(payload.productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const nextBalance = product.stockQuantity + payload.adjustment;
  if (nextBalance < 0) {
    throw new ApiError(400, "Adjustment would make stock negative");
  }

  product.stockQuantity = nextBalance;
  await product.save();

  const adjustment = await InventoryAdjustmentModel.create({
    product: product._id,
    admin: req.currentUser._id,
    adjustmentType: payload.adjustment > 0 ? "manual_add" : "manual_remove",
    quantity: payload.adjustment,
    remarks: payload.remarks,
    balanceAfter: nextBalance
  });

  await createAuditLog({
    actorId: req.currentUser._id,
    actorRole: req.currentUser.role,
    action: "inventory.adjusted",
    entityType: "inventory_adjustment",
    entityId: adjustment._id,
    summary: `Stock adjusted for ${product.name}`,
    meta: { productId: product._id, adjustment: payload.adjustment }
  });

  return sendSuccess(res, adjustment, "Stock adjusted");
});

export const listInventory = asyncHandler(async (_req, res) => {
  const inventory = await ProductModel.find().sort({ stockQuantity: 1, name: 1 });
  return sendSuccess(res, inventory);
});

export const listPayments = asyncHandler(async (_req, res) => {
  const payments = await listPaymentTransactions();
  return sendSuccess(res, payments);
});

export const listAuditLogs = asyncHandler(async (_req, res) => {
  const logs = await AuditLogModel.find().sort({ createdAt: -1 }).limit(100);
  return sendSuccess(res, logs);
});
