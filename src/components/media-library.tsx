"use client";

import { useEffect, useState } from "react";
import { Copy, Image as ImageIcon, Search, Upload } from "lucide-react";

type Media = { id: number; url: string; type: string; title: string; alt: string; createdAt: string };

export function MediaLibrary() {
  const [items, setItems] = useState<Media[]>([]);
  const [q, setQ] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [alt, setAlt] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch(`/api/media?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setItems(data.items ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const upload = async () => {
    if (!file && !url.trim()) return setMsg("Choose a file or enter a hosted media URL");
    const fd = new FormData();
    if (file) fd.set("file", file);
    else fd.set("url", url.trim());
    fd.set("title", title);
    fd.set("alt", alt || title);
    fd.set("type", file?.type.startsWith("video") ? "video" : file?.type.startsWith("audio") ? "audio" : "image");
    const res = await fetch("/api/media", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) return setMsg(data.error ?? "Upload failed");
    setMsg(`Uploaded ✔ ${data.item.url}`);
    setFile(null);
    setUrl("");
    setTitle("");
    load();
  };

  return (
    <main>
      <h1 className="text-2xl font-black tracking-tight">Media Library</h1>
      <p className="mt-1 text-sm text-(--muted)">Register a hosted media URL, or upload a file when running locally, then copy URLs into articles. File uploads on Vercel require external storage.</p>

      <div className="card mt-5 p-5">
        <p className="label">Upload media</p>
        <div className="flex flex-wrap items-center gap-2">
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
          <input className="input !w-72" type="url" placeholder="Hosted image URL (if no file)" value={url} onChange={(e) => setUrl(e.target.value)} />
          <input className="input !w-48" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="input !w-48" placeholder="Alt text (image SEO)" value={alt} onChange={(e) => setAlt(e.target.value)} />
          <button className="btn btn-primary" onClick={upload}><Upload size={15} /> Upload</button>
        </div>
        {msg && <p className="mt-2 text-sm font-semibold text-green-600">{msg}</p>}
      </div>

      <div className="mt-5 flex items-center gap-2">
        <Search size={15} className="text-(--muted)" />
        <input className="input !w-72" placeholder="Search media…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} />
        <button className="btn" onClick={load}>Search</button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((m) => (
          <div key={m.id} className="card overflow-hidden">
            {m.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.url} alt={m.alt} className="aspect-video w-full object-cover" />
            ) : (
              <div className="grid aspect-video place-items-center bg-slate-800 text-white">
                <ImageIcon size={32} />
              </div>
            )}
            <div className="p-3">
              <p className="truncate text-sm font-bold">{m.title || "(untitled)"}</p>
              <p className="truncate text-xs text-(--muted)">{m.alt || "no alt text"}</p>
              <button
                className="btn mt-2 w-full !py-1 text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(m.url);
                }}
              >
                <Copy size={12} /> Copy URL
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="card p-8 text-sm text-(--muted)">No media found.</p>}
      </div>
    </main>
  );
}
