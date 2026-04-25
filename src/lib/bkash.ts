const BKASH_BASE_URL = process.env.NODE_ENV === "production" 
  ? "https://tokenized.pay.bka.sh/v1.2.0-beta" 
  : "https://tokenized.sandbox.bka.sh/v1.2.0-beta";

const credentials = {
  username: process.env.BKASH_USERNAME || "",
  password: process.env.BKASH_PASSWORD || "",
  app_key: process.env.BKASH_APP_KEY || "",
  app_secret: process.env.BKASH_APP_SECRET || "",
};

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

// 1. Grant Token
export async function getBkashToken(): Promise<string> {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/token/grant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "username": credentials.username,
      "password": credentials.password,
    },
    body: JSON.stringify({
      app_key: credentials.app_key,
      app_secret: credentials.app_secret,
    }),
  });

  const data = await res.json();
  if (data.id_token) {
    cachedToken = data.id_token;
    // Token lasts 1 hour. We cache it for 55 minutes.
    tokenExpiry = Date.now() + 55 * 60 * 1000;
    return cachedToken as string;
  }
  
  throw new Error("Failed to get bKash Token: " + JSON.stringify(data));
}

// 2. Create Payment
export async function createBkashPayment(
  amount: number, 
  merchantInvoiceNumber: string, 
  callbackURL: string
) {
  const token = await getBkashToken();

  const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "X-APP-Key": credentials.app_key,
    },
    body: JSON.stringify({
      mode: "0011",
      payerReference: "merchant",
      callbackURL,
      amount: amount.toString(),
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber,
    }),
  });

  const data = await res.json();
  if (data.statusCode === "0000" && data.bkashURL) {
    return {
      paymentID: data.paymentID,
      bkashURL: data.bkashURL,
    };
  }

  throw new Error("Failed to create bKash Payment: " + JSON.stringify(data));
}

// 3. Execute Payment
export async function executeBkashPayment(paymentID: string) {
  const token = await getBkashToken();

  const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "X-APP-Key": credentials.app_key,
    },
    body: JSON.stringify({ paymentID }),
  });

  return await res.json();
}
