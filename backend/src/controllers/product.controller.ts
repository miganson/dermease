import mongoose from "mongoose";
import { z } from "zod";
import { ProductModel } from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { ApiError } from "../utils/apiError.js";
import { PRODUCT_CATEGORIES } from "../lib/constants.js";
import { slugify } from "../utils/slugify.js";
import { createAuditLog } from "../services/audit.service.js";
import { uploadImageBuffer } from "../services/upload.service.js";

const productInputSchema = z.object({
  name: z.string().min(2),
  category: z.enum(PRODUCT_CATEGORIES),
  shortDescription: z.string().min(10),
  description: z.string().min(20),
  price: z.coerce.number().nonnegative(),
  stockQuantity: z.coerce.number().int().nonnegative(),
  lowStockThreshold: z.coerce.number().int().nonnegative(),
  imageUrl: z.string().url(),
  tags: z.array(z.string()).default([]),
  isActive: z.coerce.boolean().default(true)
});

export const listProducts = asyncHandler(async (req, res) => {
  const search = String(req.query.search ?? "").trim();
  const category = String(req.query.category ?? "").trim();

  const filters: Record<string, unknown> = {
    isActive: true
  };

  if (search) {
    filters.$or = [
      { name: { $regex: search, $options: "i" } },
      { shortDescription: { $regex: search, $options: "i" } },
      { tags: { $in: [new RegExp(search, "i")] } }
    ];
  }

  if (category) {
    filters.category = category;
  }

  const products = await ProductModel.find(filters).sort({ createdAt: -1 });

  return sendSuccess(res, products);
});

export const getProduct = asyncHandler(async (req, res) => {
  const identifier = req.params.identifier;
  const filters = mongoose.isValidObjectId(identifier)
    ? [{ _id: identifier }, { slug: identifier }]
    : [{ slug: identifier }];

  const product = await ProductModel.findOne({
    $or: filters
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return sendSuccess(res, product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const payload = productInputSchema.parse(req.body);

  const slugBase = slugify(payload.name);
  const slug = `${slugBase}-${Date.now().toString().slice(-5)}`;
  const sku = `DERM-${payload.category.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;

  const product = await ProductModel.create({
    ...payload,
    slug,
    sku
  });

  await createAuditLog({
    actorId: req.currentUser?._id,
    actorRole: req.currentUser?.role,
    action: "product.created",
    entityType: "product",
    entityId: product._id,
    summary: `Product ${product.name} created`
  });

  return sendSuccess(res, product, "Product created", 201);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const payload = productInputSchema.partial().parse(req.body);
  const product = await ProductModel.findById(req.params.productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (payload.name) {
    product.slug = slugify(payload.name);
  }

  Object.assign(product, payload);
  await product.save();

  await createAuditLog({
    actorId: req.currentUser?._id,
    actorRole: req.currentUser?.role,
    action: "product.updated",
    entityType: "product",
    entityId: product._id,
    summary: `Product ${product.name} updated`
  });

  return sendSuccess(res, product, "Product updated");
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await ProductModel.findById(req.params.productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  product.isActive = false;
  await product.save();

  await createAuditLog({
    actorId: req.currentUser?._id,
    actorRole: req.currentUser?.role,
    action: "product.archived",
    entityType: "product",
    entityId: product._id,
    summary: `Product ${product.name} archived`
  });

  return sendSuccess(res, null, "Product archived");
});

export const uploadProductImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Image file is required");
  }

  const uploaded = await uploadImageBuffer(req.file.buffer);
  return sendSuccess(res, uploaded, "Image uploaded");
});
