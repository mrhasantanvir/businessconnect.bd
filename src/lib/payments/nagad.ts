import { IPaymentProvider, PaymentInitResponse, PaymentProviderConfig, PaymentRequest, PaymentVerifyResponse } from "./types";
import crypto from "crypto";

export class NagadProvider implements IPaymentProvider {
  name = "NAGAD";

  private getBaseUrl(isTestMode: boolean) {
    return isTestMode 
      ? "https://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs" 
      : "https://api.mynagad.com/remote-payment-gateway-1.0/api/dfs";
  }

  // Nagad requires sensitive data encryption. 
  // In a real production environment, we use PGP/RSA with the provided keys.
  private encrypt(data: string, publicKey: string): string {
    const buffer = Buffer.from(data);
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      buffer
    );
    return encrypted.toString("base64");
  }

  async initializePayment(config: PaymentProviderConfig, request: PaymentRequest): Promise<PaymentInitResponse> {
    const baseUrl = this.getBaseUrl(config.isTestMode);
    
    // 1. Initialize (Check-in)
    // 2. Encrypt sensitive data
    // 3. Complete payment session
    
    // Note: Nagad integration is highly stateful. 
    // Here we implement the standard flow structure.
    
    try {
      const dateTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
      const sensitiveData = JSON.stringify({
        merchantId: config.merchantId,
        datetime: dateTime,
        orderId: request.orderId,
        amount: request.amount.toString(),
      });

      // For the sake of this implementation, we assume the keys are valid RSA keys.
      // If encryption fails, we'll return a helpful error.
      
      const res = await fetch(`${baseUrl}/check-out/initialize/${config.merchantId}/${request.orderId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-KM-Api-Version": "v1.0.0",
          "X-KM-IP-V4": "127.0.0.1",
          "X-KM-Client-Type": "PC_WEB",
        }
      });

      const data = await res.json();

      if (data.call_back_url) {
        return {
          success: true,
          gatewayUrl: data.call_back_url, // Simplified for this demo
          paymentId: request.orderId
        };
      }

      return {
        success: false,
        error: data.message || "Nagad Initialization Failed"
      };
    } catch (error: any) {
      return { success: false, error: "Nagad Error: " + error.message };
    }
  }

  async verifyPayment(config: PaymentProviderConfig, paymentId: string): Promise<PaymentVerifyResponse> {
    const baseUrl = this.getBaseUrl(config.isTestMode);
    try {
      const res = await fetch(`${baseUrl}/verify/payment/${paymentId}`, {
        headers: {
          "X-KM-Api-Version": "v1.0.0",
          "X-KM-Client-Type": "PC_WEB",
        }
      });
      const data = await res.json();

      if (data.status === "Success") {
        return {
          success: true,
          status: "SUCCESS",
          amount: parseFloat(data.amount),
          trxId: data.issuer_payment_ref,
          rawResponse: data
        };
      }

      return {
        success: false,
        status: "FAILED",
        amount: 0,
        trxId: "",
        rawResponse: data
      };
    } catch (error: any) {
      return { success: false, status: "FAILED", amount: 0, trxId: "", error: error.message };
    }
  }
}
