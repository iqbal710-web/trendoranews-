"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function LiveHub({ initialActive }: { initialActive: number }) {
  const [active, setActive] = useState(initialActive);
  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const res = await fetch("/api/breaking?active=1", { cache: "no-store" });
        const data = await res.json();
        setActive((data.items ?? []).length);
      } catch {
        /* ignore */
      }
    }, 20000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
      <span className="live-dot h-3 w-3 rounded-full bg-red-600" />
      <p className="text-sm font-bold">
        {active > 0 ? `${active} live story${active > 1 ? "ies" : ""} being covered right now` : "No active live stories at the moment"}
      </p>
      <Link href="/api/breaking?active=1" className="ml-auto text-xs font-bold text-red-600 hover:underline">
        JSON feed →
      </Link>
    </div>
  );
}
