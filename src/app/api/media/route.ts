import { NextRequest, NextResponse } from "next/server";
import { desc, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { getCurrentUser, canWrite } from "@/lib/auth";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const type = req.nextUrl.searchParams.get("type") ?? "";
  let rows = await db.select().from(media).orderBy(desc(media.createdAt)).limit(100);
  if (q) rows = rows.filter((r) => (r.title + " " + r.alt).toLowerCase().includes(q.toLowerCase()));
  if (type) rows = rows.filter((r) => r.type === type);
  return NextResponse.json({ items: rows });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canWrite(user.role)) {
    return NextResponse.json({ error: "Staff account required" }, { status: 401 });
  }
  const form = await req.formData();
  const file = form.get("file");
  const title = String(form.get("title") ?? "");
  const alt = String(form.get("alt") ?? title);
  const type = String(form.get("type") ?? "image");

  if (file && typeof file === "object" && "arrayBuffer" in file && file.size > 0) {
    // Vercel functions cannot persist files written to the deployment filesystem.
    if (process.env.VERCEL) {
      return NextResponse.json({ error: "File uploads require external storage on Vercel. Register a hosted media URL instead." }, { status: 400 });
    }
    const ext = path.extname(file.name || ".jpg").slice(0, 10) || ".jpg";
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, name), buf);
    const [row] = await db
      .insert(media)
      .values({
        url: `/uploads/${name}`,
        type: type === "video" ? "video" : type === "audio" ? "audio" : "image",
        title,
        alt,
        metadata: { size: file.size, mime: file.type },
        uploadedBy: user.id,
      })
      .returning();
    return NextResponse.json({ item: row }, { status: 201 });
  }

  // register external URL
  const url = String(form.get("url") ?? "");
  if (!url) return NextResponse.json({ error: "file or url required" }, { status: 400 });
  try {
    if (!["http:", "https:"].includes(new URL(url).protocol)) throw new Error("Invalid protocol");
  } catch {
    return NextResponse.json({ error: "Please provide a valid HTTP or HTTPS URL" }, { status: 400 });
  }
  const [row] = await db
    .insert(media)
    .values({ url, type: type as "image" | "video" | "audio", title, alt, uploadedBy: user.id })
    .returning();
  return NextResponse.json({ item: row }, { status: 201 });
}
