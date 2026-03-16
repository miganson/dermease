import { Router } from "express";
import { completePayment, createPaymentSession } from "../controllers/payment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

export const paymentRoutes = Router();

paymentRoutes.use(authenticate);
paymentRoutes.post("/session", createPaymentSession);
paymentRoutes.post("/:transactionId/complete", completePayment);

