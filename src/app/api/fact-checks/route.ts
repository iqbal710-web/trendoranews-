import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { factChecks } from "@/db/schema";
import { getCurrentUser, canFactCheck } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db.select().from(factChecks).orderBy(desc(factChecks.createdAt)).limit(100);
  return NextResponse.json({ items: rows });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canFactCheck(user.role)) {
    return NextResponse.json({ error: "Fact-checker role required" }, { status: 401 });
  }
  const body = await req.json();
  const claim = String(body.claim ?? "").trim();
  const verdict = String(body.verdict ?? "unproven");
  const explanation = String(body.explanation ?? "").trim();
  if (!claim || !explanation) return NextResponse.json({ error: "Claim and explanation required" }, { status: 400 });
  const [row] = await db
    .insert(factChecks)
    .values({
      claim,
      verdict,
      explanation,
      articleId: body.articleId ? Number(body.articleId) : null,
      checkerId: user.id,
    })
    .returning();
  return NextResponse.json({ item: row }, { status: 201 });
}
