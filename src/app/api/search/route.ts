import { NextResponse } from "next/server";
import { searchArticles } from "@/lib/data/articles";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const type = searchParams.get("type") || "all";

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], total: 0 });
  }

  try {
    const results = await searchArticles(q, type === "all" ? undefined : type, 30);
    return NextResponse.json({ results, total: results.length, query: q });
  } catch {
    return NextResponse.json({ results: [], total: 0, error: "Search unavailable" }, { status: 503 });
  }
}
