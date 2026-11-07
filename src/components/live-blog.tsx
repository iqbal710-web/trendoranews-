"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Clock3 } from "lucide-react";
import { timeAgo } from "@/lib/utils";

type Update = { id: number; content: string; createdAt: string; authorName: string };
type Breaking = {
  id: number; slug: string; title: string; summary: string; content: string;
  status: string; severity: string; country: string; startedAt: string; updatedAt: string;
};

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  live: { label: "● LIVE", cls: "bg-red-600 text-white animate-pulse" },
  developing: { label: "⚠ DEVELOPING STORY", cls: "bg-amber-500 text-white" },
  resolved: { label: "✓ RESOLVED", cls: "bg-slate-500 text-white" },
};

export function LiveBlog({ breaking, initialUpdates }: { breaking: Breaking; initialUpdates: Update[] }) {
  const [updates, setUpdates] = useState<Update[]>(initialUpdates);
  const [status, setStatus] = useState(breaking.status);
  const [flashId, setFlashId] = useState<number | null>(null);

  // live polling for new updates
  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/breaking/${breaking.id}/updates`, { cache: "no-store" });
        const data = await res.json();
        if (data.updates?.length) {
          const mapped: Update[] = data.updates.map((u: any) => ({
            id: u.u.id,
            content: u.u.content,
            createdAt: u.u.createdAt,
            authorName: u.a?.name ?? "Desk",
          }));
          setUpdates((prev) => {
            const newest = mapped.find((m) => !prev.some((p) => p.id === m.id));
            if (newest) setFlashId(newest.id);
            return mapped;
          });
        }
      } catch {
        /* ignore */
      }
    }, 15000);
    return () => clearInterval(t);
  }, [breaking.id]);

  const st = STATUS_STYLE[status] ?? STATUS_STYLE.live;

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`chip ${st.cls}`}>{st.label}</span>
        <span className="chip bg-orange-700 text-white">
          <AlertTriangle size={11} /> {breaking.severity.toUpperCase()} SEVERITY
        </span>
        {breaking.country && <span className="chip bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200">{breaking.country}</span>}
      </div>

      <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl">{breaking.title}</h1>
      {breaking.summary && <p className="mt-3 text-lg text-(--muted)">{breaking.summary}</p>}

      <div className="mt-4 flex flex-wrap gap-4 border-y border-(--line) py-3 text-xs font-semibold text-(--muted)">
        <span className="flex items-center gap-1"><Clock3 size={13} /> Coverage started {timeAgo(breaking.startedAt)}</span>
        <span className="flex items-center gap-1">Last update {timeAgo(breaking.updatedAt)}</span>
        <span>{updates.length} live updates</span>
      </div>

      {breaking.content && (
        <div className="article-body mt-6">{breaking.content.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}</div>
      )}

      <h2 className="mt-10 text-xl font-black">📡 Update Timeline</h2>
      <ol className="relative mt-4 border-l-2 border-red-300 pl-6 dark:border-red-900">
        {updates.map((u) => (
          <li key={u.id} className={`relative mb-5 ${flashId === u.id ? "flash-update rounded-lg" : ""}`}>
            <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-white bg-red-600 dark:border-slate-900" />
            <div className="card p-4">
              <p className="text-xs font-bold text-(--muted)">
                {timeAgo(u.createdAt)} · {u.authorName}
              </p>
              <p className="mt-1 text-sm whitespace-pre-wrap">{u.content}</p>
            </div>
          </li>
        ))}
        {updates.length === 0 && (
          <li className="card p-6 text-sm text-(--muted)">Waiting for the first live update…</li>
        )}
      </ol>
    </div>
  );
}
