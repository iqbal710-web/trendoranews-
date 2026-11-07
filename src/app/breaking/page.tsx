import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { breakingNews } from "@/db/schema";
import { desc } from "drizzle-orm";
import { AlertTriangle, Radio } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { LiveHub } from "@/components/live-hub";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Breaking News & Live Updates",
  description: "TrendoraNews live desk: real-time breaking news, live blogs, emergency alerts and update timelines.",
};

const STATUS_STYLE: Record<string, string> = {
  live: "bg-red-600 animate-pulse",
  developing: "bg-amber-500",
  resolved: "bg-slate-500",
};

export default async function BreakingPage() {
  const items = await db.select().from(breakingNews).orderBy(desc(breakingNews.updatedAt)).limit(50);
  const active = items.filter((i) => i.status !== "resolved");

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-600 text-white">
          <Radio size={24} />
        </span>
        <div>
          <h1 className="text-3xl font-black tracking-tight">Live News Desk</h1>
          <p className="text-sm text-(--muted)">
            <span className="live-dot mr-1 inline-block h-2 w-2 rounded-full bg-red-600" />
            Real-time breaking news, live blogs and emergency alerts
          </p>
        </div>
      </div>

      <LiveHub initialActive={active.length} />

      <div className="mt-8 flex flex-col gap-4">
        {items.map((b) => (
          <Link key={b.id} href={`/breaking/${b.slug}`} className="card group p-5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`chip text-white ${STATUS_STYLE[b.status] ?? "bg-slate-500"}`}>
                {b.status === "live" && <span className="live-dot mr-1 inline-block h-1.5 w-1.5 rounded-full bg-white" />}
                {b.status.toUpperCase()}
              </span>
              <span className={`chip text-white ${b.severity === "critical" ? "bg-red-800" : b.severity === "high" ? "bg-orange-600" : b.severity === "medium" ? "bg-yellow-600" : "bg-slate-500"}`}>
                <AlertTriangle size={11} /> {b.severity}
              </span>
              {b.country && <span className="chip bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200">{b.country}</span>}
              <span className="ml-auto text-(--muted)">{timeAgo(b.updatedAt)}</span>
            </div>
            <h2 className="mt-2 text-xl font-black group-hover:text-red-700 dark:group-hover:text-red-400">{b.title}</h2>
            {b.summary && <p className="mt-1 line-clamp-2 text-sm text-(--muted)">{b.summary}</p>}
            <span className="mt-3 inline-block text-sm font-bold text-red-600">Follow live updates →</span>
          </Link>
        ))}
        {items.length === 0 && (
          <p className="card p-10 text-center text-(--muted)">No breaking stories right now. The live desk is quiet… for now.</p>
        )}
      </div>
    </main>
  );
}
