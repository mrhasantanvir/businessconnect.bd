import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Fetch Global Meta App Settings
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "GLOBAL" }
  });

  if (!settings?.fbAppId || !settings?.fbAppSecret) {
    return NextResponse.json({ error: "Meta App credentials not configured in System Settings." }, { status: 500 });
  }

  // 2. Comprehensive Scopes for Unified Hub (Ads + Chatbot)
  const scopes = [
    "public_profile",
    "email",
    "ads_management",           // ROI & Ads Sync
    "ads_read",                 // Ad Spend Analytics
    "business_management",      // Asset Discovery
    "pages_messaging",          // Chatbot Messenger
    "pages_show_list",          // List of Pages
    "pages_manage_metadata",    // Webhook Setup
    "instagram_basic",          // Instagram Discovery
    "instagram_manage_messages" // Instagram DM Chatbot
  ];

  // 3. Build Meta OAuth URL
  const fbLoginUrl = new URL("https://www.facebook.com/v19.0/dialog/oauth");
  fbLoginUrl.searchParams.append("client_id", settings.fbAppId);
  fbLoginUrl.searchParams.append("redirect_uri", settings.fbRedirectUri || "http://localhost:3030/api/auth/facebook/callback");
  fbLoginUrl.searchParams.append("state", session.merchantStoreId); // Carry store ID into callback
  fbLoginUrl.searchParams.append("scope", scopes.join(","));
  fbLoginUrl.searchParams.append("response_type", "code");

  return NextResponse.redirect(fbLoginUrl.toString());
}
