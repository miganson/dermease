import bcrypt from "bcryptjs";
import { z } from "zod";
import { UserModel } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { sendSuccess } from "../utils/response.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { createAuditLog } from "../services/audit.service.js";

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  mobileNumber: z.string().min(7),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const register = asyncHandler(async (req, res) => {
  const payload = registerSchema.parse(req.body);

  const existingUser = await UserModel.findOne({ email: payload.email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const user = await UserModel.create({
    fullName: payload.fullName,
    email: payload.email.toLowerCase(),
    mobileNumber: payload.mobileNumber,
    passwordHash,
    role: "customer"
  });

  const tokenPayload = {
    sub: String(user._id),
    role: user.role,
    email: user.email
  };

  await createAuditLog({
    actorId: user._id,
    actorRole: user.role,
    action: "auth.registered",
    entityType: "user",
    entityId: user._id,
    summary: `New ${user.role} account registered`
  });

  return sendSuccess(
    res,
    {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role
      },
      accessToken: signAccessToken(tokenPayload),
      refreshToken: signRefreshToken(tokenPayload)
    },
    "Account created successfully",
    201
  );
});

export const login = asyncHandler(async (req, res) => {
  const payload = loginSchema.parse(req.body);

  const user = await UserModel.findOne({ email: payload.email.toLowerCase() });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isValidPassword = await bcrypt.compare(payload.password, user.passwordHash);
  if (!isValidPassword) {
    throw new ApiError(401, "Invalid email or password");
  }

  user.lastLoginAt = new Date();
  await user.save();

  const tokenPayload = {
    sub: String(user._id),
    role: user.role,
    email: user.email
  };

  await createAuditLog({
    actorId: user._id,
    actorRole: user.role,
    action: "auth.logged_in",
    entityType: "user",
    entityId: user._id,
    summary: `${user.email} logged in`
  });

  return sendSuccess(res, {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      role: user.role
    },
    accessToken: signAccessToken(tokenPayload),
    refreshToken: signRefreshToken(tokenPayload)
  });
});

export const getMe = asyncHandler(async (req, res) => {
  if (!req.currentUser) {
    throw new ApiError(401, "Authentication required");
  }

  return sendSuccess(res, {
    id: req.currentUser._id,
    fullName: req.currentUser.fullName,
    email: req.currentUser.email,
    mobileNumber: req.currentUser.mobileNumber,
    role: req.currentUser.role
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const payload = z
    .object({
      refreshToken: z.string().min(1)
    })
    .parse(req.body);

  const decoded = verifyRefreshToken(payload.refreshToken);
  const user = await UserModel.findById(decoded.sub);

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  const tokenPayload = {
    sub: String(user._id),
    role: user.role,
    email: user.email
  };

  return sendSuccess(res, {
    accessToken: signAccessToken(tokenPayload),
    refreshToken: signRefreshToken(tokenPayload)
  });
});

export const logout = asyncHandler(async (_req, res) => {
  return sendSuccess(res, null, "Logged out successfully");
});

