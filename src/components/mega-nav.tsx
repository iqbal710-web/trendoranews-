"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Globe2, LayoutGrid } from "lucide-react";
import type { Category } from "@/db/schema";

export function MegaNav({
  categories,
  allCategories,
}: {
  categories: Category[];
  allCategories: Category[];
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);

  const childrenOf = (slug: string) =>
    allCategories.filter((c) => {
      const parent = allCategories.find((p) => p.id === c.parentId);
      return parent?.slug === slug;
    });

  return (
    <nav className="relative border-b border-(--line) bg-(--surface)">
      <div className="mx-auto hidden max-w-7xl items-center gap-1 px-4 lg:flex">
        <Link href="/" className="btn !border-0 !bg-transparent font-bold">
          Home
        </Link>
        {categories.map((c) => {
          const kids = childrenOf(c.slug);
          return (
            <div
              key={c.id}
              className="relative"
              onMouseEnter={() => setOpen(c.slug)}
              onMouseLeave={() => setOpen(null)}
            >
              <Link
                href={`/category/${c.slug}`}
                className="btn !border-0 !bg-transparent font-semibold"
              >
                {c.name}
                {kids.length > 0 && <ChevronDown size={14} />}
              </Link>
              {open === c.slug && kids.length > 0 && (
                <div className="fade-up absolute left-0 top-full z-50 grid w-[26rem] grid-cols-2 gap-1 rounded-xl border border-(--line) bg-(--surface) p-3 shadow-2xl">
                  {kids.map((k) => (
                    <Link
                      key={k.id}
                      href={`/category/${k.slug}`}
                      className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-red-50 hover:text-red-700 dark:hover:bg-slate-800"
                    >
                      <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: k.color ?? "#dc2626" }} />
                      {k.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <Link href="/explore" className="btn !border-0 !bg-transparent font-semibold">
          <LayoutGrid size={15} /> Explorers
        </Link>
        <Link href="/search" className="btn !border-0 !bg-transparent font-semibold">
          <Globe2 size={15} /> Advanced Search
        </Link>
      </div>

      {/* mobile bar */}
      <div className="flex items-center gap-2 overflow-x-auto px-4 py-2 lg:hidden">
        <button className="btn !px-3" onClick={() => setMobile(!mobile)}>
          ☰ Menu
        </button>
        <Link href="/" className="btn !border-0">Home</Link>
        {categories.slice(0, 10).map((c) => (
          <Link key={c.id} href={`/category/${c.slug}`} className="btn !border-0 whitespace-nowrap">
            {c.name}
          </Link>
        ))}
      </div>
      {mobile && (
        <div className="grid grid-cols-2 gap-1 border-t border-(--line) bg-(--surface) p-3 lg:hidden">
          {allCategories.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-red-50 dark:hover:bg-slate-800"
              onClick={() => setMobile(false)}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
