"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, FileEdit, Plus, Trash2 } from "lucide-react";
import { timeAgo } from "@/lib/utils";

type Row = {
  a: { id: number; slug: string; title: string; status: string; type: string; views: number; likes: number; updatedAt: string; publishedAt: string; featured: boolean; breaking: boolean };
  category: { name: string; slug: string } | null;
  author: { name: string } | null;
};

const STATUS_CLS: Record<string, string> = {
  published: "bg-green-600",
  draft: "bg-slate-500",
  scheduled: "bg-amber-600",
  archived: "bg-red-800",
};

export function ArticleManager() {
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch("/api/dashboard/articles");
    const data = await res.json();
    setRows(data.items ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: number) => {
    if (!confirm("Archive this article? (It will be unpublished)")) return;
    await fetch(`/api/articles/${id}`, { method: "DELETE" });
    await load();
  };

  const filtered = rows.filter((r) => filter === "all" || r.a.status === filter);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-black tracking-tight">Article Management</h1>
        <Link href="/dashboard/articles/new" className="btn btn-primary ml-auto">
          <Plus size={15} /> New article
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {["all", "published", "draft", "scheduled", "archived"].map((f) => (
          <button key={f} className={`btn !py-1.5 text-xs ${filter === f ? "btn-primary" : ""}`} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
        <span className="ml-auto text-xs font-semibold text-(--muted)">{filtered.length} articles</span>
      </div>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-(--line) text-left text-xs uppercase tracking-wider text-(--muted)">
              <th className="p-3">Title</th>
              <th className="p-3">Status</th>
              <th className="p-3">Category</th>
              <th className="p-3">Views</th>
              <th className="p-3">Updated</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td className="p-6 text-(--muted)" colSpan={6}>Loading…</td></tr>
            )}
            {filtered.map((r) => (
              <tr key={r.a.id} className="border-b border-(--line) last:border-0 hover:bg-red-50/40 dark:hover:bg-slate-800/40">
                <td className="max-w-md p-3">
                  <p className="truncate font-bold">{r.a.title}</p>
                  <p className="text-xs text-(--muted)">{r.author?.name ?? "—"} · {r.a.type}{r.a.breaking ? " · 🔴" : ""}{r.a.featured ? " · ⭐" : ""}</p>
                </td>
                <td className="p-3"><span className={`chip text-white ${STATUS_CLS[r.a.status] ?? "bg-slate-500"}`}>{r.a.status}</span></td>
                <td className="p-3 text-xs">{r.category?.name ?? "—"}</td>
                <td className="p-3 text-xs">{r.a.views} 👁 {r.a.likes} ❤</td>
                <td className="p-3 text-xs text-(--muted)">{timeAgo(r.a.updatedAt)}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Link href={`/dashboard/articles/${r.a.id}`} className="btn !p-1.5" title="Edit"><FileEdit size={14} /></Link>
                    {r.a.status === "published" && (
                      <Link href={`/article/${r.a.slug}`} className="btn !p-1.5" title="View"><Eye size={14} /></Link>
                    )}
                    <button className="btn !p-1.5 hover:!text-red-600" title="Archive" onClick={() => remove(r.a.id)}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td className="p-6 text-center text-(--muted)" colSpan={6}>No articles in this state.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
