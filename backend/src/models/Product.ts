import { Schema, model } from "mongoose";
import { PRODUCT_CATEGORIES, type ProductCategory } from "../lib/constants.js";

export interface Product {
  name: string;
  slug: string;
  sku: string;
  category: ProductCategory;
  shortDescription: string;
  description: string;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
  imageUrl: string;
  imagePublicId?: string;
  tags: string[];
  isActive: boolean;
}

const productSchema = new Schema<Product>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    category: {
      type: String,
      enum: PRODUCT_CATEGORIES,
      required: true
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 8,
      min: 0
    },
    imageUrl: {
      type: String,
      required: true
    },
    imagePublicId: {
      type: String
    },
    tags: {
      type: [String],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export const ProductModel = model<Product>("Product", productSchema);

