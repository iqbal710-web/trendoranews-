import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Fact Check Desk" };

export default function DashboardFactCheckPage() {
  return (
    <main>
      <h1 className="text-2xl font-black tracking-tight">🛡️ Fact Checker Dashboard</h1>
      <p className="mt-2 text-sm text-(--muted)">
        Publish verdicts and manage fact-check status of articles.{" "}
        <Link href="/explore/fact-check" className="font-bold text-red-600 hover:underline">Open the public Fact Check Center →</Link>
      </p>
      <div className="card mt-5 p-5 text-sm text-(--muted)">
        Use the Fact Check Center to submit claim verdicts (true / false / misleading / unproven). Article-level
        fact-check status can be set in the article editor (pending / verified / unverified / disputed) — badges
        appear on every article page.
      </div>
    </main>
  );
}
