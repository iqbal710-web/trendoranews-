import type { Metadata } from "next";
import { db } from "@/db";
import { timelineEvents } from "@/db/schema";
import { TimelineExplorer } from "@/components/timeline-explorer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Historical Timeline",
  description: "Explore the defining events of human history — from ancient civilizations to the modern era.",
};

export default async function TimelinePage() {
  const events = await db.select().from(timelineEvents).orderBy(timelineEvents.year);
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-black tracking-tight">📜 Historical Timeline</h1>
      <p className="mt-2 text-sm text-(--muted)">Filter by era or category, scroll through the events that shaped our world.</p>
      <TimelineExplorer
        events={events.map((e) => ({
          id: e.id,
          year: e.year,
          title: e.title,
          description: e.description ?? "",
          category: e.category ?? "World",
          country: e.country ?? "",
          emoji: e.emoji ?? "📜",
        }))}
      />
    </main>
  );
}
