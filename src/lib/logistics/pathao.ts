import { CourierProvider, TrackingResult, TrackingStatus, TrackingEvent } from "./hub";

export const pathaoProvider: CourierProvider = {
  name: "Pathao",
  
  detect: (trackingNumber: string) => trackingNumber.toUpperCase().startsWith("PATHAO") || (trackingNumber.length >= 8 && /^\d+$/.test(trackingNumber)),

  track: async (trackingNumber: string): Promise<TrackingResult> => {
    try {
      // Pathao's public tracking often requires the tracking code.
      // Official API: https://api-courier.pathao.com/aladdin/api/v1/track?tracking_code=...
      const response = await fetch(`https://api-courier.pathao.com/aladdin/api/v1/track?tracking_code=${trackingNumber}`);
      
      if (!response.ok) throw new Error("Pathao API unreachable");
      const data = await response.json();

      const mapStatus = (s: string): TrackingStatus => {
        const status = s.toLowerCase();
        if (status.includes("delivered")) return "DELIVERED";
        if (status.includes("picked")) return "PICKED_UP";
        if (status.includes("transit")) return "IN_TRANSIT";
        if (status.includes("delivery")) return "OUT_FOR_DELIVERY";
        if (status.includes("returned")) return "RETURNED";
        if (status.includes("cancelled")) return "CANCELLED";
        return "IN_TRANSIT";
      };

      const events: TrackingEvent[] = (data.data?.history || []).map((h: any) => ({
        timestamp: h.time || new Date().toISOString(),
        status: mapStatus(h.status_text || h.status),
        description: h.message || h.status_text,
        location: h.location || "Pathao Network"
      }));

      return {
        provider: "Pathao",
        trackingNumber,
        currentStatus: events.length > 0 ? events[0].status : "PENDING",
        isDelivered: events.some(e => e.status === "DELIVERED"),
        events: events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      };
    } catch (error) {
      console.error("Pathao API Error:", error);
      return {
        provider: "Pathao",
        trackingNumber,
        currentStatus: "UNKNOWN",
        isDelivered: false,
        events: []
      };
    }
  }
};
