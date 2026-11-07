import { NextResponse } from "next/server";
import { getAllCategories } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ items: await getAllCategories() });
}
