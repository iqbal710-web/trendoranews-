import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories, users } from "@/db/schema";
import { getCurrentUser, canWrite } from "@/lib/auth";

export const dynamic = "force-dynamic";

// staff view: includes drafts/scheduled/archived
export async function GET() {
  const user = await getCurrentUser();
  if (!user || !canWrite(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db
    .select({
      a: articles,
      category: categories,
      author: users,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(users, eq(articles.authorId, users.id))
    .orderBy(desc(articles.updatedAt))
    .limit(200);
  return NextResponse.json({ items: rows });
}
