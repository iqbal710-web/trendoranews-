import type { Metadata } from "next";
import { SavedClient } from "@/components/saved-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Saved Articles & Reading History" };

export default function SavedPage() {
  return <SavedClient />;
}
