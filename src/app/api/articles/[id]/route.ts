import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, articleTags, tags, articleVersions, users } from "@/db/schema";
import { getArticleBySlug } from "@/lib/data";
import { getCurrentUser, canWrite, canEditAny, canPublish } from "@/lib/auth";
import { slugify, readingTimeMinutes } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

async function resolveArticle(idOrSlug: string) {
  if (/^\d+$/.test(idOrSlug)) {
    const rows = await db.select().from(articles).where(eq(articles.id, Number(idOrSlug))).limit(1);
    return rows[0] ?? null;
  }
  const found = await getArticleBySlug(idOrSlug);
  return found?.article ?? null;
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const article = await resolveArticle(id);
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const versions = await db
    .select({ v: articleVersions, u: users })
    .from(articleVersions)
    .leftJoin(users, eq(articleVersions.createdBy, users.id))
    .where(eq(articleVersions.articleId, article.id))
    .orderBy(articleVersions.createdAt);
  return NextResponse.json({ article, versions });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user || !canWrite(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const article = await resolveArticle(id);
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (article.authorId !== user.id && !canEditAny(user.role)) {
    return NextResponse.json({ error: "You can only edit your own articles" }, { status: 403 });
  }
  const body = await req.json();

  // save version snapshot before update
  await db.insert(articleVersions).values({
    articleId: article.id,
    title: article.title,
    excerpt: article.excerpt ?? "",
    content: article.content,
    createdBy: user.id,
  });

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  for (const k of ["title", "excerpt", "content", "coverImage", "country", "region", "type", "factCheckStatus", "seoTitle", "seoDescription"] as const) {
    if (body[k] !== undefined) updates[k] = body[k];
  }
  if (body.content) updates.readingTime = readingTimeMinutes(body.content);
  if (body.categoryId !== undefined) updates.categoryId = body.categoryId ? Number(body.categoryId) : null;
  if (canPublish(user.role)) {
    if (body.status) updates.status = body.status;
    if (body.featured !== undefined) updates.featured = !!body.featured;
    if (body.breaking !== undefined) updates.breaking = !!body.breaking;
    if (body.editorChoice !== undefined) updates.editorChoice = !!body.editorChoice;
    if (body.scheduledAt !== undefined) updates.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
    if (body.status === "published" && article.status !== "published") updates.publishedAt = new Date();
  }
  if (body.title && body.title !== article.title) {
    updates.slug = slugify(body.title).slice(0, 200) + "-" + article.id;
  }

  const [updated] = await db.update(articles).set(updates).where(eq(articles.id, article.id)).returning();

  if (Array.isArray(body.tags)) {
    await db.delete(articleTags).where(eq(articleTags.articleId, article.id));
    for (const t of body.tags) {
      const name = String(t).trim();
      if (!name) continue;
      const tslug = slugify(name);
      let [tag] = await db.select().from(tags).where(eq(tags.slug, tslug)).limit(1);
      if (!tag) [tag] = await db.insert(tags).values({ name, slug: tslug }).returning();
      await db.insert(articleTags).values({ articleId: article.id, tagId: tag.id }).onConflictDoNothing();
    }
  }
  return NextResponse.json({ article: updated });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user || !canEditAny(user.role)) {
    return NextResponse.json({ error: "Admin/editor required" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const article = await resolveArticle(id);
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.update(articles).set({ status: "archived" }).where(eq(articles.id, article.id));
  return NextResponse.json({ ok: true });
}
