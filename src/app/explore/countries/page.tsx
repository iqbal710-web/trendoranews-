import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { countries } from "@/db/schema";
import { CountryExplorer } from "@/components/country-explorer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Country Explorer",
  description: "Facts, capitals, currencies and latest news for every country in the world.",
};

export default async function CountriesPage() {
  const all = await db.select().from(countries).orderBy(countries.name);
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-black tracking-tight">🌍 Country Explorer</h1>
      <p className="mt-2 text-sm text-(--muted)">Search and filter countries, then open a country to see its profile and latest news.</p>
      <CountryExplorer
        countries={all.map((c) => ({
          name: c.name,
          code: c.code,
          region: c.region,
          capital: c.capital ?? "",
          population: c.population ?? "",
          currency: c.currency ?? "",
          languages: c.languages ?? "",
          summary: c.summary ?? "",
        }))}
      />
      <p className="mt-6 text-sm text-(--muted)">
        News by country:{" "}
        {all.slice(0, 25).map((c, i) => (
          <span key={c.code}>
            <Link href={`/country/${encodeURIComponent(c.name)}`} className="font-semibold text-red-600 hover:underline">{c.name}</Link>
            {i < Math.min(24, all.length - 1) && ", "}
          </span>
        ))}
      </p>
    </main>
  );
}
