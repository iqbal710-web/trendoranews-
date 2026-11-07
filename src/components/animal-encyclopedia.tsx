"use client";

import { useState } from "react";

type A = { id: number; name: string; scientificName: string; habitat: string; diet: string; conservation: string; lifespan: string; facts: string; emoji: string };

const CONSERVATION_COLORS: Record<string, string> = {
  "Least Concern": "bg-green-600",
  "Near Threatened": "bg-lime-600",
  "Vulnerable": "bg-amber-600",
  "Endangered": "bg-orange-600",
  "Critically Endangered": "bg-red-700",
};

export function AnimalEncyclopedia({ animals }: { animals: A[] }) {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("All");
  const groups = ["All", ...Array.from(new Set(animals.map((a) => a.habitat.split(",")[0].trim())))].slice(0, 12);
  const [open, setOpen] = useState<A | null>(null);

  const filtered = animals.filter(
    (a) =>
      (group === "All" || a.habitat.includes(group)) &&
      (!q || (a.name + a.scientificName + a.habitat + a.facts).toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2">
        <input className="input !w-64" placeholder="Search animals… (e.g. tiger, whale)" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input !w-52" value={group} onChange={(e) => setGroup(e.target.value)}>
          {groups.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
        <span className="text-xs font-semibold text-(--muted)">{filtered.length} species</span>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((a) => (
          <button key={a.id} className="card p-4 text-left" onClick={() => setOpen(a)}>
            <div className="flex items-center justify-between">
              <span className="text-3xl">{a.emoji}</span>
              <span className={`chip text-white ${CONSERVATION_COLORS[a.conservation] ?? "bg-slate-500"}`}>{a.conservation || "Unknown"}</span>
            </div>
            <h2 className="mt-2 font-black">{a.name}</h2>
            <p className="text-xs italic text-(--muted)">{a.scientificName}</p>
            <p className="mt-1 text-xs text-(--muted)">📍 {a.habitat || "—"}</p>
          </button>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/60 p-4" onClick={() => setOpen(null)}>
          <div className="card fade-up max-h-[85vh] w-full max-w-lg overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-5xl">{open.emoji}</span>
                <div>
                  <h2 className="text-2xl font-black">{open.name}</h2>
                  <p className="text-sm italic text-(--muted)">{open.scientificName}</p>
                </div>
              </div>
              <button className="btn !p-1.5" onClick={() => setOpen(null)}>✕</button>
            </div>
            <span className={`chip mt-3 text-white ${CONSERVATION_COLORS[open.conservation] ?? "bg-slate-500"}`}>
              Conservation: {open.conservation || "Unknown"}
            </span>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="label">Habitat</dt><dd className="font-semibold">{open.habitat || "—"}</dd></div>
              <div><dt className="label">Diet</dt><dd className="font-semibold">{open.diet || "—"}</dd></div>
              <div><dt className="label">Lifespan</dt><dd className="font-semibold">{open.lifespan || "—"}</dd></div>
            </dl>
            {open.facts && <p className="mt-3 text-sm text-(--muted)">{open.facts}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
