import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { breakingNews } from "@/db/schema";
import { getBreakingWithUpdates } from "@/lib/data";
import { LiveBlog } from "@/components/live-blog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const rows = await db.select().from(breakingNews).where(eq(breakingNews.slug, slug)).limit(1);
  const b = rows[0];
  return {
    title: b ? `LIVE: ${b.title}` : "Live blog",
    description: b?.summary || "Live breaking news coverage on TrendoraNews.",
  };
}

export default async function BreakingSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await getBreakingWithUpdates(
    (await db.select({ id: breakingNews.id }).from(breakingNews).where(eq(breakingNews.slug, slug)).limit(1))[0]?.id ?? -1
  );
  if (!found) notFound();
  const { breaking, updates } = found;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <nav className="text-xs text-(--muted)">
        <Link href="/breaking" className="hover:underline">← Live desk</Link>
      </nav>
      <LiveBlog
        breaking={{
          id: breaking.id,
          slug: breaking.slug,
          title: breaking.title,
          summary: breaking.summary ?? "",
          content: breaking.content ?? "",
          status: breaking.status,
          severity: breaking.severity,
          country: breaking.country ?? "",
          startedAt: breaking.startedAt.toISOString(),
          updatedAt: breaking.updatedAt.toISOString(),
        }}
        initialUpdates={updates.map((u) => ({
          id: u.update.id,
          content: u.update.content,
          createdAt: u.update.createdAt.toISOString(),
          authorName: u.author?.name ?? "Desk",
        }))}
      />
    </main>
  );
}
