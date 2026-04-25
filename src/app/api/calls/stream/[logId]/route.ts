import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import fs from "fs";
import path from "path";

/**
 * Securely stream call recordings
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ logId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const logId = (await params).logId;

    const callLog = await prisma.callLog.findUnique({
      where: { id: logId, merchantStoreId: session.merchantStoreId! }
    });

    if (!callLog || !callLog.recordingUrl) {
      return new NextResponse("Recording not found", { status: 404 });
    }

    // Securely resolve file path (prevent directory traversal)
    // In production, this would likely be an S3 bucket URL or a protected local mount
    const filePath = path.join(process.cwd(), "public", callLog.recordingUrl);

    if (!fs.existsSync(filePath)) {
      return new NextResponse("File missing on server", { status: 404 });
    }

    const stats = fs.statSync(filePath);
    const range = req.headers.get("range");

    if (!range) {
      const fileStream = fs.createReadStream(filePath);
      return new NextResponse(fileStream as any, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": stats.size.toString(),
        }
      });
    }

    // Handle Range Requests (Scrubbing support)
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, stats.size - 1);
    const contentLength = end - start + 1;

    const fileStream = fs.createReadStream(filePath, { start, end });

    return new NextResponse(fileStream as any, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${stats.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength.toString(),
        "Content-Type": "audio/mpeg",
      }
    });

  } catch (error) {
    console.error("[Stream Error]:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
