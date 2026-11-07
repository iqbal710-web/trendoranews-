import { NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { bookmarks, reads, articles, follows } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { toCards } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const savedRows = await db
    .select({ article: articles })
    .from(bookmarks)
    .innerJoin(articles, eq(bookmarks.articleId, articles.id))
    .where(eq(bookmarks.userId, user.id))
    .orderBy(desc(bookmarks.createdAt))
    .limit(50);

  const historyRows = await db
    .select({ article: articles, at: reads.at })
    .from(reads)
    .innerJoin(articles, eq(reads.articleId, articles.id))
    .where(eq(reads.userId, user.id))
    .orderBy(desc(reads.at))
    .limit(50);

  const followRows = await db.select().from(follows).where(eq(follows.userId, user.id)).limit(100);

  const all = [...savedRows.map((r) => r.article), ...historyRows.map((r) => r.article)];
  const cards = await toCards(all as any[]);

  return NextResponse.json({
    saved: cards.slice(0, 50),
    history: await toCards(historyRows.map((r) => r.article) as any[]),
    follows: followRows,
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (body.categoryId) {
    await db
      .insert(follows)
      .values({ userId: user.id, categoryId: Number(body.categoryId), authorId: null })
      .onConflictDoNothing();
  }
  if (body.authorId) {
    await db
      .insert(follows)
      .values({ userId: user.id, categoryId: null, authorId: Number(body.authorId) })
      .onConflictDoNothing();
  }
  return NextResponse.json({ ok: true });
}
