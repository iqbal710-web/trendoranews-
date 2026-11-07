"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, History, Save, Send } from "lucide-react";

type Cat = { id: number; name: string; slug: string; parentId: number | null };
type Version = { v: { id: number; title: string; createdAt: string }; u: { name: string } | null };

const COUNTRIES = ["Bangladesh", "India", "Pakistan", "Nepal", "Bhutan", "Sri Lanka", "Myanmar", "China", "Japan", "South Korea", "United States", "United Kingdom", "Germany", "France", "Russia", "Ukraine", "Saudi Arabia", "UAE", "Qatar", "Turkey", "Iran", "Iraq", "Israel", "Palestine", "Egypt", "Nigeria", "South Africa", "Kenya", "Brazil", "Argentina", "Australia", "Canada", "Italy", "Spain", "Netherlands", "Switzerland", "Sweden", "Norway", "Thailand", "Vietnam", "Indonesia", "Malaysia", "Singapore", "Philippines"];
const REGIONS = ["South Asia", "East Asia", "Southeast Asia", "Middle East", "Europe", "Africa", "North America", "South America", "Oceania", "Global"];

export function ArticleEditor({ articleId }: { articleId?: number }) {
  const router = useRouter();
  const [cats, setCats] = useState<Cat[]>([]);
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    categoryId: "",
    country: "Bangladesh",
    region: "South Asia",
    type: "news",
    tags: "",
    status: "draft",
    scheduledAt: "",
    factCheckStatus: "pending",
    coverImage: "",
    featured: false,
    breaking: false,
    editorChoice: false,
    seoTitle: "",
    seoDescription: "",
  });
  const [versions, setVersions] = useState<Version[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const draftKey = `trendora_draft_${articleId ?? "new"}`;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCats(d.items ?? []));
  }, []);

  // load existing article or local autosave draft
  useEffect(() => {
    if (!articleId) {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        try {
          setForm((f) => ({ ...f, ...JSON.parse(saved) }));
          setLastSaved("restored from autosave");
        } catch {
          /* ignore */
        }
      }
      return;
    }
    fetch(`/api/articles/${articleId}`)
      .then((r) => r.json())
      .then((data) => {
        const a = data.article;
        if (a) {
          setForm({
            title: a.title ?? "",
            excerpt: a.excerpt ?? "",
            content: a.content ?? "",
            categoryId: a.categoryId ? String(a.categoryId) : "",
            country: a.country ?? "Bangladesh",
            region: a.region ?? "South Asia",
            type: a.type ?? "news",
            tags: "",
            status: a.status ?? "draft",
            scheduledAt: a.scheduledAt ? a.scheduledAt.slice(0, 16) : "",
            factCheckStatus: a.factCheckStatus ?? "pending",
            coverImage: a.coverImage ?? "",
            featured: !!a.featured,
            breaking: !!a.breaking,
            editorChoice: !!a.editorChoice,
            seoTitle: a.seoTitle ?? "",
            seoDescription: a.seoDescription ?? "",
          });
        }
        setVersions(data.versions ?? []);
      });
  }, [articleId]);

  // autosave to localStorage every 5s when dirty
  const set = useCallback((patch: Partial<typeof form>) => {
    setForm((f) => {
      const next = { ...f, ...patch };
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        localStorage.setItem(draftKey, JSON.stringify(next));
        setLastSaved(new Date().toLocaleTimeString());
      }, 1500);
      return next;
    });
  }, []);

  const save = async (publish: boolean) => {
    setSaving(true);
    setMsg(null);
    const payload = {
      ...form,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      status: publish ? "published" : form.status,
      scheduledAt: form.scheduledAt || null,
    };
    const res = await fetch(articleId ? `/api/articles/${articleId}` : "/api/articles", {
      method: articleId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setMsg(data.error ?? "Save failed");
    localStorage.removeItem(draftKey);
    setMsg(publish ? "Published! 🎉" : "Saved ✔");
    if (!articleId && data.article) {
      router.replace(`/dashboard/articles/${data.article.id}`);
    }
    if (articleId) {
      const v = await fetch(`/api/articles/${articleId}`);
      const vd = await v.json();
      setVersions(vd.versions ?? []);
    }
    if (publish && data.article) {
      setTimeout(() => router.push(`/article/${data.article.slug}`), 800);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-black tracking-tight">{articleId ? "Edit article" : "New article"}</h1>
        <span className="ml-auto text-xs text-(--muted)">
          {lastSaved ? `Autosaved ${lastSaved}` : "Autosave on"}
        </span>
        <button className="btn" onClick={() => setPreview(true)}><Eye size={15} /> Preview</button>
        <button className="btn" onClick={() => save(false)} disabled={saving}>
          <Save size={15} /> {saving ? "Saving…" : "Save draft"}
        </button>
        <button className="btn btn-primary" onClick={() => save(true)} disabled={saving}>
          <Send size={15} /> Publish
        </button>
      </div>
      {msg && <p className="mt-3 rounded-lg bg-green-50 p-2 text-sm font-bold text-green-700 dark:bg-green-950">{msg}</p>}

      <div className="card mt-4 grid gap-4 p-5">
        <div>
          <label className="label">Title</label>
          <input className="input !text-lg font-bold" value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="Headline…" />
        </div>
        <div>
          <label className="label">Excerpt</label>
          <textarea className="input min-h-16" value={form.excerpt} onChange={(e) => set({ excerpt: e.target.value })} placeholder="Short summary shown on cards…" />
        </div>
        <div>
          <label className="label">Content (Markdown-lite: ## heading, &gt; quote, - list, blank line = new paragraph)</label>
          <textarea
            className="input min-h-80 font-mono !text-sm"
            value={form.content}
            onChange={(e) => set({ content: e.target.value })}
            placeholder={"Write the story…\n\n## Section heading\n\nParagraph text.\n\n> A quote\n\n- point one\n- point two"}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.categoryId} onChange={(e) => set({ categoryId: e.target.value })}>
              <option value="">— none —</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>{c.parentId ? "— " : ""}{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Country</label>
            <select className="input" value={form.country} onChange={(e) => set({ country: e.target.value })}>
              {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Region</label>
            <select className="input" value={form.region} onChange={(e) => set({ region: e.target.value })}>
              {REGIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={(e) => set({ type: e.target.value })}>
              {["news", "opinion", "investigation", "feature", "video", "gallery", "live"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => set({ status: e.target.value })}>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="label">Schedule publish at</label>
            <input className="input" type="datetime-local" value={form.scheduledAt} onChange={(e) => set({ scheduledAt: e.target.value })} />
          </div>
          <div>
            <label className="label">Tags (comma separated)</label>
            <input className="input" value={form.tags} onChange={(e) => set({ tags: e.target.value })} placeholder="flood, cricket, AI" />
          </div>
          <div>
            <label className="label">Fact-check status</label>
            <select className="input" value={form.factCheckStatus} onChange={(e) => set({ factCheckStatus: e.target.value })}>
              {["pending", "verified", "unverified", "disputed"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Cover image URL (from Media Library)</label>
            <input className="input" value={form.coverImage} onChange={(e) => set({ coverImage: e.target.value })} placeholder="/covers/… or /uploads/…" />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          {(["featured", "breaking", "editorChoice"] as const).map((k) => (
            <label key={k} className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={form[k]} onChange={(e) => set({ [k]: e.target.checked })} />
              {k === "featured" ? "⭐ Featured" : k === "breaking" ? "🔴 Breaking" : "🏅 Editor's choice"}
            </label>
          ))}
        </div>

        <details className="rounded-xl border border-(--line) p-3">
          <summary className="cursor-pointer text-sm font-bold">SEO settings</summary>
          <div className="mt-3 grid gap-3">
            <input className="input" placeholder="SEO title" value={form.seoTitle} onChange={(e) => set({ seoTitle: e.target.value })} />
            <textarea className="input" placeholder="SEO meta description" value={form.seoDescription} onChange={(e) => set({ seoDescription: e.target.value })} />
          </div>
        </details>
      </div>

      {versions.length > 0 && (
        <div className="card mt-6 p-5">
          <p className="label flex items-center gap-1"><History size={13} /> Version history ({versions.length})</p>
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm">
            {versions.map((v) => (
              <li key={v.v.id} className="flex items-center gap-2 text-(--muted)">
                <span className="font-semibold text-(--ink)">{v.v.title.slice(0, 60)}</span>
                · by {v.u?.name ?? "system"} · {new Date(v.v.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/60 p-4" onClick={() => setPreview(false)}>
          <div className="card mx-auto mt-8 max-w-3xl p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-wider text-red-600">Article preview</p>
              <button className="btn !p-1.5" onClick={() => setPreview(false)}>✕</button>
            </div>
            <h1 className="mt-3 text-3xl font-black leading-tight">{form.title || "Untitled"}</h1>
            <p className="mt-2 text-lg text-(--muted)">{form.excerpt}</p>
            {form.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.coverImage} alt="" className="mt-4 w-full rounded-xl" />
            )}
            <div className="article-body mt-6">
              {form.content.split(/\n{2,}/).filter(Boolean).map((p, i) =>
                p.startsWith("## ") ? <h2 key={i}>{p.slice(3)}</h2> : p.startsWith("> ") ? <blockquote key={i}>{p.slice(2)}</blockquote> : <p key={i}>{p}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
