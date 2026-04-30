import { NextRequest, NextResponse } from "next/server";
import { StorageService } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!file || !allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type (Images and PDFs allowed)" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    // Use the central StorageService, save into 'incidents' folder as per legacy code
    const url = await StorageService.upload(file, "incidents");

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
