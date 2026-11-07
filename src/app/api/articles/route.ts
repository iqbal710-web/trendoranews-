import { NextRequest, NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories, articleTags, tags, articleVersions, users } from "@/db/schema";
import { queryArticles } from "@/lib/data";
import { getCurrentUser, canWrite, canPublish } from "@/lib/auth";
import { slugify, readingTimeMinutes } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const result = await queryArticles({
    category: sp.get("category") ?? undefined,
    country: sp.get("country") ?? undefined,
    region: sp.get("region") ?? undefined,
    tag: sp.get("tag") ?? undefined,
    type: sp.get("type") ?? undefined,
    q: sp.get("q") ?? undefined,
    authorId: sp.get("author") ? Number(sp.get("author")) : undefined,
    featured: sp.get("featured") === "1" ? true : undefined,
    editorChoice: sp.get("editors") === "1" ? true : undefined,
    breaking: sp.get("breaking") === "1" ? true : undefined,
    sort: (sp.get("sort") as "latest" | "popular" | "trending" | "shared") ?? "latest",
    cursor: sp.get("cursor") ? Number(sp.get("cursor")) : undefined,
    limit: sp.get("limit") ? Number(sp.get("limit")) : 12,
    status: "published",
  });
  return NextResponse.json({ items: result.cards, hasMore: result.hasMore });
}

async function uniqueSlug(base: string): Promise<string> {
  let s = base || "article";
  let i = 1;
  while (true) {
    const rows = await db.select({ id: articles.id }).from(articles).where(eq(articles.slug, s)).limit(1);
    if (!rows.length) return s;
    i += 1;
    s = `${base}-${i}`;
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canWrite(user.role)) {
    return NextResponse.json({ error: "Unauthorized — staff account required" }, { status: 401 });
  }
  const body = await req.json();
  const title: string = body.title ?? "";
  const content: string = body.content ?? "";
  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }
  const slug = await uniqueSlug(slugify(title).slice(0, 200) || `article-${Date.now()}`);
  const status = canPublish(user.role) && body.status === "published" ? "published" : body.status === "scheduled" ? "scheduled" : "draft";
  const [row] = await db
    .insert(articles)
    .values({
      slug,
      title,
      excerpt: body.excerpt ?? content.slice(0, 220),
      content,
      coverImage: body.coverImage ?? "",
      authorId: user.id,
      categoryId: body.categoryId ? Number(body.categoryId) : null,
      country: body.country ?? "",
      region: body.region ?? "",
      type: body.type ?? "news",
      status,
      factCheckStatus: body.factCheckStatus ?? "pending",
      featured: !!body.featured,
      breaking: !!body.breaking,
      editorChoice: !!body.editorChoice,
      readingTime: readingTimeMinutes(content),
      seoTitle: body.seoTitle ?? title,
      seoDescription: body.seoDescription ?? content.slice(0, 160),
      publishedAt: status === "published" ? new Date() : body.publishedAt ? new Date(body.publishedAt) : new Date(),
      scheduledAt: status === "scheduled" && body.scheduledAt ? new Date(body.scheduledAt) : null,
    })
    .returning();

  // tags
  if (Array.isArray(body.tags)) {
    for (const t of body.tags) {
      const name = String(t).trim();
      if (!name) continue;
      const tslug = slugify(name);
      let [tag] = await db.select().from(tags).where(eq(tags.slug, tslug)).limit(1);
      if (!tag) {
        [tag] = await db.insert(tags).values({ name, slug: tslug }).returning();
      }
      await db.insert(articleTags).values({ articleId: row.id, tagId: tag.id }).onConflictDoNothing();
    }
  }
  // initial version
  await db.insert(articleVersions).values({
    articleId: row.id,
    title,
    excerpt: body.excerpt ?? "",
    content,
    createdBy: user.id,
  });
  // bump category count
  if (row.categoryId) {
    await db
      .update(categories)
      .set({ articleCount: sql`${categories.articleCount} + 1` })
      .where(eq(categories.id, row.categoryId));
  }
  return NextResponse.json({ article: row }, { status: 201 });
}
