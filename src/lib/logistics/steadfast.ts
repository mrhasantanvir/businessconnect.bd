import { CourierProvider, TrackingResult, TrackingStatus, TrackingEvent } from "./hub";

/**
 * Steadfast Courier API Integration Helper
 * Used for automated parcel booking in Bangladesh.
 */

const STEADFAST_BASE_URL = "https://portal.steadfast.com.bd/api/v1";

export interface SteadfastParcelData {
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  note?: string;
}

export async function createSteadfastOrder(apiKey: string, secretKey: string, data: SteadfastParcelData) {
  try {
    const response = await fetch(`${STEADFAST_BASE_URL}/create_order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": apiKey,
        "Secret-Key": secretKey,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (result.status === 200) {
      return {
        success: true,
        consignment_id: result.consignment_id,
        tracking_code: result.tracking_code,
      };
    } else {
      return {
        success: false,
        message: result.errors || "Failed to create order in Steadfast",
      };
    }
  } catch (error) {
    console.error("Steadfast API Error:", error);
    return { success: false, message: "Network error with Steadfast API" };
  }
}

export async function checkSteadfastStatusByConsignmentId(apiKey: string, secretKey: string, id: string) {
  try {
    const response = await fetch(`${STEADFAST_BASE_URL}/status_by_consignment_id/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": apiKey,
        "Secret-Key": secretKey,
      }
    });

    return await response.json();
  } catch (error) {
    console.error("Steadfast Status Error:", error);
    return { status: 500, message: "Network error" };
  }
}

export async function checkSteadfastStatusByTrackingCode(apiKey: string, secretKey: string, code: string) {
  try {
    const response = await fetch(`${STEADFAST_BASE_URL}/status_by_tracking_code/${code}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": apiKey,
        "Secret-Key": secretKey,
      }
    });

    return await response.json();
  } catch (error) {
    console.error("Steadfast Status Error:", error);
    return { status: 500, message: "Network error" };
  }
}

/**
 * Global Customer Performance Check
 */
export async function checkCustomerGlobalStatus(apiKey: string, secretKey: string, phone: string) {
  // If no real keys or DEMO mode, simulate
  if (!apiKey || apiKey === "DEMO" || !secretKey) {
     return {
        status: 200,
        total_delivered: Math.floor(Math.random() * 50) + 10,
        total_returned: Math.floor(Math.random() * 10),
        total_cancelled: Math.floor(Math.random() * 5)
     };
  }

  try {
    const response = await fetch(`${STEADFAST_BASE_URL}/checking?phone=${phone}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": apiKey,
        "Secret-Key": secretKey,
      }
    });

    return await response.json();
  } catch (error) {
    console.error("Steadfast Check Error:", error);
    return { status: 500, message: "Network error" };
  }
}

export const steadfastProvider: CourierProvider = {
  name: "Steadfast",
  
  detect: (trackingNumber: string) => trackingNumber.toUpperCase().startsWith("SF") || /^\d{8,}$/.test(trackingNumber),

  track: async (trackingNumber: string): Promise<TrackingResult> => {
    try {
      // In a real SaaS scenario, we would fetch the merchant's API keys from the database.
      // For the global tracking hub, we might use a system key or require keys to be passed.
      // Here we use DEMO if no keys provided, as seen in the previous implementation.
      const result = await checkSteadfastStatusByTrackingCode("DEMO", "DEMO", trackingNumber);

      const statusMap: Record<string, TrackingStatus> = {
        'delivered': 'DELIVERED',
        'cancelled': 'CANCELLED',
        'returned': 'RETURNED',
        'in_transit': 'IN_TRANSIT',
        'pending': 'PENDING',
        'out_for_delivery': 'OUT_FOR_DELIVERY'
      };

      const events: TrackingEvent[] = [
        {
          timestamp: new Date().toISOString(),
          status: statusMap[result.status] || 'IN_TRANSIT',
          description: `Steadfast Status: ${result.status || 'Processing'}`,
          location: "Steadfast Network"
        }
      ];

      return {
        provider: "Steadfast",
        trackingNumber,
        currentStatus: statusMap[result.status] || 'UNKNOWN',
        isDelivered: result.status === 'delivered',
        events
      };
    } catch (error) {
      console.error("Steadfast Tracking Error:", error);
      return {
        provider: "Steadfast",
        trackingNumber,
        currentStatus: "UNKNOWN",
        isDelivered: false,
        events: []
      };
    }
  }
};
