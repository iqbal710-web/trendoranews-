"use client";

import { useState } from "react";

type O = { id: number; name: string; type: string; distance: string; diameter: string; description: string; facts: string; emoji: string };

const TYPE_COLORS: Record<string, string> = {
  planet: "bg-blue-600",
  star: "bg-yellow-500",
  galaxy: "bg-violet-600",
  mission: "bg-emerald-600",
};

export function SpaceExplorer({ objects }: { objects: O[] }) {
  const [type, setType] = useState("All");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<O | null>(null);
  const types = ["All", ...Array.from(new Set(objects.map((o) => o.type)))];
  const filtered = objects.filter(
    (o) => (type === "All" || o.type === type) && (!q || (o.name + o.description + o.facts).toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2">
        {types.map((t) => (
          <button key={t} className={`btn !py-1.5 text-xs ${type === t ? "btn-primary" : ""}`} onClick={() => setType(t)}>
            {t}
          </button>
        ))}
        <input className="input ml-auto !w-60" placeholder="Search the cosmos…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((o) => (
          <button
            key={o.id}
            className="card p-4 text-left"
            onClick={() => setOpen(o)}
            style={{ background: "linear-gradient(160deg, var(--surface) 40%, rgba(124,58,237,0.12))" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">{o.emoji}</span>
              <span className={`chip text-white ${TYPE_COLORS[o.type] ?? "bg-slate-600"}`}>{o.type}</span>
            </div>
            <h2 className="mt-2 font-black">{o.name}</h2>
            <p className="mt-1 text-xs text-(--muted)">📏 {o.distance || "—"}</p>
          </button>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-4" onClick={() => setOpen(null)}>
          <div className="card fade-up max-h-[85vh] w-full max-w-lg overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-5xl">{open.emoji}</span>
                <div>
                  <h2 className="text-2xl font-black">{open.name}</h2>
                  <span className={`chip text-white ${TYPE_COLORS[open.type] ?? "bg-slate-600"}`}>{open.type}</span>
                </div>
              </div>
              <button className="btn !p-1.5" onClick={() => setOpen(null)}>✕</button>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="label">Distance from Earth</dt><dd className="font-semibold">{open.distance || "—"}</dd></div>
              <div><dt className="label">Diameter</dt><dd className="font-semibold">{open.diameter || "—"}</dd></div>
            </dl>
            <p className="mt-3 text-sm">{open.description}</p>
            {open.facts && <p className="mt-3 rounded-xl bg-violet-50 p-3 text-sm text-(--muted) dark:bg-violet-950/40">💫 {open.facts}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
