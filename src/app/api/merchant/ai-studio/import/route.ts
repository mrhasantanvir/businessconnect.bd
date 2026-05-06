import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { askAI } from "@/lib/ai/gateway";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.merchantStoreId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // Fetch HTML
    const res = await fetch(url, {
       headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    const html = await res.text();
    const cleanHtml = html.slice(0, 10000); // Limit context

    const prompt = `
      Extract product details from this HTML content:
      1. Product Name
      2. Main Category
      3. Brand
      4. Estimated Price (in numbers)
      Return ONLY as JSON: {"name": "...", "category": "...", "brand": "...", "price": 0}
      HTML Snippet: ${cleanHtml}
    `;

    const { content } = await askAI(prompt, { jsonMode: true });
    const data = JSON.parse(content);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Scraper AI Error:", error);
    return NextResponse.json({ error: "Failed to parse URL. The site might be protected." }, { status: 500 });
  }
}
