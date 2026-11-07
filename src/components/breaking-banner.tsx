"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

export function BreakingBanner({ item }: { item: { slug: string; title: string; severity: string } }) {
  const [show, setShow] = useState(true);
  if (!show) return null;
  return (
    <div className="breaking-banner flex items-center gap-3 bg-gradient-to-r from-red-700 via-red-600 to-red-700 px-4 py-2 text-sm text-white">
      <AlertTriangle size={16} className="shrink-0 animate-pulse" />
      <span className="hidden font-black uppercase tracking-wider sm:inline">Emergency Alert</span>
      <Link href={`/breaking/${item.slug}`} className="truncate font-semibold hover:underline">
        {item.title}
      </Link>
      <Link
        href={`/breaking/${item.slug}`}
        className="ml-auto shrink-0 rounded-md bg-white px-2.5 py-1 text-xs font-bold text-red-700 hover:bg-red-50"
      >
        Follow Live
      </Link>
      <button onClick={() => setShow(false)} aria-label="Dismiss" className="shrink-0 opacity-80 hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  );
}
