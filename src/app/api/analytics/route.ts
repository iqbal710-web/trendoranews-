import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { pageViews, articles, newsletter, searches, categories, users } from "@/db/schema";
import { getCurrentUser, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.role)) {
    // public-lite stats for the data-viz explorer
    const [totalViews] = await db.select({ c: sql<number>`count(*)::int` }).from(pageViews);
    const [totalArticles] = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(articles)
      .where(eq(articles.status, "published"));
    const [subs] = await db.select({ c: sql<number>`count(*)::int` }).from(newsletter);
    return NextResponse.json({
      restricted: !user,
      totals: {
        pageViews: totalViews.c,
        articles: totalArticles.c,
        subscribers: subs.c,
      },
    });
  }

  const since = new Date(Date.now() - 24 * 3600 * 1000);
  const since7 = new Date(Date.now() - 7 * 24 * 3600 * 1000);

  const [visitors24h] = await db
    .select({ c: sql<number>`count(distinct ${pageViews.sessionId})::int` })
    .from(pageViews)
    .where(sql`${pageViews.at} > ${since}`);
  const [totalViews] = await db.select({ c: sql<number>`count(*)::int` }).from(pageViews);
  const [uniqueAll] = await db
    .select({ c: sql<number>`count(distinct ${pageViews.sessionId})::int` })
    .from(pageViews);
  const [returning] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(pageViews)
    .where(sql`${pageViews.sessionId} IN (SELECT ${pageViews.sessionId} FROM ${pageViews} GROUP BY ${pageViews.sessionId} HAVING count(*) > 1)`);
  const byCountry = await db
    .select({ country: pageViews.country, c: sql<number>`count(*)::int` })
    .from(pageViews)
    .where(sql`${pageViews.country} != ''`)
    .groupBy(pageViews.country)
    .orderBy(desc(sql`count(*)`))
    .limit(10);
  const byDevice = await db
    .select({ device: pageViews.device, c: sql<number>`count(*)::int` })
    .from(pageViews)
    .groupBy(pageViews.device);
  const bySource = await db
    .select({ referrer: pageViews.referrer, c: sql<number>`count(*)::int` })
    .from(pageViews)
    .groupBy(pageViews.referrer)
    .orderBy(desc(sql`count(*)`))
    .limit(10);
  const popularArticles = await db
    .select({ id: articles.id, slug: articles.slug, title: articles.title, views: articles.views, likes: articles.likes, shares: articles.shares })
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.views))
    .limit(10);
  const trendingCats = await db
    .select({ name: categories.name, slug: categories.slug, c: sql<number>`count(*)::int` })
    .from(pageViews)
    .innerJoin(articles, eq(pageViews.articleId, articles.id))
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(sql`${pageViews.at} > ${since7}`)
    .groupBy(categories.name, categories.slug)
    .orderBy(desc(sql`count(*)`))
    .limit(8);
  const [avgRead] = await db
    .select({ avg: sql<number>`avg(${articles.readingTime})::float` })
    .from(articles)
    .where(eq(articles.status, "published"));
  const [subs] = await db.select({ c: sql<number>`count(*)::int` }).from(newsletter);
  const [totalUsers] = await db.select({ c: sql<number>`count(*)::int` }).from(users);
  const topSearches = await db
    .select({ q: searches.query, c: sql<number>`count(*)::int` })
    .from(searches)
    .where(sql`${searches.createdAt} > ${since7}`)
    .groupBy(searches.query)
    .orderBy(desc(sql`count(*)`))
    .limit(10);
  const hourly = await db
    .select({
      h: sql<string>`to_char(date_trunc('hour', ${pageViews.at}), 'YYYY-MM-DD HH24:00')`,
      c: sql<number>`count(*)::int`,
    })
    .from(pageViews)
    .where(sql`${pageViews.at} > ${since}`)
    .groupBy(sql`date_trunc('hour', ${pageViews.at})`)
    .orderBy(sql`date_trunc('hour', ${pageViews.at})`);

  return NextResponse.json({
    restricted: false,
    realtime: { visitors24h: visitors24h.c, activeNow: Math.max(1, Math.round(visitors24h.c / 24)) },
    totals: {
      pageViews: totalViews.c,
      uniqueVisitors: uniqueAll.c,
      returning: returning.c,
      articles: popularArticles.length,
      subscribers: subs.c,
      users: totalUsers.c,
    },
    byCountry,
    byDevice,
    bySource,
    popularArticles,
    trendingCategories: trendingCats,
    avgReadingTime: Math.round((avgRead.avg ?? 3) * 10) / 10,
    topSearches,
    hourly,
  });
}
