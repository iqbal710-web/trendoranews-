import type { Metadata } from "next";
import { ArticleEditor } from "@/components/article-editor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "New Article" };

export default function NewArticlePage() {
  return <ArticleEditor />;
}
