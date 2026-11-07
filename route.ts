import { db } from "@/db";
import { articles } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const rows = await db
    .select()
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt))
    .limit(100);

  const items = rows
    .map(
      (a) => `<item>
  <title>${esc(a.title)}</title>
  <link>${base}/article/${a.slug}</link>
  <guid isPermaLink="true">${base}/article/${a.slug}</guid>
  <pubDate>${a.publishedAt.toUTCString()}</pubDate>
  <description>${esc(a.excerpt ?? "")}</description>
</item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>TrendoraNews — Latest News</title>
  <link>${base}</link>
  <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml"/>
  <description>Breaking news, Bangladesh, world, business, tech, sports and more from TrendoraNews.</description>
  <language>en</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
