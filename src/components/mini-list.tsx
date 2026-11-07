import Link from "next/link";
import type { ArticleCard } from "@/lib/data";
import { timeAgo } from "@/lib/utils";

export function MiniList({ items, numbered = false }: { items: ArticleCard[]; numbered?: boolean }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((a, i) => (
        <li key={a.id} className="flex items-start gap-3">
          {numbered && (
            <span className="mt-0.5 text-2xl font-black leading-none text-red-600/80">{i + 1}</span>
          )}
          <div className="min-w-0">
            <Link
              href={`/article/${a.slug}`}
              className="line-clamp-2 text-sm font-bold leading-snug hover:text-red-700 dark:hover:text-red-400"
            >
              {a.title}
            </Link>
            <p className="mt-0.5 text-xs text-(--muted)">
              {a.category?.name} · {timeAgo(a.publishedAt)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
