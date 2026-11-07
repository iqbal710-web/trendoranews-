"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Filter, Search, TrendingUp } from "lucide-react";
import type { ArticleCard } from "@/lib/data";
import { ArticleCardView } from "@/components/article-card";

type Cat = { id: number; name: string; slug: string; parentId: number | null };

export function SearchClient() {
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [category, setCategory] = useState(sp.get("category") ?? "");
  const [country, setCountry] = useState(sp.get("country") ?? "");
  const [region, setRegion] = useState(sp.get("region") ?? "");
  const [tag, setTag] = useState(sp.get("tag") ?? "");
  const [type, setType] = useState(sp.get("type") ?? "");
  const [author, setAuthor] = useState(sp.get("author") ?? "");
  const [sort, setSort] = useState(sp.get("sort") ?? "latest");
  const [dateFrom, setDateFrom] = useState(sp.get("from") ?? "");
  const [dateTo, setDateTo] = useState(sp.get("to") ?? "");

  const [cats, setCats] = useState<Cat[]>([]);
  const [items, setItems] = useState<ArticleCard[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [correction, setCorrection] = useState<string | null>(null);
  const [trending, setTrending] = useState<{ q: string; count: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCats(d.items ?? []))
      .catch(() => {});
    fetch("/api/search/trending")
      .then((r) => r.json())
      .then((d) => setTrending(d.trending ?? []))
      .catch(() => {});
    setHistory(JSON.parse(localStorage.getItem("trendora_search_history") ?? "[]"));
  }, []);

  const run = useCallback(
    async (cursor?: number) => {
      setLoading(true);
      const p = new URLSearchParams();
      if (q.trim()) p.set("q", q.trim());
      if (category) p.set("category", category);
      if (country.trim()) p.set("country", country.trim());
      if (region.trim()) p.set("region", region.trim());
      if (tag.trim()) p.set("tag", tag.trim().replace(/^#/, ""));
      if (type) p.set("type", type);
      if (author.trim()) p.set("author", author.trim());
      p.set("sort", sort);
      if (cursor) p.set("cursor", String(cursor));
      if (dateFrom) p.set("from", dateFrom);
      if (dateTo) p.set("to", dateTo);
      const res = await fetch(`/api/search/run?${p.toString()}`, {
        headers: { "x-session-id": sessionStorage.getItem("trendora_sid") ?? "" },
      });
      const data = await res.json();
      if (cursor) setItems((prev) => [...prev, ...(data.items ?? [])]);
      else setItems(data.items ?? []);
      setHasMore(!!data.hasMore);
      setCorrection(data.correction ?? null);
      setSearched(true);
      setLoading(false);
      if (q.trim()) {
        const h = [q.trim(), ...JSON.parse(localStorage.getItem("trendora_search_history") ?? "[]")].filter(
          (v, i, a) => a.indexOf(v) === i
        ).slice(0, 10);
        localStorage.setItem("trendora_search_history", JSON.stringify(h));
        setHistory(h);
      }
    },
    [q, category, country, region, tag, type, author, sort, dateFrom, dateTo]
  );

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight">
        <Search className="text-red-600" /> Advanced Search
      </h1>
      <p className="mt-1 text-sm text-(--muted)">
        Search by keyword, author, category, country, region, date, tags and article type.
      </p>

      <div className="card mt-6 p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-3">
            <label className="label">Keywords</label>
            <input
              className="input"
              placeholder="e.g. flood, cricket, AI, election…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && run()}
            />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              {cats.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.parentId ? "— " : ""}{c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Country</label>
            <input className="input" placeholder="Bangladesh, India…" value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
          <div>
            <label className="label">Region</label>
            <input className="input" placeholder="South Asia, Europe…" value={region} onChange={(e) => setRegion(e.target.value)} />
          </div>
          <div>
            <label className="label">Tag</label>
            <input className="input" placeholder="#climate" value={tag} onChange={(e) => setTag(e.target.value)} />
          </div>
          <div>
            <label className="label">Article type</label>
            <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">All types</option>
              {["news", "opinion", "investigation", "feature", "video", "gallery", "live"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Author name</label>
            <input className="input" placeholder="Author name…" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
          <div>
            <label className="label">From date</label>
            <input className="input" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="label">To date</label>
            <input className="input" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div>
            <label className="label">Sort by</label>
            <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="latest">Latest</option>
              <option value="popular">Most viewed</option>
              <option value="trending">Trending</option>
              <option value="shared">Most shared</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button className="btn btn-primary" onClick={() => run()}>
            <Search size={15} /> Search
          </button>
          <button
            className="btn"
            onClick={() => {
              setQ(""); setCategory(""); setCountry(""); setRegion(""); setTag(""); setType(""); setAuthor(""); setDateFrom(""); setDateTo("");
              setTimeout(() => run(), 0);
            }}
          >
            Clear filters
          </button>
          <span className="ml-auto text-xs font-semibold text-(--muted)">
            <Filter size={12} className="mr-1 inline" />
            {loading ? "Searching…" : searched ? `${items.length} result${items.length === 1 ? "" : "s"}` : ""}
          </span>
        </div>
      </div>

      {/* trending + history */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="card p-5">
          <p className="label flex items-center gap-1"><TrendingUp size={13} /> Trending searches</p>
          <div className="flex flex-wrap gap-2">
            {trending.map((t) => (
              <button key={t.q} className="btn !py-1 text-xs" onClick={() => { setQ(t.q); setTimeout(() => run(), 0); }}>
                {t.q} <span className="text-(--muted)">×{t.count}</span>
              </button>
            ))}
            {trending.length === 0 && <span className="text-sm text-(--muted)">No trending searches yet.</span>}
          </div>
        </div>
        <div className="card p-5">
          <p className="label">Your search history</p>
          <div className="flex flex-wrap gap-2">
            {history.map((h) => (
              <button key={h} className="btn !py-1 text-xs" onClick={() => { setQ(h); setTimeout(() => run(), 0); }}>
                {h}
              </button>
            ))}
            {history.length === 0 && <span className="text-sm text-(--muted)">Nothing searched yet.</span>}
          </div>
        </div>
      </div>

      {correction && (
        <p className="mt-6 text-sm">
          No results for <b>“{q}”</b>. Did you mean{" "}
          <button className="font-bold text-red-600 hover:underline" onClick={() => { setQ(correction); setTimeout(() => run(), 0); }}>
            “{correction}”
          </button>?
        </p>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a) => (
          <ArticleCardView key={a.id} a={a} />
        ))}
      </div>
      {!loading && searched && items.length === 0 && (
        <div className="card mt-6 p-10 text-center text-(--muted)">
          No stories match your filters. Try broader keywords or{" "}
          <Link href="/" className="font-semibold text-red-600 hover:underline">browse the homepage</Link>.
        </div>
      )}
      {hasMore && (
        <div className="mt-8 text-center">
          <button
            className="btn btn-primary"
            disabled={loading}
            onClick={() => run(items.length ? items[items.length - 1].id : undefined)}
          >
            {loading ? "Loading…" : "Load more results"}
          </button>
        </div>
      )}
    </main>
  );
}
