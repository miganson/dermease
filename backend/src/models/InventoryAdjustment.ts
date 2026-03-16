import { Schema, model, type Types } from "mongoose";
import {
  INVENTORY_ADJUSTMENT_TYPES,
  type InventoryAdjustmentType
} from "../lib/constants.js";

export interface InventoryAdjustment {
  product: Types.ObjectId;
  order?: Types.ObjectId;
  admin?: Types.ObjectId;
  adjustmentType: InventoryAdjustmentType;
  quantity: number;
  remarks: string;
  balanceAfter: number;
}

const inventoryAdjustmentSchema = new Schema<InventoryAdjustment>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order"
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    adjustmentType: {
      type: String,
      enum: INVENTORY_ADJUSTMENT_TYPES,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    remarks: {
      type: String,
      required: true
    },
    balanceAfter: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const InventoryAdjustmentModel = model<InventoryAdjustment>(
  "InventoryAdjustment",
  inventoryAdjustmentSchema
);

