import { Router } from "express";
import { createOrder, getMyOrder, listMyOrders } from "../controllers/order.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

export const orderRoutes = Router();

orderRoutes.use(authenticate);
orderRoutes.post("/", createOrder);
orderRoutes.get("/my", listMyOrders);
orderRoutes.get("/my/:orderId", getMyOrder);

