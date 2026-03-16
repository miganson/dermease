import { Schema, model, type Types } from "mongoose";
import type { UserRole } from "../lib/constants.js";

export interface AuditLog {
  actor?: Types.ObjectId;
  actorRole?: UserRole;
  action: string;
  entityType: string;
  entityId?: Types.ObjectId;
  summary: string;
  meta?: Record<string, unknown>;
}

const auditLogSchema = new Schema<AuditLog>(
  {
    actor: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    actorRole: {
      type: String
    },
    action: {
      type: String,
      required: true
    },
    entityType: {
      type: String,
      required: true
    },
    entityId: {
      type: Schema.Types.ObjectId
    },
    summary: {
      type: String,
      required: true
    },
    meta: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

export const AuditLogModel = model<AuditLog>("AuditLog", auditLogSchema);
