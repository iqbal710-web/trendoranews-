import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { comments } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getCommentsForArticle } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const articleId = Number(req.nextUrl.searchParams.get("articleId"));
  if (!articleId) return NextResponse.json({ error: "articleId required" }, { status: 400 });
  return NextResponse.json({ comments: await getCommentsForArticle(articleId) });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  const body = await req.json();
  const articleId = Number(body.articleId);
  const content = String(body.content ?? "").trim();
  if (!articleId || !content) return NextResponse.json({ error: "articleId and content required" }, { status: 400 });
  const [row] = await db
    .insert(comments)
    .values({
      articleId,
      userId: user?.id ?? null,
      authorName: user?.name ?? (String(body.authorName ?? "").trim() || "Guest"),
      content: content.slice(0, 2000),
      parentId: body.parentId ? Number(body.parentId) : null,
    })
    .returning();
  return NextResponse.json({ comment: row }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !["editor", "senior_editor", "publisher", "admin"].includes(user.role)) {
    return NextResponse.json({ error: "Moderator required" }, { status: 401 });
  }
  const body = await req.json();
  const [row] = await db
    .update(comments)
    .set({ status: body.status ?? "visible" })
    .where(eq(comments.id, Number(body.id)))
    .returning();
  return NextResponse.json({ comment: row });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  const body = await req.json();
  const id = Number(body.id);
  const existing = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
  if (!existing.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const isOwner = existing[0].userId === user?.id;
  const isMod = !!user && ["editor", "senior_editor", "publisher", "admin"].includes(user.role);
  if (!isOwner && !isMod) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await db.delete(comments).where(and(eq(comments.id, id)));
  return NextResponse.json({ ok: true });
}
