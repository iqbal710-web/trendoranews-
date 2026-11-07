import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, reads } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { incrementViews } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const articleId = Number(id);
  if (!Number.isFinite(articleId)) return NextResponse.json({ error: "bad id" }, { status: 400 });
  const user = await getCurrentUser();
  let sessionId: string | null = null;
  try {
    const body = await req.json();
    sessionId = body.sessionId ?? null;
  } catch {
    /* no body */
  }
  await incrementViews(articleId);
  await db.insert(reads).values({ userId: user?.id ?? null, sessionId, articleId });
  const [row] = await db.select({ views: articles.views }).from(articles).where(eq(articles.id, articleId)).limit(1);
  return NextResponse.json({ views: row?.views ?? 0 });
}
