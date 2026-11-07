import type { Metadata } from "next";
import { ArticleManager } from "@/components/article-manager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Article Management" };

export default function DashboardArticlesPage() {
  return (
    <main>
      <ArticleManager />
    </main>
  );
}
