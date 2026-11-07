import type { Metadata } from "next";
import { db } from "@/db";
import { spaceObjects } from "@/db/schema";
import { SpaceExplorer } from "@/components/space-explorer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Space Explorer",
  description: "Planets, stars, galaxies and missions — explore the universe with TrendoraNews.",
};

export default async function SpacePage() {
  const all = await db.select().from(spaceObjects).orderBy(spaceObjects.name);
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-black tracking-tight">🚀 Space Explorer</h1>
      <p className="mt-2 text-sm text-(--muted)">From Mercury to distant galaxies — explore the cosmos.</p>
      <SpaceExplorer
        objects={all.map((o) => ({
          id: o.id,
          name: o.name,
          type: o.type,
          distance: o.distance ?? "",
          diameter: o.diameter ?? "",
          description: o.description ?? "",
          facts: o.facts ?? "",
          emoji: o.emoji ?? "🪐",
        }))}
      />
    </main>
  );
}
