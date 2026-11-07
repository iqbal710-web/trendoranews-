import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { newsletter } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const existing = await db.select().from(newsletter).where(eq(newsletter.email, email)).limit(1);
  if (existing.length) {
    await db.update(newsletter).set({ active: true }).where(eq(newsletter.email, email));
    return NextResponse.json({ ok: true, message: "Already subscribed — reactivated" });
  }
  await db.insert(newsletter).values({ email });
  return NextResponse.json({ ok: true, message: "Subscribed to the TrendoraNews daily newsletter" }, { status: 201 });
}

export async function GET() {
  const { sql } = await import("drizzle-orm");
  const rows = await db.select({ count: sql<number>`count(*)::int` }).from(newsletter).where(eq(newsletter.active, true));
  return NextResponse.json({ subscribers: rows[0]?.count ?? 0 });
}
