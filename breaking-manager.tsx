"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Radio, Send } from "lucide-react";
import { timeAgo } from "@/lib/utils";

type B = {
  id: number; slug: string; title: string; status: string; severity: string; country: string;
  summary: string | null; startedAt: string; updatedAt: string;
};

export function BreakingManager() {
  const [items, setItems] = useState<B[]>([]);
  const [form, setForm] = useState({ title: "", summary: "", country: "Bangladesh", severity: "high", status: "live", expiresAt: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [updateFor, setUpdateFor] = useState<number | null>(null);
  const [updateText, setUpdateText] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");

  const load = async () => {
    const res = await fetch("/api/breaking");
    const data = await res.json();
    setItems(data.items ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    const res = await fetch("/api/breaking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, initialUpdate: "Live coverage has begun. Updates will appear here in real time." }),
    });
    const data = await res.json();
    if (!res.ok) return setMsg(data.error ?? "Failed");
    setMsg(`🚨 Live story created: ${data.item.slug}`);
    setForm({ title: "", summary: "", country: "Bangladesh", severity: "high", status: "live", expiresAt: "" });
    load();
  };

  const postUpdate = async () => {
    if (!updateFor || !updateText.trim()) return;
    const res = await fetch(`/api/breaking/${updateFor}/updates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: updateText, status: updateStatus || undefined }),
    });
    if (res.ok) {
      setUpdateText("");
      setUpdateFor(null);
      setMsg("Update posted — pushed to all subscribers' notifications ✔");
      load();
    }
  };

  return (
    <main>
      <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight">
        <Radio className="text-red-600" /> Live / Breaking Desk
      </h1>
      <p className="mt-1 text-sm text-(--muted)">Create emergency alerts and post real-time updates to the live blog timeline.</p>
      {msg && <p className="mt-3 rounded-lg bg-green-50 p-2 text-sm font-bold text-green-700 dark:bg-green-950">{msg}</p>}

      <div className="card mt-5 grid gap-3 p-5">
        <p className="label">🚨 New breaking story</p>
        <input className="input" placeholder="Headline…" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea className="input" placeholder="Summary…" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        <div className="flex flex-wrap gap-2">
          <input className="input !w-48" placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          <select className="input !w-40" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
            {["low", "medium", "high", "critical"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <select className="input !w-40" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="live">live</option>
            <option value="developing">developing</option>
            <option value="resolved">resolved</option>
          </select>
          <input className="input !w-52" type="datetime-local" title="Auto-expire at" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
          <button className="btn btn-primary" onClick={create}>Publish alert</button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {items.map((b) => (
          <div key={b.id} className="card p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`chip text-white ${b.status === "live" ? "bg-red-600 animate-pulse" : b.status === "developing" ? "bg-amber-500" : "bg-slate-500"}`}>{b.status}</span>
              <span className="chip bg-orange-700 text-white">{b.severity}</span>
              <span className="text-(--muted)">{timeAgo(b.updatedAt)}</span>
              <Link href={`/breaking/${b.slug}`} className="ml-auto font-bold text-red-600 hover:underline">View live blog →</Link>
            </div>
            <p className="mt-1 font-black">{b.title}</p>
            {updateFor === b.id ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <input className="input flex-1" placeholder="Live update text…" value={updateText} onChange={(e) => setUpdateText(e.target.value)} />
                <select className="input !w-40" value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)}>
                  <option value="">keep status</option>
                  <option value="live">live</option>
                  <option value="developing">developing</option>
                  <option value="resolved">resolved</option>
                </select>
                <button className="btn btn-primary" onClick={postUpdate}><Send size={14} /> Post</button>
                <button className="btn" onClick={() => setUpdateFor(null)}>Cancel</button>
              </div>
            ) : (
              <button className="btn mt-2 !py-1 text-xs" onClick={() => setUpdateFor(b.id)}>+ Post live update</button>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
