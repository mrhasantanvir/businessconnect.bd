import { NextRequest, NextResponse } from "next/server";
import { getGoogleOAuthClient } from "@/lib/google-sheets";
import { db as prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const merchantStoreId = searchParams.get("state");

  if (!code || !merchantStoreId) {
    return NextResponse.json({ error: "Authorization failed: Missing code or state." }, { status: 400 });
  }

  try {
    const oauth2Client = await getGoogleOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    await prisma.googleSheetsConfig.upsert({
      where: { merchantStoreId },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date ? BigInt(tokens.expiry_date) : undefined,
        isActive: true
      },
      create: {
        merchantStoreId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date ? BigInt(tokens.expiry_date) : undefined,
        isActive: true
      }
    });

    // Redirect back to settings page
    return NextResponse.redirect(new URL("/merchant/settings/google-sheets?success=true", req.url));

  } catch (err: any) {
    console.error("Google OAuth Callback Error:", err);
    return NextResponse.json({ error: "Token exchange failed." }, { status: 500 });
  }
}
