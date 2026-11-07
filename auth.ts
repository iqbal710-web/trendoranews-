import { cookies } from "next/headers";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users, type User } from "@/db/schema";

const COOKIE_NAME = "trendora_session";
const SECRET = process.env.AUTH_SECRET || "trendora-dev-secret-change-me";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export function signToken(token: string): string {
  return createHmac("sha256", SECRET).update(token).digest("hex");
}

export async function createSession(userId: number): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const signed = signToken(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
  await db.insert(sessions).values({ userId, token: signed, expiresAt });
  return signed;
}

export async function setSessionCookie(token: string) {
  const c = await cookies();
  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSessionCookie() {
  const c = await cookies();
  c.delete(COOKIE_NAME);
  const token = c.get(COOKIE_NAME)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }
}

export async function getSessionToken(): Promise<string | null> {
  const c = await cookies();
  return c.get(COOKIE_NAME)?.value ?? null;
}

export async function getCurrentUser(): Promise<User | null> {
  const token = await getSessionToken();
  if (!token) return null;
  const rows = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.token, token))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  const exp = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
  if (exp.length && exp[0].expiresAt < new Date()) {
    await db.delete(sessions).where(eq(sessions.token, token));
    return null;
  }
  return row.user;
}

export function canWrite(role: string | undefined): boolean {
  return !!role && ["reporter", "writer", "editor", "senior_editor", "publisher", "admin"].includes(role);
}

export function canEditAny(role: string | undefined): boolean {
  return !!role && ["editor", "senior_editor", "publisher", "admin"].includes(role);
}

export function canFactCheck(role: string | undefined): boolean {
  return !!role && ["fact_checker", "senior_editor", "admin"].includes(role);
}

export function canPublish(role: string | undefined): boolean {
  return !!role && ["senior_editor", "publisher", "admin"].includes(role);
}

export function isAdmin(role: string | undefined): boolean {
  return role === "admin";
}
