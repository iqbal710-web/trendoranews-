import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { explainers } from "@/db/schema";
import { desc } from "drizzle-orm";
import { BookOpenText } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explainer Center",
  description: "Complex topics explained simply — TrendoraNews explainers.",
};

export default async function ExplainersPage() {
  const items = await db.select().from(explainers).orderBy(desc(explainers.createdAt)).limit(50);
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight">
        <BookOpenText className="text-orange-600" /> Explainer Center
      </h1>
      <p className="mt-2 text-sm text-(--muted)">Jotil bisoy, shohoj bhabe bojano — complex topics, explained simply.</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {items.map((e) => (
          <Link key={e.id} href={`/explore/explainers/${e.slug}`} className="card group p-6">
            <div className="flex items-center gap-2 text-xs">
              <span className="chip bg-orange-600 text-white">{e.category}</span>
              <span className="chip bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200">{e.difficulty}</span>
            </div>
            <h2 className="mt-2 text-lg font-black group-hover:text-red-600">{e.title}</h2>
            <p className="mt-1 line-clamp-2 text-sm text-(--muted)">{e.summary}</p>
          </Link>
        ))}
        {items.length === 0 && <p className="card p-8 text-sm text-(--muted)">No explainers yet.</p>}
      </div>
    </main>
  );
}
