import { IPaymentProvider, PaymentInitResponse, PaymentProviderConfig, PaymentRequest, PaymentVerifyResponse } from "./types";

export class BkashProvider implements IPaymentProvider {
  name = "BKASH";

  private getBaseUrl(isTestMode: boolean) {
    return isTestMode 
      ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta" 
      : "https://tokenized.pay.bka.sh/v1.2.0-beta";
  }

  private async getToken(config: PaymentProviderConfig): Promise<string> {
    const res = await fetch(`${this.getBaseUrl(config.isTestMode)}/tokenized/checkout/token/grant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "username": config.apiKey || "",
        "password": config.apiSecret || "",
      },
      body: JSON.stringify({
        app_key: config.publicKey,
        app_secret: config.privateKey,
      }),
    });

    const data = await res.json();
    if (data.id_token) return data.id_token;
    throw new Error("bKash Auth Failed: " + (data.statusMessage || "Invalid Credentials"));
  }

  async initializePayment(config: PaymentProviderConfig, request: PaymentRequest): Promise<PaymentInitResponse> {
    try {
      const token = await this.getToken(config);
      
      const res = await fetch(`${this.getBaseUrl(config.isTestMode)}/tokenized/checkout/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-APP-Key": config.publicKey || "",
        },
        body: JSON.stringify({
          mode: "0011",
          payerReference: "Order_" + request.orderId,
          callbackURL: request.callbackUrl,
          amount: request.amount.toString(),
          currency: "BDT",
          intent: "sale",
          merchantInvoiceNumber: request.orderId,
        }),
      });

      const data = await res.json();
      if (data.statusCode === "0000" && data.bkashURL) {
        return {
          success: true,
          gatewayUrl: data.bkashURL,
          paymentId: data.paymentID
        };
      }

      return {
        success: false,
        error: data.statusMessage || "bKash Creation Failed"
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async verifyPayment(config: PaymentProviderConfig, paymentId: string): Promise<PaymentVerifyResponse> {
    try {
      const token = await this.getToken(config);

      const res = await fetch(`${this.getBaseUrl(config.isTestMode)}/tokenized/checkout/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-APP-Key": config.publicKey || "",
        },
        body: JSON.stringify({ paymentId }),
      });

      const data = await res.json();

      if (data.statusCode === "0000" && data.transactionStatus === "Completed") {
        return {
          success: true,
          status: "SUCCESS",
          amount: parseFloat(data.amount),
          trxId: data.trxID,
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
