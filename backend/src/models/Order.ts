import { Schema, model, type Types } from "mongoose";
import {
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  type OrderStatus,
  type PaymentMethod,
  type PaymentStatus
} from "../lib/constants.js";

export interface OrderItem {
  product: Types.ObjectId;
  productName: string;
  productSlug: string;
  imageUrl: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  note: string;
  updatedBy?: Types.ObjectId;
  updatedAt: Date;
}

export interface Order {
  customer: Types.ObjectId;
  items: OrderItem[];
  recipientName: string;
  contactNumber: string;
  deliveryAddress: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  placedAt: Date;
  statusHistory: OrderStatusHistory[];
}

const orderItemSchema = new Schema<OrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    productSlug: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    lineTotal: {
      type: Number,
      required: true
    }
  },
  {
    _id: false
  }
);

const statusHistorySchema = new Schema<OrderStatusHistory>(
  {
    status: {
      type: String,
      enum: ORDER_STATUSES,
      required: true
    },
    note: {
      type: String,
      required: true
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    updatedAt: {
      type: Date,
      required: true
    }
  },
  {
    _id: false
  }
);

const orderSchema = new Schema<Order>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: {
      type: [orderItemSchema],
      required: true
    },
    recipientName: {
      type: String,
      required: true
    },
    contactNumber: {
      type: String,
      required: true
    },
    deliveryAddress: {
      type: String,
      required: true
    },
    notes: {
      type: String
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "pending"
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending_payment"
    },
    subtotal: {
      type: Number,
      required: true
    },
    shippingFee: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    placedAt: {
      type: Date,
      default: Date.now
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

export const OrderModel = model<Order>("Order", orderSchema);

