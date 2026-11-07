import type { Metadata } from "next";
import { ArticleEditor } from "@/components/article-editor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Edit Article" };

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ArticleEditor articleId={Number(id)} />;
}
