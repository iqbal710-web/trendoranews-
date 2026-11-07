import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { bookmarks } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getArticleEngagement } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to bookmark articles" }, { status: 401 });
  const { id } = await ctx.params;
  const articleId = Number(id);
  const existing = await db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.articleId, articleId), eq(bookmarks.userId, user.id)))
    .limit(1);
  let bookmarked: boolean;
  if (existing.length) {
    await db.delete(bookmarks).where(and(eq(bookmarks.articleId, articleId), eq(bookmarks.userId, user.id)));
    bookmarked = false;
  } else {
    await db.insert(bookmarks).values({ articleId, userId: user.id });
    bookmarked = true;
  }
  const eng = await getArticleEngagement(articleId, user.id);
  return NextResponse.json({ bookmarked, liked: eng.liked });
}
