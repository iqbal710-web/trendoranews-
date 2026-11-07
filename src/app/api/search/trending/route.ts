import { NextResponse } from "next/server";
import { desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { searches } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select({ q: searches.query, count: sql<number>`count(*)::int` })
    .from(searches)
    .groupBy(searches.query)
    .orderBy(desc(sql`count(*)`))
    .limit(12);
  return NextResponse.json({ trending: rows });
}
