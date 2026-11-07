import type { Metadata } from "next";
import Link from "next/link";
import { queryArticles, distinctCountries } from "@/lib/data";
import { LatestSection } from "@/components/latest-section";
import { SectionHeading } from "@/components/section-heading";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params;
  const country = decodeURIComponent(name);
  return {
    title: `${country} News`,
    description: `Latest news, politics and updates from ${country} on TrendoraNews.`,
    alternates: { canonical: `/country/${name}` },
  };
}

export default async function CountryPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const country = decodeURIComponent(name);
  const { cards, hasMore } = await queryArticles({ country, sort: "latest", limit: 12 });
  const countries = await distinctCountries();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <nav className="text-xs text-(--muted)">
        <Link href="/" className="hover:underline">Home</Link> / <span className="font-semibold text-(--ink)">{country}</span>
      </nav>
      <h1 className="mt-4 text-3xl font-black tracking-tight">🇺🇳 News from {country}</h1>
      <div className="mt-5 flex flex-wrap gap-2">
        {countries.map((c) => (
          <Link
            key={c}
            href={`/country/${encodeURIComponent(c)}`}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              c === country
                ? "border-red-600 bg-red-600 text-white"
                : "border-(--line) bg-(--surface) hover:border-red-600 hover:text-red-600"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>
      <div className="mt-8">
        <SectionHeading title={`Latest in ${country}`} />
        {cards.length === 0 ? (
          <p className="card p-8 text-center text-(--muted)">No stories from {country} yet.</p>
        ) : (
          <LatestSection initial={cards} hasMore={hasMore} params={{ country, sort: "latest" }} />
        )}
      </div>
    </main>
  );
}
