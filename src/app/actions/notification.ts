"use server";

import { getSession } from "@/lib/auth";
import { NotificationService } from "@/services/NotificationService";

export async function savePushTokenAction(token: string, deviceType: string = 'WEB') {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    return await NotificationService.saveToken(session.id, token, deviceType);
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
