"use client";

import { useEffect, useState } from "react";
import type { ArticleCard } from "@/lib/data";
import { ArticleCardView } from "@/components/article-card";
import { SectionHeading } from "@/components/section-heading";

export function SavedClient() {
  const [saved, setSaved] = useState<ArticleCard[]>([]);
  const [history, setHistory] = useState<ArticleCard[]>([]);
  const [local, setLocal] = useState<{ slug: string; title: string; at: number }[]>([]);

  useEffect(() => {
    fetch("/api/user/library")
      .then((r) => r.json())
      .then((d) => {
        if (d.saved) setSaved(d.saved);
        if (d.history) setHistory(d.history);
      });
    try {
      setLocal(JSON.parse(localStorage.getItem("trendora_history") ?? "[]"));
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <main>
      <h1 className="text-2xl font-black tracking-tight">📚 Saved Articles & Reading History</h1>

      <div className="mt-6">
        <SectionHeading title={`Bookmarked (${saved.length})`} accent="#f59e0b" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((a) => (
            <ArticleCardView key={a.id} a={a} />
          ))}
        </div>
        {saved.length === 0 && <p className="card p-6 text-sm text-(--muted)">Nothing bookmarked yet — tap the bookmark icon on any article.</p>}
      </div>

      <div className="mt-10">
        <SectionHeading title={`Reading history (${history.length + local.length})`} accent="#2563eb" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {history.map((a) => (
            <ArticleCardView key={`h-${a.id}`} a={a} />
          ))}
        </div>
        {local.length > 0 && (
          <div className="card mt-4 p-4">
            <p className="label">Recently viewed (this browser)</p>
            <ul className="flex flex-wrap gap-2">
              {local.map((h) => (
                <a key={h.slug} href={`/article/${h.slug}`} className="btn !py-1 text-xs">
                  {h.title.slice(0, 60)}
                </a>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
