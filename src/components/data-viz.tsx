"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";

type Analytics = {
  restricted?: boolean;
  totals?: { pageViews: number; articles: number; subscribers: number };
  byCountry?: { country: string; c: number }[];
  byDevice?: { device: string; c: number }[];
  popularArticles?: { slug: string; title: string; views: number; likes: number; shares: number }[];
  trendingCategories?: { name: string; slug: string; c: number }[];
  hourly?: { h: string; c: number }[];
};

function Bar({ label, value, max, color = "#dc2626" }: { label: string; value: number; max: number; color?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-40 truncate text-xs font-semibold" title={label}>{label}</span>
      <div className="h-5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div className="h-full rounded-full transition-all" style={{ width: `${max ? (value / max) * 100 : 0}%`, background: color }} />
      </div>
      <span className="w-14 text-right text-xs font-bold">{value}</span>
    </div>
  );
}

export function DataViz() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return <p className="mt-6 text-sm text-(--muted)">Loading charts…</p>;

  const totals = data.totals;
  const hourly = data.hourly ?? [];
  const hourlyMax = Math.max(1, ...hourly.map((h) => h.c));

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="card p-6">
        <h2 className="flex items-center gap-2 font-black"><BarChart3 size={18} className="text-red-600" /> Platform totals</h2>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-red-50 p-4 dark:bg-red-950/40">
            <p className="text-2xl font-black text-red-600">{totals?.pageViews ?? 0}</p>
            <p className="text-xs font-semibold text-(--muted)">Page views</p>
          </div>
          <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950/40">
            <p className="text-2xl font-black text-blue-600">{totals?.articles ?? 0}</p>
            <p className="text-xs font-semibold text-(--muted)">Articles</p>
          </div>
          <div className="rounded-xl bg-green-50 p-4 dark:bg-green-950/40">
            <p className="text-2xl font-black text-green-600">{totals?.subscribers ?? 0}</p>
            <p className="text-xs font-semibold text-(--muted)">Subscribers</p>
          </div>
        </div>
      </div>

      {data.byCountry && data.byCountry.length > 0 && (
        <div className="card p-6">
          <h2 className="font-black">🌍 Visitors by country</h2>
          <div className="mt-4 flex flex-col gap-2">
            {data.byCountry.map((c) => (
              <Bar key={c.country} label={c.country || "Unknown"} value={c.c} max={data.byCountry![0].c} color="#2563eb" />
            ))}
          </div>
        </div>
      )}

      {data.byDevice && data.byDevice.length > 0 && (
        <div className="card p-6">
          <h2 className="font-black">📱 Device statistics</h2>
          <div className="mt-4 flex flex-col gap-2">
            {data.byDevice.map((d) => (
              <Bar key={d.device} label={d.device} value={d.c} max={Math.max(...data.byDevice!.map((x) => x.c))} color="#0d9488" />
            ))}
          </div>
        </div>
      )}

      {data.trendingCategories && data.trendingCategories.length > 0 && (
        <div className="card p-6">
          <h2 className="font-black">🔥 Trending categories (7 days)</h2>
          <div className="mt-4 flex flex-col gap-2">
            {data.trendingCategories.map((c) => (
              <Bar key={c.slug} label={c.name} value={c.c} max={data.trendingCategories![0].c} color="#f59e0b" />
            ))}
          </div>
        </div>
      )}

      {data.popularArticles && data.popularArticles.length > 0 && (
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-black">🏆 Most popular articles</h2>
          <div className="mt-4 flex flex-col gap-2">
            {data.popularArticles.map((a) => (
              <Bar key={a.slug} label={a.title} value={a.views} max={data.popularArticles![0].views} color="#dc2626" />
            ))}
          </div>
        </div>
      )}

      {hourly.length > 0 && (
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-black">⏱️ Visitors per hour (24h)</h2>
          <div className="mt-4 flex h-40 items-end gap-1">
            {hourly.map((h) => (
              <div
                key={h.h}
                className="flex-1 rounded-t bg-gradient-to-t from-red-700 to-orange-400"
                style={{ height: `${(h.c / hourlyMax) * 100}%` }}
                title={`${h.h}: ${h.c} views`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
