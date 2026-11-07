import { NextRequest, NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, likes } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getArticleEngagement } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to like articles" }, { status: 401 });
  const { id } = await ctx.params;
  const articleId = Number(id);
  const existing = await db
    .select()
    .from(likes)
    .where(and(eq(likes.articleId, articleId), eq(likes.userId, user.id)))
    .limit(1);
  let liked: boolean;
  if (existing.length) {
    await db.delete(likes).where(and(eq(likes.articleId, articleId), eq(likes.userId, user.id)));
    await db.update(articles).set({ likes: sql`${articles.likes} - 1` }).where(eq(articles.id, articleId));
    liked = false;
  } else {
    await db.insert(likes).values({ articleId, userId: user.id });
    await db.update(articles).set({ likes: sql`${articles.likes} + 1` }).where(eq(articles.id, articleId));
    liked = true;
  }
  const [row] = await db.select({ likes: articles.likes }).from(articles).where(eq(articles.id, articleId)).limit(1);
  const eng = await getArticleEngagement(articleId, user.id);
  return NextResponse.json({ liked, likes: row?.likes ?? 0, bookmarked: eng.bookmarked });
}
