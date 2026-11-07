import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { queryArticles, getAllCategories } from "@/lib/data";
import { LatestSection } from "@/components/latest-section";
import { SectionHeading } from "@/components/section-heading";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getCategory(slug: string) {
  const rows = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCategory(slug);
  if (!c) return { title: "Category not found" };
  return {
    title: `${c.name} News`,
    description: c.description || `Latest ${c.name} news and analysis on TrendoraNews.`,
    alternates: { canonical: `/category/${c.slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = await getCategory(slug);
  if (!cat) notFound();
  const all = await getAllCategories();
  const children = all.filter((c) => c.parentId === cat.id);
  const parent = cat.parentId ? all.find((c) => c.id === cat.parentId) : null;
  const { cards, hasMore } = await queryArticles({ category: slug, sort: "latest", limit: 12 });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <nav className="text-xs text-(--muted)">
        <Link href="/" className="hover:underline">Home</Link> /{" "}
        {parent && (
          <>
            <Link href={`/category/${parent.slug}`} className="hover:underline">{parent.name}</Link> /{" "}
          </>
        )}
        <span className="font-semibold text-(--ink)">{cat.name}</span>
      </nav>
      <div className="mt-4 flex items-center gap-4">
        <span
          className="grid h-14 w-14 place-items-center rounded-2xl text-2xl font-black text-white"
          style={{ background: cat.color ?? "#dc2626" }}
        >
          {cat.name.charAt(0)}
        </span>
        <div>
          <h1 className="text-3xl font-black tracking-tight">{cat.name}</h1>
          <p className="text-sm text-(--muted)">{cat.description || `${cat.name} coverage from TrendoraNews`} · {cat.articleCount} stories</p>
        </div>
      </div>

      {children.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {children.map((c) => (
            <Link key={c.id} href={`/category/${c.slug}`} className="btn !py-1.5 text-xs">
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8">
        <SectionHeading title={`Latest in ${cat.name}`} />
        <LatestSection initial={cards} hasMore={hasMore} params={{ category: slug, sort: "latest" }} />
      </div>
    </main>
  );
}
