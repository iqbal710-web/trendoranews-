import type { Metadata } from "next";
import { db } from "@/db";
import { countries } from "@/db/schema";
import { WorldMap } from "@/components/world-map";
import { queryArticles } from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { MiniList } from "@/components/mini-list";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Interactive World News Map",
  description: "Explore breaking news and stories from every country on an interactive world map.",
};

export default async function WorldMapPage() {
  const all = await db.select().from(countries).orderBy(countries.name);
  const latest = await queryArticles({ sort: "latest", limit: 8 });
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-black tracking-tight">🗺️ Interactive World News Map</h1>
      <p className="mt-2 text-sm text-(--muted)">
        Hover or tap a marker to see the country — click to open its full news page.
      </p>
      <div className="card mt-6 p-4">
        <WorldMap countries={all.map((c) => ({ name: c.name, code: c.code, mapX: c.mapX ?? 0, mapY: c.mapY ?? 0 }))} />
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionHeading title="Latest worldwide" />
          <MiniList items={latest.cards} />
        </div>
        <div>
          <SectionHeading title="Browse countries" accent="#2563eb" />
          <div className="flex flex-wrap gap-1.5">
            {all.slice(0, 60).map((c) => (
              <a
                key={c.code}
                href={`/country/${encodeURIComponent(c.name)}`}
                className="rounded-md border border-(--line) bg-(--surface) px-2 py-1 text-[11px] font-semibold hover:border-blue-600 hover:text-blue-600"
              >
                {c.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
