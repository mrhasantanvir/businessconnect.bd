import { db as prisma } from '@/lib/db';
import { consumeSms, consumeSipMinutes, logConsumption } from '@/lib/billing';

export class CommunicationService {
  /**
   * Sends SMS and deducts balance using the billing utility.
   */
  static async sendSms(merchantStoreId: string, to: string, message: string) {
    try {
      // 1. Consume Balance (Will throw error if insufficient)
      await consumeSms(merchantStoreId, 1);

      // 2. Optional: Get Global Provider Settings
      const settings = await prisma.systemSettings.findUnique({
        where: { id: "GLOBAL" }
      });

      // 3. Gateway logic
      console.log(`[GATEWAY: ${settings?.smsActiveProvider || 'DEFAULT'}] Sending SMS to ${to}: "${message}"`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await logConsumption(merchantStoreId, "SMS", 1, `Sent to ${to}`);

      return {
        success: true,
        message: "SMS sent successfully and balance deducted."
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Finalizes a SIP call and deducts balance based on duration.
   */
  static async finalizeSipCall(merchantStoreId: string, to: string, durationSeconds: number) {
    try {
      // 1. Consume Minutes (Rounded up)
      await consumeSipMinutes(merchantStoreId, durationSeconds);
      
      await logConsumption(merchantStoreId, "SIP", durationSeconds, `Call to ${to}`);

      return {
        success: true,
        message: "SIP balance adjusted based on call duration."
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
