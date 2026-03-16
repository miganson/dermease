import { Schema, model, type Types } from "mongoose";
import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  PAYMENT_PROVIDER,
  type PaymentMethod,
  type PaymentStatus
} from "../lib/constants.js";

export interface PaymentTransaction {
  order: Types.ObjectId;
  customer: Types.ObjectId;
  provider: string;
  method: PaymentMethod;
  reference: string;
  status: PaymentStatus;
  amount: number;
  gatewaySessionId: string;
  providerPayload?: Record<string, unknown>;
  paidAt?: Date;
}

const paymentTransactionSchema = new Schema<PaymentTransaction>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    provider: {
      type: String,
      default: PAYMENT_PROVIDER
    },
    method: {
      type: String,
      enum: PAYMENT_METHODS,
      required: true
    },
    reference: {
      type: String,
      required: true,
      unique: true
    },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "pending"
    },
    amount: {
      type: Number,
      required: true
    },
    gatewaySessionId: {
      type: String,
      required: true,
      unique: true
    },
    providerPayload: {
      type: Schema.Types.Mixed
    },
    paidAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export const PaymentTransactionModel = model<PaymentTransaction>(
  "PaymentTransaction",
  paymentTransactionSchema
);

