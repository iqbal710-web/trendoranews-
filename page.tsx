import type { Metadata } from "next";
import { PlayCircle } from "lucide-react";
import { queryArticles } from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { ArticleCardView } from "@/components/article-card";
import { MiniList } from "@/components/mini-list";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Video News",
  description: "Watch the latest video news, trending videos and featured video stories on TrendoraNews.",
};

export default async function VideosPage() {
  const [videos, trending] = await Promise.all([
    queryArticles({ type: "video", sort: "latest", limit: 12 }),
    queryArticles({ type: "video", sort: "trending", limit: 6 }),
  ]);
  const all = videos.cards.length ? videos.cards : (await queryArticles({ sort: "latest", limit: 12 })).cards;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight">
        <PlayCircle className="text-red-600" /> Video News
      </h1>
      <p className="mt-2 text-sm text-(--muted)">Video stories, trending videos and featured reports. Playlists and chapters are marked on each story.</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionHeading title="Latest videos" />
          <div className="grid gap-5 sm:grid-cols-2">
            {all.map((a) => (
              <div key={a.id} className="relative">
                <ArticleCardView a={a} />
                <span className="absolute left-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-red-600/90 text-white shadow-lg">
                  <PlayCircle size={20} fill="currentColor" />
                </span>
              </div>
            ))}
          </div>
        </div>
        <aside className="card h-fit p-5">
          <SectionHeading title="Trending videos" accent="#dc2626" />
          <MiniList items={trending.cards.length ? trending.cards : all.slice(0, 6)} />
        </aside>
      </div>
    </main>
  );
}
