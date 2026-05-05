import { db as prisma } from '@/lib/db';
import { getAdminMessaging } from '@/lib/firebase-admin';

export class NotificationService {
  /**
   * Sends a push notification to all devices of a specific user.
   */
  static async sendToUser(userId: string, title: string, body: string, data?: Record<string, string>) {
    try {
      // 1. Find all active push tokens for this user
      const tokens = await prisma.pushToken.findMany({
        where: { userId },
        select: { token: true }
      });

      if (tokens.length === 0) {
        console.log(`[NotificationService] No push tokens found for user ${userId}`);
        return { success: false, error: 'No tokens found' };
      }

      const tokenList = tokens.map(t => t.token);

      // 2. Send multicast message via Firebase
      const messaging = await getAdminMessaging();
      const message = {
        notification: { title, body },
        data: data || {},
        tokens: tokenList,
      };

      const response = await messaging.sendEachForMulticast(message);
      
      // 3. Clean up invalid tokens if any
      if (response.failureCount > 0) {
        const invalidTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success && (resp.error?.code === 'messaging/registration-token-not-registered' || resp.error?.code === 'messaging/invalid-registration-token')) {
            invalidTokens.push(tokenList[idx]);
          }
        });

        if (invalidTokens.length > 0) {
          await prisma.pushToken.deleteMany({
            where: { token: { in: invalidTokens } }
          });
          console.log(`[NotificationService] Cleaned up ${invalidTokens.length} invalid tokens for user ${userId}`);
        }
      }

      return { success: true, sentCount: response.successCount };
    } catch (error: any) {
      console.error('[NotificationService] Error sending notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Saves or updates a push token for a user.
   */
  static async saveToken(userId: string, token: string, deviceType: string = 'WEB') {
    try {
      await prisma.pushToken.upsert({
        where: { token },
        update: { userId, deviceType },
        create: { userId, token, deviceType }
      });
      return { success: true };
    } catch (error: any) {
      console.error('[NotificationService] Error saving token:', error);
      return { success: false, error: error.message };
    }
  }
}
