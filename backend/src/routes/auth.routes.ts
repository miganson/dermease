import { Router } from "express";
import { getMe, login, logout, refreshToken, register } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

export const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/refresh", refreshToken);
authRoutes.post("/logout", logout);
authRoutes.get("/me", authenticate, getMe);

