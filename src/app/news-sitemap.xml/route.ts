import { db } from "@/db";
import { articles } from "@/db/schema";
import { and, desc, eq, gt } from "drizzle-orm";

export const dynamic = "force-dynamic";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Google News sitemap: only articles from the last 48 hours
export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const since = new Date(Date.now() - 48 * 3600 * 1000);
  const rows = await db
    .select()
    .from(articles)
    .where(and(eq(articles.status, "published"), gt(articles.publishedAt, since)))
    .orderBy(desc(articles.publishedAt))
    .limit(1000);

  const items = rows
    .map(
      (a) => `  <url>
    <loc>${base}/article/${a.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>TrendoraNews</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${a.publishedAt.toISOString()}</news:publication_date>
      <news:title>${esc(a.title)}</news:title>
    </news:news>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
