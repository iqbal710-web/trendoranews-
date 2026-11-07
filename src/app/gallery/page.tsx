import type { Metadata } from "next";
import { Images } from "lucide-react";
import { queryArticles } from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { ArticleCardView } from "@/components/article-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Photo Gallery & Photo Stories",
  description: "Photo galleries, photo stories and the historical photo archive of TrendoraNews.",
};

export default async function GalleryPage() {
  const gallery = await queryArticles({ type: "gallery", sort: "latest", limit: 12 });
  const all = gallery.cards.length ? gallery.cards : (await queryArticles({ sort: "latest", limit: 12 })).cards;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight">
        <Images className="text-red-600" /> Photo Gallery
      </h1>
      <p className="mt-2 text-sm text-(--muted)">Photo stories, image slideshows, before & after features and the historical photo archive.</p>
      <div className="mt-8">
        <SectionHeading title="Latest photo stories" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {all.map((a) => (
            <ArticleCardView key={a.id} a={a} />
          ))}
        </div>
      </div>
    </main>
  );
}
