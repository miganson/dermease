import { z } from "zod";
import { OrderModel } from "../models/Order.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { ApiError } from "../utils/apiError.js";
import { completeMockPayment, createMockPaymentSession } from "../services/payment.service.js";

export const createPaymentSession = asyncHandler(async (req, res) => {
  if (!req.currentUser) {
    throw new ApiError(401, "Authentication required");
  }

  const payload = z
    .object({
      orderId: z.string().min(1)
    })
    .parse(req.body);

  const order = await OrderModel.findOne({
    _id: payload.orderId,
    customer: req.currentUser._id
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const transaction = await createMockPaymentSession({
    orderId: String(order._id),
    customerId: String(req.currentUser._id),
    amount: order.total,
    method: order.paymentMethod
  });

  return sendSuccess(
    res,
    {
      transactionId: transaction._id,
      gatewaySessionId: transaction.gatewaySessionId,
      reference: transaction.reference,
      amount: transaction.amount,
      status: transaction.status
    },
    "Payment session created",
    201
  );
});

export const completePayment = asyncHandler(async (req, res) => {
  if (!req.currentUser) {
    throw new ApiError(401, "Authentication required");
  }

  const payload = z
    .object({
      outcome: z.enum(["success", "failed"])
    })
    .parse(req.body);

  const transaction = await completeMockPayment(
    String(req.params.transactionId),
    payload.outcome,
    String(req.currentUser._id)
  );

  return sendSuccess(res, transaction, "Payment session updated");
});
