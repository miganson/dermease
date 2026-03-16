import type { HydratedDocument, Types } from "mongoose";
import type { UserRole } from "../lib/constants.js";
import type { User } from "../models/User.js";

export type AuthenticatedUser = HydratedDocument<User>;

export interface RequestUserPayload {
  sub: string;
  role: UserRole;
  email: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface QueryPagination {
  page: number;
  pageSize: number;
}

export interface AuditLogPayload {
  actorId?: Types.ObjectId | string;
  actorRole?: UserRole;
  action: string;
  entityType: string;
  entityId?: Types.ObjectId | string;
  summary: string;
  meta?: Record<string, unknown>;
}

