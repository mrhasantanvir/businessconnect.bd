import { db as prisma } from "@/lib/db";
import { differenceInMinutes } from "date-fns";

/**
 * Attendance Service
 * Manages automated clock-in/out and timesheet data.
 */
export class AttendanceService {
  
  /**
   * Clock In
   * Starts a new work session for the staff.
   */
  static async clockIn(staffProfileId: string, merchantStoreId: string, userId: string) {
    // Check if there's already an active session
    const activeSession = await prisma.staffWorkLog.findFirst({
      where: {
        staffProfileId,
        status: "ACTIVE"
      }
    });

    if (activeSession) {
      return activeSession; // Already clocked in
    }

    return await prisma.staffWorkLog.create({
      data: {
        staffProfileId,
        merchantStoreId,
        userId,
        status: "ACTIVE",
        startTime: new Date(),
      }
    });
  }

  /**
   * Clock Out
   * Ends the active work session and calculates total time.
   */
  static async clockOut(workLogId: string) {
    const session = await prisma.staffWorkLog.findUnique({
      where: { id: workLogId }
    });

    if (!session || session.status === "COMPLETED") return session;

    const endTime = new Date();
    const totalMinutes = differenceInMinutes(endTime, session.startTime);

    const updated = await prisma.staffWorkLog.update({
      where: { id: workLogId },
      data: {
        endTime,
        totalMinutes,
        status: "COMPLETED"
      }
    });

    // Update staff profile total minutes
    await prisma.staffProfile.update({
      where: { id: session.staffProfileId },
      data: {
        totalMinutesWorked: { increment: totalMinutes },
        attendance: { increment: 1 } // Increment days worked if it's the first session today
      }
    });

    return updated;
  }
}
