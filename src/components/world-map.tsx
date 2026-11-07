"use client";

import Link from "next/link";
import { useState } from "react";

type MapCountry = { name: string; code: string; mapX: number; mapY: number };

// Simplified world map drawn as an equirectangular SVG (viewBox 0 0 1000 500)
const CONTINENTS: { d: string; fill: string }[] = [
  // North America
  { d: "M60,90 L150,60 L260,70 L300,110 L280,150 L240,190 L200,230 L170,210 L140,170 L90,140 Z", fill: "#dbeafe" },
  // South America
  { d: "M240,260 L290,250 L310,300 L290,370 L260,430 L240,380 L230,310 Z", fill: "#dcfce7" },
  // Europe
  { d: "M470,80 L540,60 L580,90 L560,130 L520,150 L480,140 L460,110 Z", fill: "#fef3c7" },
  // Africa
  { d: "M470,180 L550,170 L590,220 L570,300 L530,350 L500,300 L470,240 Z", fill: "#ffedd5" },
  // Asia
  { d: "M590,60 L760,50 L880,90 L900,140 L840,190 L760,210 L700,180 L640,150 L600,110 Z", fill: "#fee2e2" },
  // SE Asia / Indonesia
  { d: "M760,230 L860,225 L880,250 L800,265 Z", fill: "#fee2e2" },
  // Australia
  { d: "M800,320 L890,310 L910,360 L850,390 L790,370 Z", fill: "#ede9fe" },
];

export function WorldMap({ countries }: { countries: MapCountry[] }) {
  const [hover, setHover] = useState<MapCountry | null>(null);
  return (
    <div className="relative">
      <svg viewBox="0 0 1000 500" className="w-full rounded-xl bg-gradient-to-b from-sky-100 to-blue-200 dark:from-slate-800 dark:to-slate-900">
        <defs>
          <pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="rgba(100,116,139,0.25)" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="1000" height="500" fill="url(#dots)" />
        {CONTINENTS.map((c, i) => (
          <path key={i} d={c.d} fill={c.fill} stroke="#94a3b8" strokeWidth="1.5" />
        ))}
        {countries
          .filter((c) => c.mapX > 0 && c.mapY > 0)
          .map((c) => (
            <Link key={c.code} href={`/country/${encodeURIComponent(c.name)}`}>
              <g
                transform={`translate(${c.mapX},${c.mapY})`}
                onMouseEnter={() => setHover(c)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer" }}
              >
                <circle r={hover?.code === c.code ? 9 : 6} fill="#dc2626" opacity={hover?.code === c.code ? 0.35 : 0.2}>
                  <animate attributeName="r" values="5;9;5" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle r="4" fill="#dc2626" stroke="#fff" strokeWidth="1.5" />
              </g>
            </Link>
          ))}
      </svg>
      {hover && (
        <div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-xl">
          {hover.name} — click for news →
        </div>
      )}
      <p className="mt-2 text-center text-xs text-(--muted)">
        {countries.filter((c) => c.mapX > 0).length} news hotspots pinned worldwide
      </p>
    </div>
  );
}
