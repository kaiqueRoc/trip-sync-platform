import type { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function writeAuditLog(params: {
  organizationId: string;
  userId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      organizationId: params.organizationId,
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    },
  });
}
