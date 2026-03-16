import type { NextFunction, Request, Response } from "express";
import { UserModel } from "../models/User.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { ApiError } from "../utils/apiError.js";
import type { UserRole } from "../lib/constants.js";

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  if (!token) {
    return next(new ApiError(401, "Authentication required"));
  }

  try {
    const payload = verifyAccessToken(token);
    req.auth = payload;

    const currentUser = await UserModel.findById(payload.sub);
    if (!currentUser) {
      return next(new ApiError(401, "User not found"));
    }

    req.currentUser = currentUser;
    return next();
  } catch {
    return next(new ApiError(401, "Invalid or expired token"));
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      return next(new ApiError(401, "Authentication required"));
    }

    if (!roles.includes(req.auth.role)) {
      return next(new ApiError(403, "You are not allowed to perform this action"));
    }

    return next();
  };
}

