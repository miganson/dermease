import { z } from "zod";
import { PAYMENT_METHODS } from "../lib/constants.js";
import { OrderModel } from "../models/Order.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { ApiError } from "../utils/apiError.js";
import { createOrderWithInventory } from "../services/order.service.js";

const checkoutSchema = z.object({
  recipientName: z.string().min(2),
  contactNumber: z.string().min(7),
  deliveryAddress: z.string().min(10),
  notes: z.string().optional(),
  paymentMethod: z.enum(PAYMENT_METHODS),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive()
      })
    )
    .min(1)
});

export const createOrder = asyncHandler(async (req, res) => {
  if (!req.currentUser) {
    throw new ApiError(401, "Authentication required");
  }

  const payload = checkoutSchema.parse(req.body);
  const order = await createOrderWithInventory({
    customerId: String(req.currentUser._id),
    ...payload
  });

  return sendSuccess(res, order, "Order placed successfully", 201);
});

export const listMyOrders = asyncHandler(async (req, res) => {
  if (!req.currentUser) {
    throw new ApiError(401, "Authentication required");
  }

  const orders = await OrderModel.find({ customer: req.currentUser._id }).sort({ createdAt: -1 });
  return sendSuccess(res, orders);
});

export const getMyOrder = asyncHandler(async (req, res) => {
  if (!req.currentUser) {
    throw new ApiError(401, "Authentication required");
  }

  const order = await OrderModel.findOne({
    _id: req.params.orderId,
    customer: req.currentUser._id
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return sendSuccess(res, order);
});

