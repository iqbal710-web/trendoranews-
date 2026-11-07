import type { Metadata } from "next";
import { BreakingManager } from "@/components/breaking-manager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Live / Breaking Desk" };

export default function DashboardBreakingPage() {
  return <BreakingManager />;
}
