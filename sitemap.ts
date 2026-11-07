import type { MetadataRoute } from "next";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const [published, cats] = await Promise.all([
    db.select({ slug: articles.slug, updatedAt: articles.updatedAt }).from(articles).where(eq(articles.status, "published")).limit(5000),
    db.select({ slug: categories.slug }).from(categories).limit(500),
  ]);

  const staticRoutes = [
    "", "/breaking", "/search", "/videos", "/gallery", "/explore", "/explore/map",
    "/explore/timeline", "/explore/countries", "/explore/animals", "/explore/space",
    "/explore/fact-check", "/explore/explainers", "/explore/data", "/category",
    "/auth/login", "/auth/register",
  ].map((p) => ({
    url: `${base}${p === "" ? "/" : p}`,
    lastModified: new Date(),
    changeFrequency: "hourly" as const,
    priority: p === "" ? 1 : 0.8,
  }));

  return [
    ...staticRoutes,
    ...cats.map((c) => ({
      url: `${base}/category/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.8,
    })),
    ...published.map((a) => ({
      url: `${base}/article/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
  ];
}
