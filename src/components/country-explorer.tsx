"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type C = { name: string; code: string; region: string; capital: string; population: string; currency: string; languages: string; summary: string };

export function CountryExplorer({ countries }: { countries: C[] }) {
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("All");
  const regions = useMemo(() => ["All", ...Array.from(new Set(countries.map((c) => c.region)))], [countries]);
  const filtered = countries.filter(
    (c) =>
      (region === "All" || c.region === region) &&
      (!q || (c.name + c.capital + c.currency).toLowerCase().includes(q.toLowerCase()))
  );
  const [open, setOpen] = useState<C | null>(null);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2">
        <input className="input !w-64" placeholder="Search country, capital, currency…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input !w-48" value={region} onChange={(e) => setRegion(e.target.value)}>
          {regions.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <span className="text-xs font-semibold text-(--muted)">{filtered.length} countries</span>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((c) => (
          <button key={c.code} className="card p-4 text-left" onClick={() => setOpen(c)}>
            <div className="flex items-center justify-between">
              <span className="text-xl font-black">{c.name}</span>
              <span className="chip bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200">{c.code}</span>
            </div>
            <p className="mt-1 text-xs text-(--muted)">🏛 {c.capital || "—"} · {c.region}</p>
            <p className="mt-0.5 text-xs text-(--muted)">👥 {c.population || "—"}</p>
          </button>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/60 p-4" onClick={() => setOpen(null)}>
          <div className="card fade-up max-h-[85vh] w-full max-w-lg overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black">{open.name} <span className="text-sm text-(--muted)">({open.code})</span></h2>
              <button className="btn !p-1.5" onClick={() => setOpen(null)}>✕</button>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="label">Region</dt><dd className="font-semibold">{open.region}</dd></div>
              <div><dt className="label">Capital</dt><dd className="font-semibold">{open.capital || "—"}</dd></div>
              <div><dt className="label">Population</dt><dd className="font-semibold">{open.population || "—"}</dd></div>
              <div><dt className="label">Currency</dt><dd className="font-semibold">{open.currency || "—"}</dd></div>
              <div className="col-span-2"><dt className="label">Languages</dt><dd className="font-semibold">{open.languages || "—"}</dd></div>
            </dl>
            {open.summary && <p className="mt-3 text-sm text-(--muted)">{open.summary}</p>}
            <Link href={`/country/${encodeURIComponent(open.name)}`} className="btn btn-primary mt-5 w-full">
              📰 Read latest news from {open.name} →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
