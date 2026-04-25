export interface PaymentProviderConfig {
  merchantStoreId: string;
  provider: string;
  apiKey?: string;
  apiSecret?: string;
  merchantId?: string;
  publicKey?: string;
  privateKey?: string;
  storeId?: string;
  storePass?: string;
  isTestMode: boolean;
}

export interface PaymentRequest {
  amount: number;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  callbackUrl: string;
  cancelUrl: string;
  successUrl: string;
  failUrl: string;
}

export interface PaymentInitResponse {
  success: boolean;
  gatewayUrl?: string;
  paymentId?: string;
  error?: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  status: "SUCCESS" | "FAILED" | "CANCELLED" | "PENDING";
  amount: number;
  trxId: string;
  rawResponse?: any;
}

export interface IPaymentProvider {
  name: string;
  initializePayment(config: PaymentProviderConfig, request: PaymentRequest): Promise<PaymentInitResponse>;
  verifyPayment(config: PaymentProviderConfig, paymentId: string): Promise<PaymentVerifyResponse>;
}
