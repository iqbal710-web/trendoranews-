import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { breakingNews, breakingUpdates, users } from "@/db/schema";
import { getCurrentUser, canEditAny } from "@/lib/auth";
import { getBreakingWithUpdates } from "@/lib/data";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const found = await getBreakingWithUpdates(Number(id));
  if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(found);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user || !canEditAny(user.role)) {
    return NextResponse.json({ error: "Editor role required" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const breakingId = Number(id);
  const body = await req.json();
  const content = String(body.content ?? "").trim();
  if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });
  const [row] = await db
    .insert(breakingUpdates)
    .values({ breakingId, content, authorId: user.id })
    .returning();
  await db.update(breakingNews).set({ updatedAt: new Date() }).where(eq(breakingNews.id, breakingId));
  if (body.status) {
    await db.update(breakingNews).set({ status: body.status }).where(eq(breakingNews.id, breakingId));
  }
  const fresh = await db
    .select({ u: breakingUpdates, a: users })
    .from(breakingUpdates)
    .leftJoin(users, eq(breakingUpdates.authorId, users.id))
    .where(eq(breakingUpdates.breakingId, breakingId))
    .orderBy(desc(breakingUpdates.createdAt));
  return NextResponse.json({ update: row, updates: fresh }, { status: 201 });
}
