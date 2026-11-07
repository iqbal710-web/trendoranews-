import type { Metadata } from "next";
import Link from "next/link";
import { queryArticles, distinctRegions } from "@/lib/data";
import { LatestSection } from "@/components/latest-section";
import { SectionHeading } from "@/components/section-heading";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params;
  const region = decodeURIComponent(name);
  return {
    title: `${region} News`,
    description: `News and analysis from the ${region} region on TrendoraNews.`,
  };
}

export default async function RegionPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const region = decodeURIComponent(name);
  const { cards, hasMore } = await queryArticles({ region, sort: "latest", limit: 12 });
  const regions = await distinctRegions();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-black tracking-tight">🗺️ {region}</h1>
      <div className="mt-5 flex flex-wrap gap-2">
        {regions.map((r) => (
          <Link
            key={r}
            href={`/region/${encodeURIComponent(r)}`}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              r === region
                ? "border-teal-600 bg-teal-600 text-white"
                : "border-(--line) bg-(--surface) hover:border-teal-600 hover:text-teal-600"
            }`}
          >
            {r}
          </Link>
        ))}
      </div>
      <div className="mt-8">
        <SectionHeading title={`Latest in ${region}`} accent="#0d9488" />
        {cards.length === 0 ? (
          <p className="card p-8 text-center text-(--muted)">No stories from {region} yet.</p>
        ) : (
          <LatestSection initial={cards} hasMore={hasMore} params={{ region, sort: "latest" }} />
        )}
      </div>
    </main>
  );
}
