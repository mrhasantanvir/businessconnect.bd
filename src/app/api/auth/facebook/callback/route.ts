import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const storeId = searchParams.get("state"); // From login redirect
  const error = searchParams.get("error");

  if (error || !code || !storeId) {
    console.error("Meta Callback Error:", error);
    return NextResponse.redirect("/merchant/social?error=MetaAuthFailed");
  }

  try {
    // 1. Fetch Global Meta App Settings
    const settings = await prisma.systemSettings.findUnique({
      where: { id: "GLOBAL" }
    });

    if (!settings?.fbAppId || !settings?.fbAppSecret) {
      return NextResponse.redirect("/merchant/social?error=SystemConfigMissing");
    }

    // 2. Exchange Code for Access Token
    const tokenUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
    tokenUrl.searchParams.append("client_id", settings.fbAppId);
    tokenUrl.searchParams.append("client_secret", settings.fbAppSecret);
    tokenUrl.searchParams.append("redirect_uri", settings.fbRedirectUri || "http://localhost:3030/api/auth/facebook/callback");
    tokenUrl.searchParams.append("code", code);

    const tokenRes = await fetch(tokenUrl.toString());
    const tokenData = await tokenRes.json();

    if (tokenData.error) throw new Error(tokenData.error.message);

    const shortLivedToken = tokenData.access_token;

    // 3. Exchange for LONG-LIVED Token (60 Days)
    const longLivedUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
    longLivedUrl.searchParams.append("grant_type", "fb_exchange_token");
    longLivedUrl.searchParams.append("client_id", settings.fbAppId);
    longLivedUrl.searchParams.append("client_secret", settings.fbAppSecret);
    longLivedUrl.searchParams.append("fb_exchange_token", shortLivedToken);

    const longLivedRes = await fetch(longLivedUrl.toString());
    const longLivedData = await longLivedRes.json();

    const finalToken = longLivedData.access_token || shortLivedToken;

    // 4. Update Merchant Store Configuration
    await prisma.facebookConfig.upsert({
      where: { merchantStoreId: storeId },
      create: {
        merchantStoreId: storeId,
        accessToken: finalToken,
        isActive: true
      },
      update: {
        accessToken: finalToken,
        isActive: true
      }
    });

    // 5. Final Redirect back to Social Hub
    return NextResponse.redirect(new URL("/merchant/social?success=MetaConnected", req.url).toString());

  } catch (err: any) {
    console.error("[Meta Callback Exception]:", err.message);
    return NextResponse.redirect(`/merchant/social?error=${encodeURIComponent(err.message)}`);
  }
}
