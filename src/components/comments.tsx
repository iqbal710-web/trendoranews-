"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { timeAgo } from "@/lib/utils";

type Comment = {
  id: number;
  content: string;
  authorName: string;
  createdAt: string;
  userId: number | null;
  authorVerified: boolean | null;
};

export function Comments({ articleId, initialCount }: { articleId: number; initialCount: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [me, setMe] = useState<{ id: number } | null>(null);
  const [posting, setPosting] = useState(false);

  const load = async () => {
    const res = await fetch(`/api/comments?articleId=${articleId}`);
    const data = await res.json();
    setComments(data.comments ?? []);
  };

  useEffect(() => {
    load();
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setMe(d.user));
  }, [articleId]);

  const submit = async () => {
    if (!content.trim()) return;
    setPosting(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, content, authorName: name }),
    });
    setPosting(false);
    if (res.ok) {
      setContent("");
      await load();
    }
  };

  const remove = async (id: number) => {
    await fetch("/api/comments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  };

  return (
    <section className="mt-10">
      <h2 className="flex items-center gap-2 text-xl font-black">
        <MessageSquare size={20} className="text-red-600" /> Comments
        <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">{comments.length || initialCount}</span>
      </h2>

      <div className="card mt-4 p-4">
        {!me && (
          <input
            className="input mb-2"
            placeholder="Your name (optional — posts as Guest)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <textarea
          className="input min-h-24"
          placeholder={me ? "Share your thoughts…" : "Sign in for a verified comment, or comment as guest…"}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button className="btn btn-primary mt-2" onClick={submit} disabled={posting}>
          <Send size={14} /> {posting ? "Posting…" : "Post comment"}
        </button>
      </div>

      <ul className="mt-4 flex flex-col gap-3">
        {comments.map((c) => (
          <li key={c.id} className="card p-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-700 text-[11px] font-bold text-white">
                {c.authorName.charAt(0).toUpperCase()}
              </span>
              <span className="font-bold">{c.authorName}</span>
              {c.authorVerified && <span className="chip bg-blue-600 text-white">Verified</span>}
              <span className="text-xs text-(--muted)">{timeAgo(c.createdAt)}</span>
              {me && c.userId === me.id && (
                <button className="ml-auto text-(--muted) hover:text-red-600" onClick={() => remove(c.id)} title="Delete">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <p className="mt-2 text-sm whitespace-pre-wrap">{c.content}</p>
          </li>
        ))}
        {comments.length === 0 && (
          <li className="card p-6 text-center text-sm text-(--muted)">No comments yet — be the first to comment.</li>
        )}
      </ul>
    </section>
  );
}
