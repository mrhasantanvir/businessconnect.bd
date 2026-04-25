export interface ParcelData {
  invoiceId: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  codAmount: number;
  note?: string;
}

export interface CourierService {
  createParcel(data: ParcelData): Promise<{ trackingCode: string; status: string; rawResponse: any }>;
  trackParcel(trackingCode: string): Promise<{ status: string; lastUpdate: string }>;
}

export class SteadfastService implements CourierService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = "https://portal.steadfast.com.bd/api/v1";

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  async createParcel(data: ParcelData) {
    // In real implementation, call fetch()
    console.log(`>>> [STEADFAST] Creating Parcel for Invoice: ${data.invoiceId}`);
    
    // Mock response
    return {
      trackingCode: `ST-${Math.random().toString(36).toUpperCase().slice(2, 10)}`,
      status: "SUCCESS",
      rawResponse: { message: "Parcel Created Successfully" }
    };
  }

  async trackParcel(trackingCode: string) {
    return {
      status: "PICKED_UP",
      lastUpdate: new Date().toISOString()
    };
  }
}

export class RedXService implements CourierService {
  private apiKey: string;
  private baseUrl = "https://api.redx.com.bd/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createParcel(data: ParcelData) {
    console.log(`>>> [REDX] Creating Parcel for Invoice: ${data.invoiceId}`);
    return {
      trackingCode: `RX-${Math.random().toString(36).toUpperCase().slice(2, 10)}`,
      status: "SUCCESS",
      rawResponse: { message: "Parcel Created Successfully" }
    };
  }

  async trackParcel(trackingCode: string) {
    return {
      status: "IN_TRANSIT",
      lastUpdate: new Date().toISOString()
    };
  }
}

export class CourierFactory {
  static getService(provider: string, config: { apiKey?: string; apiSecret?: string }): CourierService | null {
    switch (provider.toUpperCase()) {
      case "STEADFAST":
        if (config.apiKey && config.apiSecret) return new SteadfastService(config.apiKey, config.apiSecret);
        break;
      case "REDX":
        if (config.apiKey) return new RedXService(config.apiKey);
        break;
      default:
        return null;
    }
    return null;
  }
}
