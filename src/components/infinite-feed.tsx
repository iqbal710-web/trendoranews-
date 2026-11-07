"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { ArticleCard } from "@/lib/data";
import { ArticleCardView } from "@/components/article-card";

export function InfiniteFeed({
  initial,
  hasMore: initialHasMore,
  params,
  variant = "grid",
}: {
  initial: ArticleCard[];
  hasMore: boolean;
  params: Record<string, string>;
  variant?: "grid" | "list";
}) {
  const [items, setItems] = useState<ArticleCard[]>(initial);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const cursorRef = useRef<number | null>(initial.length ? initial[initial.length - 1].id : null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !cursorRef.current) return;
    setLoading(true);
    try {
      const usp = new URLSearchParams({ ...params, cursor: String(cursorRef.current), limit: "12" });
      const res = await fetch(`/api/articles?${usp.toString()}`);
      const data = await res.json();
      setItems((prev) => [...prev, ...(data.items ?? [])]);
      setHasMore(!!data.hasMore);
      if (data.items?.length) cursorRef.current = data.items[data.items.length - 1].id;
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, params]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "600px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  return (
    <div>
      <div
        className={
          variant === "grid"
            ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            : "flex flex-col gap-4"
        }
      >
        {items.map((a) => (
          <ArticleCardView key={a.id} a={a} variant={variant} />
        ))}
      </div>
      <div ref={sentinelRef} className="py-8 text-center">
        {loading && (
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-(--muted)">
            <Loader2 size={16} className="animate-spin" /> Loading more stories…
          </span>
        )}
        {!hasMore && items.length > 0 && (
          <p className="text-sm text-(--muted)">— You&apos;re all caught up —</p>
        )}
      </div>
    </div>
  );
}
