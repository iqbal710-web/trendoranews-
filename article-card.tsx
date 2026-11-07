import Link from "next/link";
import { BadgeCheck, Clock, Eye, Heart, MapPin, ShieldCheck } from "lucide-react";
import type { ArticleCard } from "@/lib/data";
import { CoverImage } from "@/components/cover";
import { formatDate, timeAgo } from "@/lib/utils";

const FACT_COLORS: Record<string, string> = {
  verified: "bg-green-600",
  unverified: "bg-amber-600",
  disputed: "bg-red-700",
  pending: "bg-slate-500",
};

export function ArticleCardView({ a, variant = "grid" }: { a: ArticleCard; variant?: "grid" | "list" }) {
  if (variant === "list") {
    return (
      <article className="card group flex flex-col gap-4 p-3 sm:flex-row">
        <Link href={`/article/${a.slug}`} className="sm:w-56 sm:shrink-0">
          <CoverImage article={a} ratio="aspect-[16/10]" className="rounded-lg" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {a.category && (
              <Link
                href={`/category/${a.category.slug}`}
                className="chip text-white"
                style={{ background: a.category.color ?? "#dc2626" }}
              >
                {a.category.name}
              </Link>
            )}
            {a.breaking && <span className="chip bg-red-600 text-white">Breaking</span>}
            {a.editorChoice && <span className="chip bg-violet-600 text-white">Editor&apos;s Choice</span>}
            <span className={`chip text-white ${FACT_COLORS[a.factCheckStatus] ?? "bg-slate-500"}`}>
              <ShieldCheck size={11} /> {a.factCheckStatus}
            </span>
          </div>
          <Link href={`/article/${a.slug}`}>
            <h3 className="mt-2 text-lg font-bold leading-snug hover:text-red-700 dark:hover:text-red-400">
              {a.title}
            </h3>
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-(--muted)">{a.excerpt}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-(--muted)">
            {a.author && (
              <span className="flex items-center gap-1 font-semibold text-(--ink)">
                {a.author.name}
                {a.author.verified && <BadgeCheck size={13} className="text-blue-500" />}
              </span>
            )}
            <span>{timeAgo(a.publishedAt)}</span>
            {a.country && (
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {a.country}
              </span>
            )}
            <span className="flex items-center gap-1"><Clock size={12} /> {a.readingTime} min read</span>
            <span className="flex items-center gap-1"><Eye size={12} /> {a.views}</span>
            <span className="flex items-center gap-1"><Heart size={12} /> {a.likes}</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="card group flex h-full flex-col">
      <Link href={`/article/${a.slug}`} className="block">
        <CoverImage article={a} />
        <div className="absolute" />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
          {a.category && (
            <Link
              href={`/category/${a.category.slug}`}
              className="chip text-white"
              style={{ background: a.category.color ?? "#dc2626" }}
            >
              {a.category.name}
            </Link>
          )}
          {a.breaking && <span className="chip bg-red-600 text-white">Breaking</span>}
          {a.editorChoice && <span className="chip bg-violet-600 text-white">Editor&apos;s Pick</span>}
        </div>
        <Link href={`/article/${a.slug}`}>
          <h3 className="mt-2 line-clamp-2 text-base font-bold leading-snug group-hover:text-red-700 dark:group-hover:text-red-400">
            {a.title}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-(--muted)">{a.excerpt}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-(--line) pt-2 text-[11px] text-(--muted)">
          {a.author && (
            <span className="flex items-center gap-1 font-semibold">
              {a.author.name}
              {a.author.verified && <BadgeCheck size={12} className="text-blue-500" />}
            </span>
          )}
          <span className="ml-auto">{formatDate(a.publishedAt)}</span>
          <span className="flex items-center gap-1"><Eye size={11} /> {a.views}</span>
        </div>
      </div>
    </article>
  );
}
