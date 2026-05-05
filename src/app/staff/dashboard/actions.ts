"use server";

import { db as prisma } from "@/lib/db";
import { AttendanceService } from "@/lib/staff/attendance-service";
import { ActivityEngine } from "@/lib/staff/activity-engine";
import { revalidatePath } from "next/cache";

/**
 * Start/Stop Work Session
 */
export async function toggleWorkSession(staffProfileId: string, merchantStoreId: string, userId: string, isActive: boolean, currentWorkLogId?: string) {
  try {
    if (isActive) {
      // Starting work
      const session = await AttendanceService.clockIn(staffProfileId, merchantStoreId, userId);
      revalidatePath("/staff/dashboard/timer");
      return { success: true, workLogId: session.id };
    } else if (currentWorkLogId) {
      // Stopping work
      await AttendanceService.clockOut(currentWorkLogId);
      revalidatePath("/staff/dashboard/timer");
      return { success: true };
    }
    return { success: false, error: "Invalid state" };
  } catch (error) {
    console.error("Failed to toggle session", error);
    return { success: false, error: "Server error" };
  }
}

/**
 * Log Activity Frame
 */
export async function logActivityFrame(workLogId: string, keyboardHits: number, mouseClicks: number) {
  try {
    await ActivityEngine.saveActivityFrame(workLogId, {
      keyboardHits,
      mouseClicks
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to log activity", error);
    return { success: false };
  }
}

/**
 * Submit Leave Request
 */
export async function submitLeaveRequest(data: {
  staffProfileId: string;
  merchantStoreId: string;
  type: string;
  reason: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
}) {
  try {
    const leave = await prisma.leaveRequest.create({
      data: {
        staffProfileId: data.staffProfileId,
        merchantStoreId: data.merchantStoreId,
        type: data.type,
        reason: data.reason,
        startDate: data.startDate,
        endDate: data.endDate,
        totalDays: data.totalDays,
        status: "PENDING"
      }
    });
    revalidatePath("/staff/dashboard/timer");
    return { success: true, id: leave.id };
  } catch (error) {
    console.error("Failed to submit leave", error);
    return { success: false, error: "Server error" };
  }
}
