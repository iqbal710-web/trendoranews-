import type { Metadata } from "next";
import { DataViz } from "@/components/data-viz";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News Data Visualization",
  description: "Live charts and graphs of TrendoraNews traffic, trending topics and engagement.",
};

export default function DataPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-black tracking-tight">📊 Data Visualization</h1>
      <p className="mt-2 text-sm text-(--muted)">Live charts of TrendoraNews readership. Full analytics are available to admins in the dashboard.</p>
      <DataViz />
    </main>
  );
}
