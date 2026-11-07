import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { searches } from "@/db/schema";
import { queryArticles, searchTerms } from "@/lib/data";
import { didYouMean } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") ?? "").trim();
  const { cards, hasMore } = await queryArticles({
    q: q || undefined,
    category: sp.get("category") ?? undefined,
    country: sp.get("country") ?? undefined,
    region: sp.get("region") ?? undefined,
    tag: sp.get("tag") ?? undefined,
    type: sp.get("type") ?? undefined,
    authorId: sp.get("author") ? Number(sp.get("author")) : undefined,
    sort: (sp.get("sort") as "latest" | "popular" | "trending" | "shared") ?? "latest",
    cursor: sp.get("cursor") ? Number(sp.get("cursor")) : undefined,
    limit: sp.get("limit") ? Number(sp.get("limit")) : 12,
    from: sp.get("from") ?? undefined,
    to: sp.get("to") ?? undefined,
  });

  let correction: string | null = null;
  if (q && cards.length === 0) {
    correction = didYouMean(q, await searchTerms());
  }

  if (q) {
    await db.insert(searches).values({
      query: q.slice(0, 300),
      results: cards.length,
      sessionId: req.headers.get("x-session-id") ?? undefined,
    });
  }

  return NextResponse.json({ items: cards, hasMore, correction, count: cards.length });
}
