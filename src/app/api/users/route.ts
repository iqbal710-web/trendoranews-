import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { ROLES } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.role)) return NextResponse.json({ error: "Admin required" }, { status: 401 });
  const rows = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, verified: users.verified, createdAt: users.createdAt })
    .from(users)
    .orderBy(users.createdAt);
  return NextResponse.json({ items: rows, roles: ROLES });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.role)) return NextResponse.json({ error: "Admin required" }, { status: 401 });
  const body = await req.json();
  if (!ROLES.includes(body.role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  const [updated] = await db
    .update(users)
    .set({ role: body.role, verified: body.role !== "user" ? true : undefined })
    .where(eq(users.id, Number(body.id)))
    .returning({ id: users.id, role: users.role });
  return NextResponse.json({ user: updated });
}
