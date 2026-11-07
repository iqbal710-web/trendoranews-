"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Eye } from "lucide-react";
import type { ArticleCard } from "@/lib/data";
import { coverSrc } from "@/components/cover";
import { timeAgo } from "@/lib/utils";

export function HeroCarousel({ items }: { items: ArticleCard[] }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 6000);
    return () => clearInterval(t);
  }, [paused, items.length]);

  if (!items.length) return null;
  const current = items[idx];

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-(--line)"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-[16/8] w-full sm:aspect-[21/9]">
        {items.map((a, i) => (
          <div
            key={a.id}
            className={`absolute inset-0 transition-opacity duration-700 ${i === idx ? "opacity-100" : "opacity-0"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverSrc(a)} alt={a.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
          </div>
        ))}

        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
          <div className="fade-up max-w-3xl" key={current.id}>
            <div className="flex flex-wrap items-center gap-2 text-[10px]">
              {current.category && (
                <span className="chip text-white" style={{ background: current.category.color ?? "#dc2626" }}>
                  {current.category.name}
                </span>
              )}
              {current.breaking && <span className="chip bg-red-600 text-white">● Breaking</span>}
              {current.featured && <span className="chip bg-amber-500 text-white">Featured</span>}
            </div>
            <Link href={`/article/${current.slug}`}>
              <h1 className="mt-2 text-xl font-black leading-tight text-white drop-shadow sm:text-3xl lg:text-4xl">
                {current.title}
              </h1>
            </Link>
            <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-slate-200">{current.excerpt}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-300">
              {current.author && <span className="font-semibold text-white">{current.author.name}</span>}
              <span className="flex items-center gap-1"><Clock size={12} /> {timeAgo(current.publishedAt)}</span>
              <span className="flex items-center gap-1"><Eye size={12} /> {current.views} views</span>
              <Link
                href={`/article/${current.slug}`}
                className="ml-auto rounded-md bg-red-600 px-3 py-1.5 font-bold text-white hover:bg-red-700"
              >
                Read Story →
              </Link>
            </div>
          </div>
        </div>

        <button
          aria-label="Previous"
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white opacity-0 transition group-hover:opacity-100 hover:bg-black/60"
          onClick={() => setIdx((idx - 1 + items.length) % items.length)}
        >
          <ChevronLeft size={20} />
        </button>
        <button
          aria-label="Next"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white opacity-0 transition group-hover:opacity-100 hover:bg-black/60"
          onClick={() => setIdx((idx + 1) % items.length)}
        >
          <ChevronRight size={20} />
        </button>

        <div className="absolute right-4 top-4 flex gap-1.5">
          {items.map((a, i) => (
            <button
              key={a.id}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-red-500" : "w-1.5 bg-white/50"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
