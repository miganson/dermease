import { PaymentTransactionModel } from "../models/PaymentTransaction.js";
import { OrderModel } from "../models/Order.js";
import { createAuditLog } from "./audit.service.js";
import { ApiError } from "../utils/apiError.js";
import type { PaymentMethod } from "../lib/constants.js";

function buildReference(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export async function createMockPaymentSession(params: {
  orderId: string;
  customerId: string;
  amount: number;
  method: PaymentMethod;
}) {
  const gatewaySessionId = buildReference("sess");
  const reference = buildReference("pay");

  const transaction = await PaymentTransactionModel.create({
    order: params.orderId,
    customer: params.customerId,
    amount: params.amount,
    method: params.method,
    gatewaySessionId,
    reference,
    status: "pending",
    providerPayload: {
      mode: "demo"
    }
  });

  await createAuditLog({
    actorId: params.customerId,
    actorRole: "customer",
    action: "payment.session.created",
    entityType: "payment_transaction",
    entityId: transaction._id,
    summary: `Mock payment session created for order ${params.orderId}`,
    meta: { gatewaySessionId, reference }
  });

  return transaction;
}

export async function completeMockPayment(
  transactionId: string,
  outcome: "success" | "failed",
  actorId: string
) {
  const transaction = await PaymentTransactionModel.findById(transactionId);
  if (!transaction) {
    throw new ApiError(404, "Payment transaction not found");
  }

  transaction.status = outcome === "success" ? "paid" : "failed";
  transaction.providerPayload = {
    ...(transaction.providerPayload ?? {}),
    resolvedAt: new Date().toISOString(),
    outcome
  };

  if (outcome === "success") {
    transaction.paidAt = new Date();
  }

  await transaction.save();

  const order = await OrderModel.findById(transaction.order);
  if (!order) {
    throw new ApiError(404, "Linked order not found");
  }

  order.paymentStatus = transaction.status;
  if (outcome === "success") {
    order.status = "paid";
    order.statusHistory.push({
      status: "paid",
      note: "Mock payment completed successfully.",
      updatedBy: order.customer,
      updatedAt: new Date()
    });
  }

  await order.save();

  await createAuditLog({
    actorId,
    actorRole: "customer",
    action: "payment.session.completed",
    entityType: "payment_transaction",
    entityId: transaction._id,
    summary: `Mock payment ${outcome} for order ${order._id}`,
    meta: {
      transactionId,
      orderId: String(order._id),
      outcome
    }
  });

  return transaction;
}

export async function listPaymentTransactions(limit = 50) {
  return PaymentTransactionModel.find()
    .populate("order", "status total")
    .populate("customer", "fullName email")
    .sort({ createdAt: -1 })
    .limit(limit);
}

