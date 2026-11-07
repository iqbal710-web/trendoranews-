"use client";

import { useMemo, useState } from "react";

type Ev = { id: number; year: number; title: string; description: string; category: string; country: string; emoji: string };

export function TimelineExplorer({ events }: { events: Ev[] }) {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const cats = useMemo(() => ["All", ...Array.from(new Set(events.map((e) => e.category)))], [events]);
  const filtered = events
    .filter((e) => (cat === "All" || e.category === cat))
    .filter((e) => !q || (e.title + e.description + e.country).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2">
        {cats.map((c) => (
          <button
            key={c}
            className={`btn !py-1.5 text-xs ${cat === c ? "btn-primary" : ""}`}
            onClick={() => setCat(c)}
          >
            {c}
          </button>
        ))}
        <input className="input ml-auto !w-56" placeholder="Search events…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <ol className="relative mt-8 border-l-2 border-amber-500/60 pl-8">
        {filtered.map((e) => (
          <li key={e.id} className="fade-up relative mb-8">
            <span className="absolute -left-[41px] top-0 grid h-5 w-5 place-items-center rounded-full border-2 border-white bg-amber-500 text-[9px] font-black text-white dark:border-slate-900" />
            <div className="card p-5">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="chip bg-amber-600 text-white">{e.year < 0 ? `${-e.year} BCE` : `${e.year} CE`}</span>
                <span className="chip bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200">{e.category}</span>
                {e.country && <span className="chip bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">{e.country}</span>}
              </div>
              <h2 className="mt-2 text-lg font-black">{e.emoji} {e.title}</h2>
              <p className="mt-1 text-sm text-(--muted)">{e.description}</p>
            </div>
          </li>
        ))}
        {filtered.length === 0 && <p className="text-sm text-(--muted)">No events match.</p>}
      </ol>
    </div>
  );
}
