import { IPaymentProvider, PaymentInitResponse, PaymentProviderConfig, PaymentRequest, PaymentVerifyResponse } from "./types";

export class AamarPayProvider implements IPaymentProvider {
  name = "AAMARPAY";

  private getBaseUrl(isTestMode: boolean) {
    return isTestMode 
      ? "https://sandbox.aamarpay.com" 
      : "https://secure.aamarpay.com";
  }

  async initializePayment(config: PaymentProviderConfig, request: PaymentRequest): Promise<PaymentInitResponse> {
    const url = `${this.getBaseUrl(config.isTestMode)}/jsonpost.php`;
    
    const body = {
      store_id: config.storeId,
      signature_key: config.apiSecret,
      tran_id: request.orderId,
      success_url: request.successUrl,
      fail_url: request.failUrl,
      cancel_url: request.cancelUrl,
      amount: request.amount.toString(),
      currency: "BDT",
      desc: "Payment for Order #" + request.orderId,
      cus_name: request.customerName,
      cus_email: request.customerEmail,
      cus_phone: request.customerPhone,
      type: "json"
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.result === "true" && data.payment_url) {
        return {
          success: true,
          gatewayUrl: data.payment_url,
          paymentId: request.orderId
        };
      }

      return {
        success: false,
        error: data.error || "AamarPay Initialization Failed"
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async verifyPayment(config: PaymentProviderConfig, trxId: string): Promise<PaymentVerifyResponse> {
    const url = `${this.getBaseUrl(config.isTestMode)}/api/v1/trxcheck/request.php?request_id=${trxId}&store_id=${config.storeId}&signature_key=${config.apiSecret}&type=json`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.pay_status === "Successful") {
        return {
          success: true,
          status: "SUCCESS",
          amount: parseFloat(data.amount),
          trxId: data.pg_txnid,
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
