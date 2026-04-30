import { NextRequest, NextResponse } from "next/server";
import { StorageService } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    // Use the central StorageService
    const url = await StorageService.upload(file, "documents");

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
