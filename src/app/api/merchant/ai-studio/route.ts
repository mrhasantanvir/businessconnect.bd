import { NextRequest, NextResponse } from "next/server";
import { AIImageStudio } from "@/lib/ai/image-studio";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    let result;

    switch (action) {
      case "ANALYZE":
        result = await AIImageStudio.analyzeProductImage(imageUrl);
        break;
      
      case "REMOVE_BG":
        result = await AIImageStudio.removeBackground(imageUrl);
        break;

      case "UPSCALE":
        result = await AIImageStudio.upscaleImage(imageUrl);
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`[AI Studio API] Error:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
