import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { tags } from "@/db/schema";
import { queryArticles } from "@/lib/data";
import { LatestSection } from "@/components/latest-section";
import { SectionHeading } from "@/components/section-heading";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: `#${slug} — Tag`, description: `All stories tagged #${slug} on TrendoraNews.` };
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await db.select().from(tags).where(eq(tags.slug, slug)).limit(1);
  const tag = rows[0];
  const { cards, hasMore } = await queryArticles({ tag: slug, sort: "latest", limit: 12 });
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-black tracking-tight">#{tag?.name ?? slug}</h1>
      <div className="mt-8">
        <SectionHeading title={`Stories tagged #${tag?.name ?? slug}`} />
        <LatestSection initial={cards} hasMore={hasMore} params={{ tag: slug, sort: "latest" }} />
      </div>
    </main>
  );
}
