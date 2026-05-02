import { db as prisma } from "./db";
import { headers } from "next/headers";

export async function logAdminAction(params: {
  adminId: string;
  action: string;
  entity: string;
  entityId?: string;
  merchantStoreId?: string;
  targetUserId?: string;
  metadata?: any;
}) {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") || "unknown";
  const ua = headerList.get("user-agent") || "unknown";

  try {
    await prisma.adminActionLog.create({
      data: {
        adminId: params.adminId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        merchantStoreId: params.merchantStoreId,
        targetUserId: params.targetUserId,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        ipAddress: ip,
        userAgent: ua
      }
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
}
