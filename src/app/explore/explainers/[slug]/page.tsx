import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { explainers } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const rows = await db.select().from(explainers).where(eq(explainers.slug, slug)).limit(1);
  if (!rows[0]) return { title: "Explainer not found" };
  return { title: rows[0].title, description: rows[0].summary ?? rows[0].title };
}

export default async function ExplainerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await db.select().from(explainers).where(eq(explainers.slug, slug)).limit(1);
  const e = rows[0];
  if (!e) notFound();
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <nav className="text-xs text-(--muted)">
        <Link href="/explore/explainers" className="hover:underline">← Explainer Center</Link>
      </nav>
      <div className="mt-4 flex gap-2 text-xs">
        <span className="chip bg-orange-600 text-white">{e.category}</span>
        <span className="chip bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200">{e.difficulty}</span>
      </div>
      <h1 className="mt-3 text-3xl font-black tracking-tight">{e.title}</h1>
      <div className="article-body mt-6">
        {e.content.split(/\n{2,}/).map((p, i) =>
          p.startsWith("## ") ? <h2 key={i}>{p.slice(3)}</h2> : <p key={i}>{p}</p>
        )}
      </div>
    </main>
  );
}
