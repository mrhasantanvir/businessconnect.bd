import { IPaymentProvider, PaymentInitResponse, PaymentProviderConfig, PaymentRequest, PaymentVerifyResponse } from "./types";

export class SSLCommerzProvider implements IPaymentProvider {
  name = "SSLCOMMERZ";

  private getBaseUrl(isTestMode: boolean) {
    return isTestMode 
      ? "https://sandbox.sslcommerz.com" 
      : "https://securepay.sslcommerz.com";
  }

  async initializePayment(config: PaymentProviderConfig, request: PaymentRequest): Promise<PaymentInitResponse> {
    const url = `${this.getBaseUrl(config.isTestMode)}/gwprocess/v4/api.php`;
    
    const formData = new URLSearchParams();
    formData.append("store_id", config.storeId || "");
    formData.append("store_passwd", config.storePass || "");
    formData.append("total_amount", request.amount.toString());
    formData.append("currency", "BDT");
    formData.append("tran_id", request.orderId);
    formData.append("success_url", request.successUrl);
    formData.append("fail_url", request.failUrl);
    formData.append("cancel_url", request.cancelUrl);
    formData.append("ipn_url", request.callbackUrl);
    formData.append("cus_name", request.customerName);
    formData.append("cus_email", request.customerEmail);
    formData.append("cus_phone", request.customerPhone);
    formData.append("cus_add1", "Dhaka");
    formData.append("cus_city", "Dhaka");
    formData.append("cus_country", "Bangladesh");
    formData.append("shipping_method", "NO");
    formData.append("product_name", "Order #" + request.orderId);
    formData.append("product_category", "Ecommerce");
    formData.append("product_profile", "general");

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.status === "SUCCESS" && data.GatewayPageURL) {
        return {
          success: true,
          gatewayUrl: data.GatewayPageURL,
          paymentId: data.sessionkey
        };
      }

      return {
        success: false,
        error: data.failedreason || "Failed to initialize SSLCommerz"
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async verifyPayment(config: PaymentProviderConfig, valId: string): Promise<PaymentVerifyResponse> {
    const url = `${this.getBaseUrl(config.isTestMode)}/validator/api/validationserverv4.php?val_id=${valId}&store_id=${config.storeId}&store_passwd=${config.storePass}&format=json`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "VALID" || data.status === "AUTHENTICATED") {
        return {
          success: true,
          status: "SUCCESS",
          amount: parseFloat(data.amount),
          trxId: data.tran_id,
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
      return {
        success: false,
        status: "FAILED",
        amount: 0,
        trxId: "",
        error: error.message
      };
    }
  }
}
