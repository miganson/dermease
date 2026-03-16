import { Router } from "express";
import {
  adjustStock,
  getAdminDashboard,
  listAdminOrders,
  listAuditLogs,
  listInventory,
  listPayments,
  updateAdminOrderStatus
} from "../controllers/admin.controller.js";
import { authenticate, requireRole } from "../middlewares/auth.middleware.js";

export const adminRoutes = Router();

adminRoutes.use(authenticate, requireRole("admin"));
adminRoutes.get("/dashboard", getAdminDashboard);
adminRoutes.get("/orders", listAdminOrders);
adminRoutes.patch("/orders/:orderId/status", updateAdminOrderStatus);
adminRoutes.get("/inventory", listInventory);
adminRoutes.post("/inventory/adjustments", adjustStock);
adminRoutes.get("/payments", listPayments);
adminRoutes.get("/audit-logs", listAuditLogs);

