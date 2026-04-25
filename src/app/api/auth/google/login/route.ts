import { NextRequest, NextResponse } from "next/server";
import { getGoogleOAuthClient } from "@/lib/google-sheets";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || !session.merchantStoreId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const oauth2Client = await getGoogleOAuthClient();

  const scopes = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.metadata.readonly"
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
    state: session.merchantStoreId // Use state to pass merchantId back
  });

  return NextResponse.redirect(url);
}
