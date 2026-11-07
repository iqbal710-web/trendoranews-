import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/db";
import { articles, breakingNews, newsletter, users, reads, bookmarks } from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { getCurrentUser, canWrite, isAdmin } from "@/lib/auth";
import { queryArticles } from "@/lib/data";
import { MiniList } from "@/components/mini-list";
import { SectionHeading } from "@/components/section-heading";
import { ROLE_LABELS } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardOverview() {
  const user = await getCurrentUser();
  if (!user) return null;

  const myArticles = canWrite(user.role)
    ? await db
        .select()
        .from(articles)
        .where(eq(articles.authorId, user.id))
        .orderBy(desc(articles.updatedAt))
        .limit(8)
    : [];
  const liveCount = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(breakingNews)
    .where(sql`${breakingNews.status} != 'resolved'`);
  const savedCount = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(bookmarks)
    .where(eq(bookmarks.userId, user.id));
  const readCount = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(reads)
    .where(eq(reads.userId, user.id));
  const totalUsers = isAdmin(user.role)
    ? (await db.select({ c: sql<number>`count(*)::int` }).from(users))[0].c
    : 0;
  const subs = isAdmin(user.role)
    ? (await db.select({ c: sql<number>`count(*)::int` }).from(newsletter))[0].c
    : 0;

  const feed = await queryArticles({ sort: "trending", limit: 6 });

  return (
    <main>
      <h1 className="text-3xl font-black tracking-tight">Hello, {user.name} 👋</h1>
      <p className="mt-1 text-sm text-(--muted)">
        You are signed in as <b>{ROLE_LABELS[user.role] ?? user.role}</b> ({user.email})
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {canWrite(user.role) && (
          <div className="card p-5">
            <p className="text-3xl font-black text-red-600">{myArticles.length}</p>
            <p className="text-xs font-bold uppercase tracking-wider text-(--muted)">Your articles</p>
          </div>
        )}
        <div className="card p-5">
          <p className="text-3xl font-black text-amber-600">{liveCount[0].c}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-(--muted)">Live stories</p>
        </div>
        <div className="card p-5">
          <p className="text-3xl font-black text-blue-600">{savedCount[0].c}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-(--muted)">Saved articles</p>
        </div>
        <div className="card p-5">
          <p className="text-3xl font-black text-green-600">{readCount[0].c}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-(--muted)">Articles read</p>
        </div>
        {isAdmin(user.role) && (
          <>
            <div className="card p-5">
              <p className="text-3xl font-black text-violet-600">{totalUsers}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-(--muted)">Registered users</p>
            </div>
            <div className="card p-5">
              <p className="text-3xl font-black text-teal-600">{subs}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-(--muted)">Newsletter subs</p>
            </div>
          </>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {canWrite(user.role) && (
          <section className="card p-5">
            <div className="flex items-center justify-between">
              <SectionHeading title="Your recent articles" accent="#dc2626" />
              <Link href="/dashboard/articles" className="text-xs font-bold text-red-600 hover:underline">Manage →</Link>
            </div>
            {myArticles.length === 0 ? (
              <p className="text-sm text-(--muted)">
                No articles yet. <Link href="/dashboard/articles/new" className="font-bold text-red-600 hover:underline">Write your first story →</Link>
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {myArticles.map((a) => (
                  <li key={a.id} className="flex items-center gap-2 text-sm">
                    <span className={`chip text-white ${a.status === "published" ? "bg-green-600" : a.status === "draft" ? "bg-slate-500" : a.status === "scheduled" ? "bg-amber-600" : "bg-red-800"}`}>
                      {a.status}
                    </span>
                    <Link href={`/dashboard/articles/${a.id}`} className="truncate font-semibold hover:text-red-600">{a.title}</Link>
                    <span className="ml-auto shrink-0 text-xs text-(--muted)">{a.views} views</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
        <section className="card p-5">
          <SectionHeading title="Trending on TrendoraNews" accent="#f59e0b" />
          <MiniList items={feed.cards} />
        </section>
      </div>
    </main>
  );
}
