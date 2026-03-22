import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { z } from "zod";
import { UserModel } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { sendSuccess } from "../utils/response.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { createAuditLog } from "../services/audit.service.js";
import {
  fullNameMessage,
  fullNameRegex,
  passwordMessage,
  passwordRegex
} from "../lib/validation.js";

const registerSchema = z.object({
  fullName: z.string().trim().min(2).regex(fullNameRegex, fullNameMessage),
  email: z.string().email(),
  mobileNumber: z.string().min(7),
  password: z.string().regex(passwordRegex, passwordMessage),
  acceptedDataPrivacy: z
    .boolean()
    .refine((value) => value, "You must agree to the data privacy notice before signing up.")
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).regex(fullNameRegex, fullNameMessage),
  mobileNumber: z.string().min(7)
});

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

const resetPasswordSchema = z
  .object({
    email: z.string().email(),
    resetCode: z.string().regex(/^\d{6}$/, "Reset code must be 6 digits."),
    newPassword: z.string().regex(passwordRegex, passwordMessage),
    confirmPassword: z.string().min(8)
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match"
  });

function hashResetCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function generateResetCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

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
    acceptedDataPrivacyAt: new Date(),
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

export const updateProfile = asyncHandler(async (req, res) => {
  if (!req.currentUser) {
    throw new ApiError(401, "Authentication required");
  }

  const payload = updateProfileSchema.parse(req.body);

  req.currentUser.fullName = payload.fullName;
  req.currentUser.mobileNumber = payload.mobileNumber;
  await req.currentUser.save();

  await createAuditLog({
    actorId: req.currentUser._id,
    actorRole: req.currentUser.role,
    action: "auth.profile.updated",
    entityType: "user",
    entityId: req.currentUser._id,
    summary: `${req.currentUser.email} updated their profile`
  });

  return sendSuccess(res, {
    id: req.currentUser._id,
    fullName: req.currentUser.fullName,
    email: req.currentUser.email,
    mobileNumber: req.currentUser.mobileNumber,
    role: req.currentUser.role
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const payload = forgotPasswordSchema.parse(req.body);
  const user = await UserModel.findOne({ email: payload.email.toLowerCase() });

  if (!user) {
    return sendSuccess(res, {
      email: payload.email.toLowerCase(),
      mockResetCode: null,
      expiresAt: null
    }, "If the account exists, a mock reset code has been prepared.");
  }

  const resetCode = generateResetCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  user.passwordResetCodeHash = hashResetCode(resetCode);
  user.passwordResetExpiresAt = expiresAt;
  await user.save();

  await createAuditLog({
    actorId: user._id,
    actorRole: user.role,
    action: "auth.password_reset.requested",
    entityType: "user",
    entityId: user._id,
    summary: `${user.email} requested a password reset`
  });

  return sendSuccess(
    res,
    {
      email: user.email,
      mockResetCode: resetCode,
      expiresAt
    },
    "Mock reset code generated. Use it in the reset form below."
  );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const payload = resetPasswordSchema.parse(req.body);
  const user = await UserModel.findOne({ email: payload.email.toLowerCase() });

  if (!user || !user.passwordResetCodeHash || !user.passwordResetExpiresAt) {
    throw new ApiError(400, "No valid reset request was found for this account");
  }

  if (user.passwordResetExpiresAt.getTime() < Date.now()) {
    user.passwordResetCodeHash = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();
    throw new ApiError(400, "Reset code has expired. Please request a new one.");
  }

  const submittedHash = hashResetCode(payload.resetCode);
  if (submittedHash !== user.passwordResetCodeHash) {
    throw new ApiError(400, "Reset code is invalid");
  }

  user.passwordHash = await bcrypt.hash(payload.newPassword, 10);
  user.passwordResetCodeHash = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();

  await createAuditLog({
    actorId: user._id,
    actorRole: user.role,
    action: "auth.password_reset.completed",
    entityType: "user",
    entityId: user._id,
    summary: `${user.email} reset their password`
  });

  return sendSuccess(res, null, "Password reset successful. You can now sign in with your new password.");
});
