import { db as prisma } from "@/lib/db";

export interface ActivityData {
  keyboardHits: number;
  mouseClicks: number;
}

/**
 * Activity Engine
 * Calculates productivity scores based on user interaction metrics.
 */
export class ActivityEngine {
  
  /**
   * Calculate Activity Score
   * Normalizes keyboard/mouse activity into a 0-100 percentage.
   * Hubstaff-style: 100% means continuous activity.
   */
  static calculateScore(data: ActivityData): number {
    // Thresholds for "Peak Activity"
    // Assuming a 10-minute frame
    const MAX_KEYBOARD_HITS = 1000; // ~100 chars/min
    const MAX_MOUSE_CLICKS = 300;   // ~30 clicks/min
    
    const kScore = Math.min((data.keyboardHits / MAX_KEYBOARD_HITS) * 100, 100);
    const mScore = Math.min((data.mouseClicks / MAX_MOUSE_CLICKS) * 100, 100);
    
    // Weighted Average (60% Keyboard, 40% Mouse)
    const rawScore = (kScore * 0.6) + (mScore * 0.4);
    
    return Math.round(rawScore);
  }

  /**
   * Process and save an activity frame
   */
  static async saveActivityFrame(workLogId: string, data: ActivityData & { screenshotUrl?: string }) {
    const score = this.calculateScore(data);
    
    const frame = await prisma.staffActivityFrame.create({
      data: {
        workLogId,
        keyboardHits: data.keyboardHits,
        mouseClicks: data.mouseClicks,
        activityScore: score,
        screenshotUrl: data.screenshotUrl,
      }
    });

    // Update the average score in the work log
    await this.updateWorkLogAverage(workLogId);

    return frame;
  }

  /**
   * Update the rolling average for the entire work session
   */
  private static async updateWorkLogAverage(workLogId: string) {
    const frames = await prisma.staffActivityFrame.findMany({
      where: { workLogId },
      select: { activityScore: true }
    });

    if (frames.length === 0) return;

    const totalScore = frames.reduce((acc, f) => acc + f.activityScore, 0);
    const avgScore = totalScore / frames.length;

    await prisma.staffWorkLog.update({
      where: { id: workLogId },
      data: { activityScore: Math.round(avgScore) }
    });
  }
}
