import type { Metadata } from "next";
import { db } from "@/db";
import { factChecks } from "@/db/schema";
import { desc } from "drizzle-orm";
import { FactCheckCenter } from "@/components/fact-check-center";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fact Check Center",
  description: "TrendoraNews fact-check desk: verdicts on viral claims — true, false, misleading or unproven.",
};

const VERDICT_STYLE: Record<string, { label: string; cls: string }> = {
  true: { label: "✔ TRUE", cls: "bg-green-600" },
  false: { label: "✘ FALSE", cls: "bg-red-700" },
  misleading: { label: "⚠ MISLEADING", cls: "bg-amber-600" },
  unproven: { label: "? UNPROVEN", cls: "bg-slate-500" },
};

export default async function FactCheckPage() {
  const items = await db.select().from(factChecks).orderBy(desc(factChecks.createdAt)).limit(100);
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-black tracking-tight">🛡️ Fact Check Center</h1>
      <p className="mt-2 text-sm text-(--muted)">
        Viral claims verified by the TrendoraNews fact-check desk. Every article also carries a fact-check status badge.
      </p>
      <FactCheckCenter
        initial={items.map((f) => ({
          id: f.id,
          claim: f.claim,
          verdict: f.verdict,
          explanation: f.explanation,
          createdAt: f.createdAt.toISOString(),
        }))}
        verdictStyle={VERDICT_STYLE}
      />
    </main>
  );
}
