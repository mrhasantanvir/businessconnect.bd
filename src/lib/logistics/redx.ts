import { CourierProvider, TrackingResult, TrackingStatus, TrackingEvent } from "./hub";

export const redxProvider: CourierProvider = {
  name: "RedX",
  
  detect: (trackingNumber: string) => trackingNumber.toUpperCase().startsWith("RDX"),

  track: async (trackingNumber: string): Promise<TrackingResult> => {
    try {
      const response = await fetch(`https://api-courier.redx.com.bd/v1/parcel/track/${trackingNumber}`);
      if (!response.ok) throw new Error("RedX API unreachable");
      
      const data = await response.json();
      
      // Map RedX status strings to our unified TrackingStatus type
      const mapStatus = (s: string): TrackingStatus => {
        const status = s.toLowerCase();
        if (status.includes("delivered")) return "DELIVERED";
        if (status.includes("pickup") || status.includes("picked")) return "PICKED_UP";
        if (status.includes("transit")) return "IN_TRANSIT";
        if (status.includes("out for delivery")) return "OUT_FOR_DELIVERY";
        if (status.includes("returned")) return "RETURNED";
        if (status.includes("cancelled")) return "CANCELLED";
        return "IN_TRANSIT";
      };

      const events: TrackingEvent[] = (data.tracking_details || []).map((event: any) => ({
        timestamp: event.created_at || new Date().toISOString(),
        status: mapStatus(event.status_text || event.status),
        location: event.hub_name || "RedX Hub",
        description: event.message || event.status_text
      }));

      return {
        provider: "RedX",
        trackingNumber,
        currentStatus: events.length > 0 ? events[0].status : "PENDING",
        isDelivered: events.some(e => e.status === "DELIVERED"),
        events: events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      };
    } catch (error) {
      console.error("RedX API Error:", error);
      return {
        provider: "RedX",
        trackingNumber,
        currentStatus: "UNKNOWN",
        isDelivered: false,
        events: []
      };
    }
  }
};
