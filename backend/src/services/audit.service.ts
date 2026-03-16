import { AuditLogModel } from "../models/AuditLog.js";
import type { AuditLogPayload } from "../types/api.js";

export async function createAuditLog(payload: AuditLogPayload) {
  return AuditLogModel.create({
    actor: payload.actorId,
    actorRole: payload.actorRole,
    action: payload.action,
    entityType: payload.entityType,
    entityId: payload.entityId,
    summary: payload.summary,
    meta: payload.meta
  });
}

