import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { DataViz } from "@/components/data-viz";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.role)) redirect("/dashboard");
  return (
    <main>
      <h1 className="text-2xl font-black tracking-tight">📈 Advanced Analytics</h1>
      <p className="mt-1 text-sm text-(--muted)">
        Real-time visitors, page views, traffic sources, country & device stats, popular articles, trending categories,
        reading time, engagement, subscribers, search analytics and retention.
      </p>
      <div className="mt-6">
        <DataViz />
      </div>
    </main>
  );
}
