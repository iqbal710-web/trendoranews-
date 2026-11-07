import { and, desc, eq, ilike, inArray, isNotNull, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import {
  articles,
  articleTags,
  articleSources,
  tags,
  categories,
  users,
  breakingNews,
  breakingUpdates,
  comments,
  likes,
  bookmarks,
} from "@/db/schema";

export type ArticleCard = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  type: string;
  country: string;
  region: string;
  views: number;
  likes: number;
  readingTime: number;
  featured: boolean;
  breaking: boolean;
  editorChoice: boolean;
  factCheckStatus: string;
  publishedAt: Date;
  category: { id: number; name: string; slug: string; color: string } | null;
  author: { id: number; name: string; verified: boolean; avatarUrl: string | null } | null;
  tags: string[];
};

function cardSelect() {
  return {
    id: articles.id,
    slug: articles.slug,
    title: articles.title,
    excerpt: articles.excerpt,
    coverImage: articles.coverImage,
    type: articles.type,
    country: articles.country,
    region: articles.region,
    views: articles.views,
    likes: articles.likes,
    readingTime: articles.readingTime,
    featured: articles.featured,
    breaking: articles.breaking,
    editorChoice: articles.editorChoice,
    factCheckStatus: articles.factCheckStatus,
    publishedAt: articles.publishedAt,
    category: {
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      color: categories.color,
    },
    author: {
      id: users.id,
      name: users.name,
      verified: users.verified,
      avatarUrl: users.avatarUrl,
    },
  };
}

async function attachTags(rows: { id: number }[]): Promise<Map<number, string[]>> {
  const map = new Map<number, string[]>();
  if (!rows.length) return map;
  const ids = rows.map((r) => r.id);
  const tagRows = await db
    .select({ articleId: articleTags.articleId, name: tags.name })
    .from(articleTags)
    .innerJoin(tags, eq(articleTags.tagId, tags.id))
    .where(inArray(articleTags.articleId, ids));
  for (const t of tagRows) {
    const arr = map.get(t.articleId) ?? [];
    arr.push(t.name);
    map.set(t.articleId, arr);
  }
  return map;
}

export async function toCards(rows: any[]): Promise<ArticleCard[]> {
  const tagMap = await attachTags(rows);
  return rows.map((r) => ({
    ...r,
    tags: tagMap.get(r.id) ?? [],
    category: r.category && r.category.id ? r.category : null,
    author: r.author && r.author.id ? r.author : null,
  }));
}

export type ArticleQuery = {
  category?: string;
  country?: string;
  region?: string;
  tag?: string;
  type?: string;
  q?: string;
  authorId?: number;
  status?: string;
  featured?: boolean;
  editorChoice?: boolean;
  breaking?: boolean;
  sort?: "latest" | "popular" | "trending" | "shared";
  cursor?: number; // article id cursor for "latest" infinite scroll
  limit?: number;
  from?: string;
  to?: string;
};

export async function queryArticles(q: ArticleQuery) {
  const limit = Math.min(q.limit ?? 12, 50);
  const conds: SQL[] = [];
  conds.push(eq(articles.status, q.status ?? "published"));
  if (q.category) {
    conds.push(
      sql`EXISTS (SELECT 1 FROM ${categories} c WHERE c.id = ${articles.categoryId} AND (c.slug = ${q.category} OR c.parent_id IN (SELECT id FROM ${categories} p WHERE p.slug = ${q.category})))`
    );
  }
  if (q.country) conds.push(eq(articles.country, q.country));
  if (q.region) conds.push(eq(articles.region, q.region));
  if (q.type) conds.push(eq(articles.type, q.type));
  if (q.authorId) conds.push(eq(articles.authorId, q.authorId));
  if (q.featured) conds.push(eq(articles.featured, true));
  if (q.editorChoice) conds.push(eq(articles.editorChoice, true));
  if (q.breaking) conds.push(eq(articles.breaking, true));
  if (q.tag) {
    conds.push(
      sql`EXISTS (SELECT 1 FROM ${articleTags} at JOIN ${tags} tg ON tg.id = at.tag_id WHERE at.article_id = ${articles.id} AND tg.slug = ${q.tag})`
    );
  }
  if (q.q) {
    const like = `%${q.q}%`;
    conds.push(
      or(
        ilike(articles.title, like),
        ilike(articles.excerpt, like),
        ilike(articles.content, like)
      )!
    );
  }
  if (q.cursor) {
    conds.push(sql`${articles.id} < ${q.cursor}`);
  }
  if (q.from) {
    conds.push(sql`${articles.publishedAt} >= ${new Date(q.from)}`);
  }
  if (q.to) {
    conds.push(sql`${articles.publishedAt} <= ${new Date(q.to + "T23:59:59")}`);
  }

  let orderBy: SQL;
  switch (q.sort) {
    case "popular":
      orderBy = sql`${articles.views} DESC`;
      break;
    case "trending":
      orderBy = sql`${articles.views} + ${articles.likes} * 5 DESC`;
      break;
    case "shared":
      orderBy = sql`${articles.shares} DESC`;
      break;
    default:
      orderBy = sql`${articles.publishedAt} DESC, ${articles.id} DESC`;
  }

  const rows = await db
    .select(cardSelect())
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(and(...conds))
    .orderBy(desc(articles.publishedAt), orderBy)
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  return { cards: await toCards(rows.slice(0, limit)), hasMore };
}

