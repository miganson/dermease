import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
  uploadProductImage
} from "../controllers/product.controller.js";
import { authenticate, requireRole } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

export const productRoutes = Router();

productRoutes.get("/", listProducts);
productRoutes.post(
  "/upload-image",
  authenticate,
  requireRole("admin"),
  upload.single("image"),
  uploadProductImage
);
productRoutes.post("/", authenticate, requireRole("admin"), createProduct);
productRoutes.patch("/:productId", authenticate, requireRole("admin"), updateProduct);
productRoutes.delete("/:productId", authenticate, requireRole("admin"), deleteProduct);
productRoutes.get("/:identifier", getProduct);

