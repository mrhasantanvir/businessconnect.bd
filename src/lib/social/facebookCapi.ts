import crypto from "crypto";

/**
 * Facebook Conversions API (CAPI) Helper
 * Standardizes server-side event reporting for Meta Ads ROI tracking.
 */

interface UserData {
  email?: string;
  phone?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string; // Facebook Click ID
  fbp?: string; // Facebook Browser ID
}

interface EventData {
  eventName: "Purchase" | "AddToCart" | "InitiateCheckout" | "ViewContent" | "Lead";
  pixelId: string;
  accessToken: string;
  testEventCode?: string;
  userData: UserData;
  customData?: Record<string, any>;
  eventSourceUrl: string;
}

/**
 * SHA256 Hashing for PII as required by Meta
 */
function hashData(data: string | undefined): string | undefined {
  if (!data) return undefined;
  return crypto.createHash("sha256").update(data.trim().toLowerCase()).digest("hex");
}

/**
 * Send a server-side event to Meta Conversions API
 */
export async function sendFacebookCapiEvent({
  eventName,
  pixelId,
  accessToken,
  testEventCode,
  userData,
  customData,
  eventSourceUrl
}: EventData) {
  try {
    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          event_source_url: eventSourceUrl,
          user_data: {
            em: hashData(userData.email),
            ph: hashData(userData.phone),
            client_ip_address: userData.clientIpAddress,
            client_user_agent: userData.clientUserAgent,
            fbc: userData.fbc,
            fbp: userData.fbp
          },
          custom_data: {
            currency: "BDT",
            ...customData
          },
          ...(testEventCode ? { test_event_code: testEventCode } : {})
        }
      ]
    };

    const response = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("[CAPI Error]:", result);
      return { success: false, error: result };
    }

    return { success: true, result };
  } catch (error: any) {
    console.error("[CAPI Exception]:", error.message);
    return { success: false, error: error.message };
  }
}