export async function getArticleBySlug(slug: string) {
  const rows = await db
    .select({
      article: articles,
      category: categories,
      author: users,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(and(eq(articles.slug, slug), eq(articles.status, "published")))
    .limit(1);
  if (!rows.length) return null;
  const { article, category, author } = rows[0];
  const tagRows = await db
    .select({ name: tags.name, slug: tags.slug })
    .from(articleTags)
    .innerJoin(tags, eq(articleTags.tagId, tags.id))
    .where(eq(articleTags.articleId, article.id));
  const sources = await db
    .select()
    .from(articleSources)
    .where(eq(articleSources.articleId, article.id));
  const commentCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(comments)
    .where(and(eq(comments.articleId, article.id), eq(comments.status, "visible")));
  return {
    article,
    category,
    author,
    tags: tagRows,
    sources,
    commentCount: commentCount[0]?.count ?? 0,
  };
}

export async function getAllCategories() {
  return db.select().from(categories).orderBy(categories.name);
}

export async function getBreakingActive() {
  const rows = await db
    .select()
    .from(breakingNews)
    .where(
      or(
        eq(breakingNews.status, "live"),
        eq(breakingNews.status, "developing")
      )
    )
    .orderBy(desc(breakingNews.updatedAt))
    .limit(10);
  return rows;
}

export async function getBreakingWithUpdates(id: number) {
  const bn = await db.select().from(breakingNews).where(eq(breakingNews.id, id)).limit(1);
  if (!bn.length) return null;
  const updates = await db
    .select({ update: breakingUpdates, author: users })
    .from(breakingUpdates)
    .leftJoin(users, eq(breakingUpdates.authorId, users.id))
    .where(eq(breakingUpdates.breakingId, id))
    .orderBy(desc(breakingUpdates.createdAt));
  return { breaking: bn[0], updates };
}

export async function getArticleEngagement(articleId: number, userId: number | null) {
  let liked = false;
  let bookmarked = false;
  if (userId) {
    const l = await db
      .select()
      .from(likes)
      .where(and(eq(likes.articleId, articleId), eq(likes.userId, userId)))
      .limit(1);
    liked = l.length > 0;
    const b = await db
      .select()
      .from(bookmarks)
      .where(and(eq(bookmarks.articleId, articleId), eq(bookmarks.userId, userId)))
      .limit(1);
    bookmarked = b.length > 0;
  }
  return { liked, bookmarked };
}

export async function getCommentsForArticle(articleId: number) {
  return db
    .select({
      id: comments.id,
      content: comments.content,
      authorName: comments.authorName,
      createdAt: comments.createdAt,
      parentId: comments.parentId,
      userId: comments.userId,
      authorVerified: users.verified,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(and(eq(comments.articleId, articleId), eq(comments.status, "visible")))
    .orderBy(desc(comments.createdAt))
    .limit(100);
}

export async function getRelatedArticles(articleId: number, categoryId: number | null, limit = 6) {
  const conds: SQL[] = [
    eq(articles.status, "published"),
    sql`${articles.id} != ${articleId}`,
  ];
  if (categoryId) conds.push(eq(articles.categoryId, categoryId));
  const rows = await db
    .select(cardSelect())
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(and(...conds))
    .orderBy(desc(articles.views))
    .limit(limit);
  return toCards(rows);
}

export async function incrementViews(articleId: number) {
  await db
    .update(articles)
    .set({ views: sql`${articles.views} + 1` })
    .where(eq(articles.id, articleId));
}

export async function distinctCountries() {
  const rows = await db
    .selectDistinct({ country: articles.country })
    .from(articles)
    .where(and(eq(articles.status, "published"), sql`${articles.country} != ''`));
  return rows.map((r) => r.country).filter((c): c is string => Boolean(c)).sort();
}

export async function distinctRegions() {
  const rows = await db
    .selectDistinct({ region: articles.region })
    .from(articles)
    .where(and(eq(articles.status, "published"), sql`${articles.region} != ''`));
  return rows.map((r) => r.region).filter((r): r is string => Boolean(r)).sort();
}

export async function searchTerms() {
  const rows = await db
    .select({ title: articles.title })
    .from(articles)
    .where(eq(articles.status, "published"))
    .limit(500);
  return rows.map((r) => r.title);
}
