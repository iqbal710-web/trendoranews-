"use client";

import { InfiniteFeed } from "@/components/infinite-feed";
import { ToggleButtons, ViewModeProvider, useViewMode } from "@/components/view-toggle";
import type { ArticleCard } from "@/lib/data";

function Inner({
  initial,
  hasMore,
  params,
}: {
  initial: ArticleCard[];
  hasMore: boolean;
  params: Record<string, string>;
}) {
  const { variant } = useViewMode();
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-6 w-1.5 rounded-full bg-red-600" />
          <h2 className="text-xl font-black tracking-tight sm:text-2xl">Latest News</h2>
        </div>
        <ToggleButtons />
      </div>
      <InfiniteFeed initial={initial} hasMore={hasMore} params={params} variant={variant} />
    </>
  );
}

export function LatestSection({
  initial,
  hasMore,
  params,
}: {
  initial: ArticleCard[];
  hasMore: boolean;
  params: Record<string, string>;
}) {
  return (
    <ViewModeProvider>
      <Inner initial={initial} hasMore={hasMore} params={params} />
    </ViewModeProvider>
  );
}
