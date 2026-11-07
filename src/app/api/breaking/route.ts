import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { breakingNews, breakingUpdates, notifications, users } from "@/db/schema";
import { getCurrentUser, canEditAny } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const onlyActive = req.nextUrl.searchParams.get("active") === "1";
  let rows = await db.select().from(breakingNews).orderBy(desc(breakingNews.updatedAt)).limit(50);
  if (onlyActive) rows = rows.filter((r) => r.status === "live" || r.status === "developing");
  // auto-expire old live items
  const now = new Date();
  for (const r of rows) {
    if (r.expiresAt && r.expiresAt < now && r.status !== "resolved") {
      await db.update(breakingNews).set({ status: "resolved" }).where(eq(breakingNews.id, r.id));
      r.status = "resolved";
    }
  }
  return NextResponse.json({ items: rows });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canEditAny(user.role)) {
    return NextResponse.json({ error: "Editor role required" }, { status: 401 });
  }
  const body = await req.json();
  const title = String(body.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });
  let slug = slugify(title).slice(0, 200);
  const exists = await db.select().from(breakingNews).where(eq(breakingNews.slug, slug)).limit(1);
  if (exists.length) slug = `${slug}-${Date.now().toString(36)}`;
  const [row] = await db
    .insert(breakingNews)
    .values({
      slug,
      title,
      summary: body.summary ?? "",
      content: body.content ?? "",
      status: body.status ?? "live",
      severity: body.severity ?? "high",
      country: body.country ?? "",
      categoryId: body.categoryId ? Number(body.categoryId) : null,
      articleId: body.articleId ? Number(body.articleId) : null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    })
    .returning();
  if (body.initialUpdate) {
    await db.insert(breakingUpdates).values({ breakingId: row.id, content: String(body.initialUpdate), authorId: user.id });
  }
  // push notification to all users
  const allUsers = await db.select({ id: users.id }).from(users).limit(500);
  for (const u of allUsers) {
    await db.insert(notifications).values({
      userId: u.id,
      type: "breaking",
      message: `🚨 Breaking: ${title}`,
      link: `/breaking/${row.slug}`,
    });
  }
  return NextResponse.json({ item: row }, { status: 201 });
}
