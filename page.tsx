import Link from "next/link";
import type { Metadata } from "next";
import { Flame, Globe2, Map, Newspaper, Share2, Star, TrendingUp } from "lucide-react";
import { queryArticles, distinctCountries, distinctRegions, getAllCategories } from "@/lib/data";
import { HeroCarousel } from "@/components/hero-carousel";
import { LatestSection } from "@/components/latest-section";
import { SectionHeading } from "@/components/section-heading";
import { ArticleCardView } from "@/components/article-card";
import { MiniList } from "@/components/mini-list";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Breaking News, Bangladesh & World — Live Updates",
  description:
    "TrendoraNews homepage: featured hero stories, top stories, trending, editor's choice, latest news with infinite scroll, news by category, country and region.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [hero, latest, topStories, trending, editors, mostRead, mostShared, popularWeek, cats, countries, regions] =
    await Promise.all([
      queryArticles({ featured: true, sort: "latest", limit: 5 }),
      queryArticles({ sort: "latest", limit: 12 }),
      queryArticles({ sort: "popular", limit: 5 }),
      queryArticles({ sort: "trending", limit: 6 }),
      queryArticles({ editorChoice: true, sort: "latest", limit: 4 }),
      queryArticles({ sort: "popular", limit: 5 }),
      queryArticles({ sort: "shared", limit: 5 }),
      queryArticles({ sort: "trending", limit: 6 }),
      getAllCategories(),
      distinctCountries(),
      distinctRegions(),
    ]);

  const byCategory = await Promise.all(
    ["bangladesh", "world", "business", "technology", "sports", "science"].map(async (slug) => ({
      slug,
      ...(await queryArticles({ category: slug, sort: "latest", limit: 4 })),
    }))
  );

  const topLevel = cats.filter((c) => !c.parentId);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      {/* HERO */}
      <HeroCarousel items={hero.cards.length ? hero.cards : latest.cards.slice(0, 5)} />

      {/* MAIN + SIDEBAR */}
      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <LatestSection
            initial={latest.cards}
            hasMore={latest.hasMore}
            params={{ sort: "latest" }}
          />
        </section>

        <aside className="flex flex-col gap-8">
          <section className="card p-5">
            <SectionHeading title="Top Stories" accent="#f59e0b" />
            <MiniList items={topStories.cards} numbered />
          </section>
          <section className="card p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-6 w-1.5 rounded-full bg-red-600" />
              <h2 className="text-xl font-black">Trending Now</h2>
              <TrendingUp size={18} className="text-red-600" />
            </div>
            <MiniList items={trending.cards} />
          </section>
          <section className="card p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-6 w-1.5 rounded-full bg-violet-600" />
              <h2 className="text-xl font-black">Editor&apos;s Choice</h2>
              <Star size={18} className="text-violet-600" />
            </div>
            <MiniList items={editors.cards} />
          </section>
          <section className="card p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-6 w-1.5 rounded-full bg-sky-600" />
              <h2 className="text-xl font-black">Most Read</h2>
              <Flame size={18} className="text-sky-600" />
            </div>
            <MiniList items={mostRead.cards} numbered />
          </section>
          <section className="card p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-6 w-1.5 rounded-full bg-emerald-600" />
              <h2 className="text-xl font-black">Most Shared</h2>
              <Share2 size={18} className="text-emerald-600" />
            </div>
            <MiniList items={mostShared.cards} />
          </section>
        </aside>
      </div>

      {/* POPULAR THIS WEEK */}
      <section className="mt-12">
        <SectionHeading title="Popular This Week" accent="#0ea5e9" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {popularWeek.cards.map((a) => (
            <ArticleCardView key={a.id} a={a} />
          ))}
        </div>
      </section>

      {/* NEWS BY CATEGORY */}
      <section className="mt-12">
        <SectionHeading title="News by Category" href="/category" accent="#dc2626" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topLevel.slice(0, 9).map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="card group flex items-center gap-3 p-4"
            >
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg font-black text-white"
                style={{ background: c.color ?? "#dc2626" }}
              >
                {c.name.charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold group-hover:text-red-600">{c.name}</p>
                <p className="text-xs text-(--muted)">{c.articleCount} stories</p>
              </div>
            </Link>
          ))}
        </div>
        {byCategory.map(({ slug, cards }) =>
          cards.length ? (
            <div key={slug} className="mt-10">
              <SectionHeading
                title={topLevel.find((c) => c.slug === slug)?.name ?? slug}
                href={`/category/${slug}`}
                accent="#dc2626"
              />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((a) => (
                  <ArticleCardView key={a.id} a={a} />
                ))}
              </div>
            </div>
          ) : null
        )}
      </section>

      {/* NEWS BY COUNTRY */}
      <section className="mt-12">
        <div className="mb-4 flex items-center gap-3">
          <span className="h-6 w-1.5 rounded-full bg-blue-600" />
          <h2 className="text-xl font-black sm:text-2xl">News by Country</h2>
          <Globe2 size={20} className="text-blue-600" />
        </div>
        <div className="flex flex-wrap gap-2">
          {countries.map((c) => (
            <Link
              key={c}
              href={`/country/${encodeURIComponent(c)}`}
              className="rounded-full border border-(--line) bg-(--surface) px-4 py-1.5 text-sm font-semibold hover:border-red-600 hover:text-red-600"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      {/* NEWS BY REGION */}
      <section className="mt-10">
        <div className="mb-4 flex items-center gap-3">
          <span className="h-6 w-1.5 rounded-full bg-teal-600" />
          <h2 className="text-xl font-black sm:text-2xl">News by Region</h2>
          <Map size={20} className="text-teal-600" />
        </div>
        <div className="flex flex-wrap gap-2">
          {regions.map((r) => (
            <Link
              key={r}
              href={`/region/${encodeURIComponent(r)}`}
              className="rounded-full border border-(--line) bg-(--surface) px-4 py-1.5 text-sm font-semibold hover:border-teal-600 hover:text-teal-600"
            >
              {r}
            </Link>
          ))}
        </div>
      </section>

      {/* categories index strip */}
      <section className="mt-12 rounded-2xl border border-(--line) bg-(--surface) p-6">
        <div className="mb-4 flex items-center gap-3">
          <Newspaper size={20} className="text-red-600" />
          <h2 className="text-xl font-black">All Sections</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <Link key={c.id} href={`/category/${c.slug}`} className="btn !py-1.5 text-xs">
              {c.name}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
