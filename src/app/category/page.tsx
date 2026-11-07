import Link from "next/link";
import type { Metadata } from "next";
import { getAllCategories } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All News Categories",
  description: "Browse every TrendoraNews section: Bangladesh, World, Business, Technology, Entertainment, History, Animals, Geography, Science, Sports, Education, Lifestyle, Environment, Health, Opinion, Investigation.",
};

export default async function CategoriesIndex() {
  const cats = await getAllCategories();
  const top = cats.filter((c) => !c.parentId);
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-black tracking-tight">All Categories</h1>
      <p className="mt-2 text-(--muted)">Every section of TrendoraNews, in one place.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {top.map((c) => {
          const kids = cats.filter((k) => k.parentId === c.id);
          return (
            <div key={c.id} className="card p-6">
              <Link href={`/category/${c.slug}`} className="flex items-center gap-3">
                <span
                  className="grid h-11 w-11 place-items-center rounded-xl text-xl font-black text-white"
                  style={{ background: c.color ?? "#dc2626" }}
                >
                  {c.name.charAt(0)}
                </span>
                <div>
                  <h2 className="text-lg font-black hover:text-red-600">{c.name}</h2>
                  <p className="text-xs text-(--muted)">{c.articleCount} stories</p>
                </div>
              </Link>
              {kids.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {kids.map((k) => (
                    <Link key={k.id} href={`/category/${k.slug}`} className="btn !py-1 text-[11px]">
                      {k.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
