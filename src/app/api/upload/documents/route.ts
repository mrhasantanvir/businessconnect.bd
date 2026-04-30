import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get original extension
    const ext = file.name.split(".").pop() || "pdf";
    
    // Create unique filename
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    
    // Ensure directory exists
    const dir = path.join(process.cwd(), "public", "uploads", "documents");
    await mkdir(dir, { recursive: true });
    
    // Write file
    await writeFile(path.join(dir, filename), buffer);

    return NextResponse.json({ url: `/uploads/documents/${filename}` });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
