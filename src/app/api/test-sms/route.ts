import { db as prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "GLOBAL" }
  });

  if (!settings) {
    return NextResponse.json({ error: "System settings not found in database. Run npx prisma db push." });
  }

  const payload = {
    api_token: settings.smsApiKey,
    sid: settings.smsSenderId || "RAJBRAND",
    msisdn: "8801919999927", // Test number
    sms: "BusinessConnect Diagnostic Test",
    csms_id: `TEST${Date.now()}`
  };

  try {
    const response = await fetch(settings.smsApiUrl || "https://smsplus.sslwireless.com/api/v3/send-sms", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const raw = await response.text();
    let json;
    try { json = JSON.parse(raw); } catch(e) { json = { raw }; }

    return NextResponse.json({
      database_settings: {
        provider: settings.smsActiveProvider,
        sid: settings.smsSenderId,
        url: settings.smsApiUrl,
        has_key: !!settings.smsApiKey
      },
      ssl_gateway_response: json
    });
  } catch (err: any) {
    return NextResponse.json({
      error: "Failed to connect to SSL Wireless",
      details: err.message
    });
  }
}
