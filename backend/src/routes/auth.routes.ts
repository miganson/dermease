import { Router } from "express";
import {
  forgotPassword,
  getMe,
  login,
  logout,
  refreshToken,
  register,
  resetPassword,
  updateProfile
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

export const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/forgot-password", forgotPassword);
authRoutes.post("/reset-password", resetPassword);
authRoutes.post("/refresh", refreshToken);
authRoutes.post("/logout", logout);
authRoutes.get("/me", authenticate, getMe);
authRoutes.patch("/profile", authenticate, updateProfile);
