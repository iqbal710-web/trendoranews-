import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const articleId = Number(id);
  await db.update(articles).set({ shares: sql`${articles.shares} + 1` }).where(eq(articles.id, articleId));
  const [row] = await db.select({ shares: articles.shares }).from(articles).where(eq(articles.id, articleId)).limit(1);
  return NextResponse.json({ shares: row?.shares ?? 0 });
}
