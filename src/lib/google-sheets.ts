import { google } from "googleapis";
import { prisma } from "./db";

export async function getGoogleOAuthClient() {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "GLOBAL" }
  });

  if (!settings?.googleClientId || !settings?.googleClientSecret) {
    throw new Error("Google credentials not configured by Administrator.");
  }

  return new google.auth.OAuth2(
    settings.googleClientId,
    settings.googleClientSecret,
    settings.googleRedirectUri || "http://localhost:3030/api/auth/google/callback"
  );
}

export async function getVerifiedMerchantClient(merchantStoreId: string) {
  const config = await prisma.googleSheetsConfig.findUnique({
    where: { merchantStoreId }
  });

  if (!config || !config.refreshToken) {
    throw new Error("Google Sheets not connected for this shop.");
  }

  const oauth2Client = await getGoogleOAuthClient();
  
  oauth2Client.setCredentials({
    access_token: config.accessToken || undefined,
    refresh_token: config.refreshToken,
    expiry_date: config.expiryDate ? Number(config.expiryDate) : undefined
  });

  // Check if token needs refresh
  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.refresh_token) {
      await prisma.googleSheetsConfig.update({
        where: { merchantStoreId },
        data: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiryDate: tokens.expiry_date ? BigInt(tokens.expiry_date) : undefined
        }
      });
    } else if (tokens.access_token) {
      await prisma.googleSheetsConfig.update({
        where: { merchantStoreId },
        data: {
          accessToken: tokens.access_token,
          expiryDate: tokens.expiry_date ? BigInt(tokens.expiry_date) : undefined
        }
      });
    }
  });

  return oauth2Client;
}

export async function pushOrdersToSheet(merchantStoreId: string, orders: any[]) {
  const auth = await getVerifiedMerchantClient(merchantStoreId);
  const config = await prisma.googleSheetsConfig.findUnique({
    where: { merchantStoreId }
  });

  if (!config?.spreadsheetId) throw new Error("Spreadsheet ID not configured.");

  const sheets = google.sheets({ version: "v4", auth });
  
  // Prepare data rows
  const rows = orders.map(order => [
    order.id,
    order.createdAt.toISOString(),
    order.customerName,
    order.customerPhone,
    order.deliveryAddress,
    order.total,
    order.status,
    order.paymentStatus,
    order.source
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId: config.spreadsheetId,
    range: `${config.sheetName}!A:I`,
    valueInputOption: "RAW",
    requestBody: {
      values: rows
    }
  });
}

export async function pullProductsFromSheet(merchantStoreId: string) {
  const auth = await getVerifiedMerchantClient(merchantStoreId);
  const config = await prisma.googleSheetsConfig.findUnique({
    where: { merchantStoreId }
  });

  if (!config?.spreadsheetId) throw new Error("Spreadsheet ID not configured.");

  const sheets = google.sheets({ version: "v4", auth });
  
  // We assume a dedicated tab named "Products" for importing
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range: `Products!A2:G`, // Assume A:Header, G:Stock
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) return [];

  // Map rows: [SKU, Name, Price, OriginalPrice, Description, Stock, Category]
  return rows.map(row => ({
    sku: row[0],
    name: row[1],
    price: parseFloat(row[2] || "0"),
    originalPrice: parseFloat(row[3] || "0"),
    description: row[4],
    stock: parseInt(row[5] || "0"),
    category: row[6]
  }));
}
