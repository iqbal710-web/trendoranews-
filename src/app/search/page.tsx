import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchClient } from "@/components/search-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Advanced Search",
  description:
    "Search TrendoraNews by keyword, author, category, country, date, tags and article type. Live suggestions, trending searches and typo correction included.",
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-7xl px-4 py-10">
          <p className="text-(--muted)">Loading search…</p>
        </main>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
