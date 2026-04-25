import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const userCount = await db.user.count();
    return NextResponse.json({ status: "healthy", userCount });
  } catch (err: any) {
    console.error("Health Check Failed:", err);
    return NextResponse.json({ 
      status: "error", 
      message: err.message,
      stack: err.stack,
      hint: "Check if Prisma engine binaries are present in src/lib/database/generated"
    }, { status: 500 });
  }
}
