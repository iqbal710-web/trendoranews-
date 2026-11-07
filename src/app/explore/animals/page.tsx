import type { Metadata } from "next";
import { db } from "@/db";
import { animals } from "@/db/schema";
import { AnimalEncyclopedia } from "@/components/animal-encyclopedia";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Animal Encyclopedia",
  description: "Wildlife, pets and marine life — species profiles, habitats, diets and conservation status.",
};

export default async function AnimalsPage() {
  const all = await db.select().from(animals).orderBy(animals.name);
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-black tracking-tight">🐾 Animal Encyclopedia</h1>
      <p className="mt-2 text-sm text-(--muted)">Search the animal kingdom — from Bengal tigers to blue whales.</p>
      <AnimalEncyclopedia
        animals={all.map((a) => ({
          id: a.id,
          name: a.name,
          scientificName: a.scientificName ?? "",
          habitat: a.habitat ?? "",
          diet: a.diet ?? "",
          conservation: a.conservation ?? "",
          lifespan: a.lifespan ?? "",
          facts: a.facts ?? "",
          emoji: a.emoji ?? "🐾",
        }))}
      />
    </main>
  );
}
