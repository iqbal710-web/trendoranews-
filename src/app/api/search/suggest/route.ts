import { NextRequest, NextResponse } from "next/server";
import { ilike, sql, desc } from "drizzle-orm";
import { db } from "@/db";
import { articles, searches, tags, users } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ suggestions: [] });
  const like = `%${q}%`;

  const [titles, tagNames, authors, trending] = await Promise.all([
    db
      .selectDistinct({ t: articles.title })
      .from(articles)
      .where(ilike(articles.title, like))
      .limit(5),
    db.select({ t: tags.name }).from(tags).where(ilike(tags.name, like)).limit(4),
    db.select({ t: users.name }).from(users).where(ilike(users.name, like)).limit(3),
    db
      .select({ q: searches.query })
      .from(searches)
      .where(ilike(searches.query, like))
      .groupBy(searches.query)
      .orderBy(desc(sql`count(*)`))
      .limit(4),
  ]);

  const suggestions = [
    ...titles.map((r) => r.t),
    ...tagNames.map((r) => `#${r.t}`),
    ...authors.map((r) => `author: ${r.t}`),
    ...trending.map((r) => r.q),
  ].slice(0, 8);

  return NextResponse.json({ suggestions });
}
