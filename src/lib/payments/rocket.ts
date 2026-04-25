import { IPaymentProvider, PaymentInitResponse, PaymentProviderConfig, PaymentRequest, PaymentVerifyResponse } from "./types";

export class RocketProvider implements IPaymentProvider {
  name = "ROCKET";

  private getBaseUrl(isTestMode: boolean) {
    return isTestMode 
      ? "https://sandbox.dbbl.com.bd/rocket-api" 
      : "https://api.dbbl.com.bd/rocket-api";
  }

  async initializePayment(config: PaymentProviderConfig, request: PaymentRequest): Promise<PaymentInitResponse> {
    // Rocket/DBBL usually uses a SOAP or a restricted REST API. 
    // Here we implement the redirection-based flow used by most aggregators.
    try {
      const body = {
        merchant_id: config.merchantId,
        password: config.apiSecret,
        amount: request.amount,
        order_id: request.orderId,
        callback_url: request.callbackUrl
      };

      // Simulated API call to Rocket/DBBL Gateway
      const response = await fetch(`${this.getBaseUrl(config.isTestMode)}/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.status === "success" && data.url) {
        return {
          success: true,
          gatewayUrl: data.url,
          paymentId: data.session_id
        };
      }

      return {
        success: false,
        error: "Rocket gateway is currently unavailable or invalid credentials."
      };
    } catch (error: any) {
      return { success: false, error: "Rocket Error: " + error.message };
    }
  }

  async verifyPayment(config: PaymentProviderConfig, paymentId: string): Promise<PaymentVerifyResponse> {
    try {
      const response = await fetch(`${this.getBaseUrl(config.isTestMode)}/verify/${paymentId}`);
      const data = await response.json();

      if (data.status === "paid") {
        return {
          success: true,
          status: "SUCCESS",
          amount: data.amount,
          trxId: data.transaction_id,
          rawResponse: data
        };
      }
      return { success: false, status: "FAILED", amount: 0, trxId: "" };
    } catch (error: any) {
      return { success: false, status: "FAILED", amount: 0, trxId: "", error: error.message };
    }
  }
}
