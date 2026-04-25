import { steadfastProvider } from "./steadfast";

export type TrackingStatus = 
  | "PENDING" 
  | "PICKED_UP" 
  | "IN_TRANSIT" 
  | "OUT_FOR_DELIVERY" 
  | "DELIVERED" 
  | "RETURNED" 
  | "CANCELLED" 
  | "UNKNOWN";

export interface TrackingEvent {
  timestamp: string;
  status: TrackingStatus;
  location?: string;
  description?: string;
}

export interface TrackingResult {
  provider: string;
  trackingNumber: string;
  currentStatus: TrackingStatus;
  isDelivered: boolean;
  events: TrackingEvent[];
}

export interface CourierProvider {
  name: string;
  track: (trackingNumber: string) => Promise<TrackingResult>;
  detect: (trackingNumber: string) => boolean;
}

import { redxProvider } from "./redx";
import { pathaoProvider } from "./pathao";

class LogisticsHub {
  private providers: CourierProvider[] = [
    redxProvider,
    pathaoProvider,
    steadfastProvider
  ];

  registerProvider(provider: CourierProvider) {
    this.providers.push(provider);
  }

  detectProvider(trackingNumber: string): CourierProvider | null {
    if (!trackingNumber) return null;
    
    // Auto-detection logic
    if (trackingNumber.toUpperCase().startsWith("RDX")) return this.findProvider("RedX");
    if (trackingNumber.toUpperCase().startsWith("SF") || /^\d{8,}$/.test(trackingNumber)) return this.findProvider("Steadfast");
    if (trackingNumber.toUpperCase().startsWith("PATHAO") || trackingNumber.length === 10) return this.findProvider("Pathao");
    
    return null;
  }

  private findProvider(name: string): CourierProvider | null {
    return this.providers.find(p => p.name.toLowerCase() === name.toLowerCase()) || null;
  }

  async getTracking(trackingNumber: string, providerName?: string): Promise<TrackingResult | null> {
    const provider = providerName 
      ? this.findProvider(providerName) 
      : this.detectProvider(trackingNumber);

    if (!provider) return null;

    try {
      return await provider.track(trackingNumber);
    } catch (error) {
      console.error(`Tracking failed for ${provider.name}:`, error);
      return null;
    }
  }
}

export const logisticsHub = new LogisticsHub();
