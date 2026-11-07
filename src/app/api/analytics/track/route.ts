import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pageViews, articles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const path = String(body.path ?? "/").slice(0, 500);
    const match = path.match(/^\/article\/([^/]+)/);
    let articleId: number | null = null;
    if (match) {
      const rows = await db.select({ id: articles.id }).from(articles).where(eq(articles.slug, match[1])).limit(1);
      articleId = rows[0]?.id ?? null;
    }
    const country = (req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || "").slice(0, 120);
    await db.insert(pageViews).values({
      path,
      articleId,
      sessionId: body.sessionId ? String(body.sessionId).slice(0, 128) : null,
      country,
      referrer: String(body.referrer ?? "").slice(0, 500),
      device: body.device === "mobile" ? "mobile" : "desktop",
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
