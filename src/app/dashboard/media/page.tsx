import type { Metadata } from "next";
import { MediaLibrary } from "@/components/media-library";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Media Library" };

export default function MediaPage() {
  return <MediaLibrary />;
}
