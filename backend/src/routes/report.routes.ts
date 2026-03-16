import { Router } from "express";
import {
  getDailySales,
  getInventoryStatus,
  getLowStock,
  getMonthlySales,
  getOrderStatus,
  getPaymentSummary,
  getProductPerformance
} from "../controllers/report.controller.js";
import { authenticate, requireRole } from "../middlewares/auth.middleware.js";

export const reportRoutes = Router();

reportRoutes.use(authenticate, requireRole("admin"));
reportRoutes.get("/daily-sales", getDailySales);
reportRoutes.get("/monthly-sales", getMonthlySales);
reportRoutes.get("/inventory-status", getInventoryStatus);
reportRoutes.get("/low-stock", getLowStock);
reportRoutes.get("/order-status", getOrderStatus);
reportRoutes.get("/payment-summary", getPaymentSummary);
reportRoutes.get("/product-performance", getProductPerformance);

