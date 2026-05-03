import { db as prisma } from '@/lib/db';
import { consumeSms, consumeSipMinutes, logConsumption } from '@/lib/billing';

export class CommunicationService {
  /**
   * Sends SMS and deducts balance using the billing utility.
   */
  static async sendSms(merchantStoreId: string, to: string, message: string) {
    try {
      // 1. Consume Balance (Optional check, usually for merchants)
      if (merchantStoreId !== "SYSTEM") {
        await consumeSms(merchantStoreId, 1);
      }

      // 2. Get Global Provider Settings
      const settings = await prisma.systemSettings.findUnique({
        where: { id: "GLOBAL" }
      });

      const provider = settings?.smsActiveProvider || "MOCK";
      
      if (provider === "SSLCOMMERZ") {
        if (!settings?.smsApiKey) {
          throw new Error("SSLCOMMERZ API Key is not configured in Global Settings.");
        }

        const phoneNo = to.replace(/[^0-9]/g, "");
        const finalPhone = phoneNo.startsWith('88') ? phoneNo : `88${phoneNo}`;
        
        const payload = {
          api_token: settings.smsApiKey,
          sid: settings.smsSenderId || "RAJBRAND",
          msisdn: finalPhone,
          sms: message,
          csms_id: `BC${Date.now().toString().slice(-8)}`
        };

        console.log(`[SMS DEBUG] Sending to ${finalPhone} via SSLCOMMERZ.`);

        const response = await fetch(settings.smsApiUrl || "https://smsplus.sslwireless.com/api/v3/send-sms", {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json' 
          },
          body: JSON.stringify(payload)
        });

        const rawResponse = await response.text();
        console.log(`[SMS DEBUG] SSLCOMMERZ Response:`, rawResponse);

        let result;
        try {
          result = JSON.parse(rawResponse);
        } catch (e) {
          throw new Error(`Invalid JSON response from SMS gateway: ${rawResponse.slice(0, 100)}`);
        }

        // SSL Wireless v3 usually returns { status: "SUCCESS", status_code: 200, ... }
        if (result.status !== "SUCCESS" && result.status_code !== 200) {
          throw new Error(result.error_message || result.status || "Failed to send SMS via SSLCommerz");
        }
      } else if (provider === "FIREBASE") {
          // Firebase usually handles its own OTP flow on the client side
          console.log("[SMS] Firebase Auth provider selected. Server-side sending skipped.");
          return { success: true, message: "Firebase selected. Please use client-side verification." };
      } else {
        // Fallback for other providers or mock
        console.log(`[GATEWAY: ${provider}] Mock Sending SMS to ${to}: "${message}"`);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (provider !== "MOCK" && !settings?.smsApiKey) {
           throw new Error(`${provider} is selected but API Key is missing.`);
        }
      }
      
      if (merchantStoreId !== "SYSTEM") {
        await logConsumption(merchantStoreId, "SMS", 1, `Sent to ${to}`);
      }

      return {
        success: true,
        message: provider === "MOCK" ? "Test SMS processed (Mock Mode)." : "SMS sent successfully."
      };
    } catch (error: any) {
      console.error("SMS Sending Error:", error);
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
