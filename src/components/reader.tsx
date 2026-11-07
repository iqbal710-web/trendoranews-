"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AArrowDown, AArrowUp, AlignJustify, Bookmark, Check, Copy, Download, Heart,
  Maximize, Minimize, Pause, Play, Printer, Share2, BookOpen,
} from "lucide-react";

type ReaderArticle = {
  id: number;
  slug: string;
  title: string;
  content: string;
  likes: number;
  shares: number;
  liked: boolean;
  bookmarked: boolean;
};

function renderBlocks(content: string) {
  const blocks = content.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((b, i) => {
    if (b.startsWith("## ")) return <h2 key={i}>{b.slice(3)}</h2>;
    if (b.startsWith("### ")) return <h3 key={i}>{b.slice(4)}</h3>;
    if (b.startsWith("> ")) return <blockquote key={i}>{b.slice(2)}</blockquote>;
    if (b.split("\n").every((l) => l.trim().startsWith("- "))) {
      return (
        <ul key={i}>
          {b.split("\n").map((l, j) => (
            <li key={j}>{l.trim().slice(2)}</li>
          ))}
        </ul>
      );
    }
    return <p key={i}>{b.split("\n").join(" ")}</p>;
  });
}

export function Reader({
  article,
  sources,
  tags,
  categorySlug,
  authorId,
}: {
  article: ReaderArticle;
  sources: { id: number; label: string; url: string }[];
  tags: { name: string; slug: string }[];
  categorySlug: string | null;
  authorId: number | null;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [fontScale, setFontScale] = useState(1);
  const [leading, setLeading] = useState(1.85);
  const [readingMode, setReadingMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [liked, setLiked] = useState(article.liked);
  const [likes, setLikes] = useState(article.likes);
  const [bookmarked, setBookmarked] = useState(article.bookmarked);
  const [shares, setShares] = useState(article.shares);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  // reading progress + view + history
  useEffect(() => {
    const onScroll = () => {
      const el = bodyRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const done = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      setProgress(total > 0 ? (done / total) * 100 : 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let sid = sessionStorage.getItem("trendora_sid");
    if (!sid) {
      sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("trendora_sid", sid);
    }
    fetch(`/api/articles/${article.id}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sid }),
    }).catch(() => {});
    // local reading history
    try {
      const hist = JSON.parse(localStorage.getItem("trendora_history") ?? "[]");
      hist.unshift({ slug: article.slug, title: article.title, at: Date.now() });
      localStorage.setItem("trendora_history", JSON.stringify(hist.slice(0, 50)));
    } catch {
      /* ignore */
    }
  }, [article.id, article.slug, article.title]);

  // reading mode class on body
  useEffect(() => {
    document.body.classList.toggle("reading-mode", readingMode);
    return () => document.body.classList.remove("reading-mode");
  }, [readingMode]);

  // fullscreen
  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await bodyRef.current?.requestFullscreen();
    } catch {
      /* unsupported */
    }
  };

  const toggleTts = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const text = `${article.title}. ${article.content}`;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
    setSpeaking(true);
  };

  useEffect(() => () => window.speechSynthesis.cancel(), []);

  const doLike = async () => {
    const res = await fetch(`/api/articles/${article.id}/like`, { method: "POST" });
    if (res.status === 401) return showToast("Sign in to like articles");
    const data = await res.json();
    setLiked(data.liked);
    setLikes(data.likes);
  };

  const doBookmark = async () => {
    const res = await fetch(`/api/articles/${article.id}/bookmark`, { method: "POST" });
    if (res.status === 401) return showToast("Sign in to bookmark articles");
    const data = await res.json();
    setBookmarked(data.bookmarked);
    showToast(data.bookmarked ? "Saved to your bookmarks" : "Removed from bookmarks");
  };

  const doShare = async () => {
    const url = window.location.href;
    fetch(`/api/articles/${article.id}/share`, { method: "POST" }).then((r) => r.json()).then((d) => setShares(d.shares ?? shares)).catch(() => {});
    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, url });
        return;
      } catch {
        /* cancelled */
      }
    }
    await navigator.clipboard.writeText(url);
    showToast("Link copied — share it anywhere!");
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    showToast("Link copied to clipboard");
    setTimeout(() => setCopied(false), 1800);
  };

  const follow = async (kind: "category" | "author") => {
    const body: Record<string, number> = kind === "category" && categorySlug ? {} : {};
    const res = await fetch("/api/user/library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(kind === "category" ? { categoryId: body.categoryId } : { authorId: authorId ?? 0 }),
    });
    if (res.status === 401) return showToast("Sign in to follow");
    showToast(kind === "category" ? "Following this category" : "Following this author");
  };

  const printPdf = () => {
    showToast("Use 'Save as PDF' in the print dialog to download");
    setTimeout(() => window.print(), 300);
  };

  return (
    <div ref={bodyRef}>
      {/* progress bar */}
      <div className="prog-bar no-print" style={{ width: `${progress}%` }} />

      {/* toolbar */}
      <div className="no-print sticky top-[104px] z-40 mt-6 flex flex-wrap items-center gap-1.5 rounded-xl border border-(--line) bg-(--surface)/95 p-2 shadow-sm backdrop-blur">
        <span className="mr-1 hidden text-[10px] font-black uppercase tracking-wider text-(--muted) sm:inline">Reader</span>
        <button className="btn !p-2" title="Decrease font size" onClick={() => setFontScale((s) => Math.max(0.8, +(s - 0.1).toFixed(2)))}>
          <AArrowDown size={15} />
        </button>
        <button className="btn !p-2" title="Increase font size" onClick={() => setFontScale((s) => Math.min(1.6, +(s + 0.1).toFixed(2)))}>
          <AArrowUp size={15} />
        </button>
        <button
          className="btn !p-2"
          title="Toggle line spacing"
          onClick={() => setLeading((l) => (l > 1.9 ? 1.6 : 1.95))}
        >
          <AlignJustify size={15} />
        </button>
        <span className="mx-1 h-5 w-px bg-(--line)" />
        <button className={`btn !p-2 ${speaking ? "!border-red-600 !text-red-600" : ""}`} title="Listen to article (text-to-speech)" onClick={toggleTts}>
          {speaking ? <Pause size={15} /> : <Play size={15} />}
          <span className="hidden sm:inline">{speaking ? "Stop" : "Listen"}</span>
        </button>
        <button className={`btn !p-2 ${readingMode ? "!border-red-600 !text-red-600" : ""}`} title="Distraction-free reading mode" onClick={() => setReadingMode(!readingMode)}>
          <BookOpen size={15} /> <span className="hidden sm:inline">Reading</span>
        </button>
        <button className="btn !p-2" title={fullscreen ? "Exit full screen" : "Full-screen reading"} onClick={toggleFullscreen}>
          {fullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
        </button>
        <span className="mx-1 h-5 w-px bg-(--line)" />
        <button className={`btn !p-2 ${liked ? "!border-red-600 !text-red-600" : ""}`} title="Like article" onClick={doLike}>
          <Heart size={15} fill={liked ? "currentColor" : "none"} /> {likes}
        </button>
        <button className={`btn !p-2 ${bookmarked ? "!border-amber-500 !text-amber-500" : ""}`} title="Bookmark article" onClick={doBookmark}>
          <Bookmark size={15} fill={bookmarked ? "currentColor" : "none"} />
        </button>
        <button className="btn !p-2" title="Share article" onClick={doShare}>
          <Share2 size={15} /> {shares > article.shares ? shares : article.shares}
        </button>
        <button className="btn !p-2" title="Copy link" onClick={copyLink}>
          {copied ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
        </button>
        <button className="btn !p-2" title="Print article" onClick={() => window.print()}>
          <Printer size={15} />
        </button>
        <button className="btn !p-2" title="Download as PDF (print → save as PDF)" onClick={printPdf}>
          <Download size={15} /> <span className="hidden sm:inline">PDF</span>
        </button>
        <span className="ml-auto text-[10px] font-bold text-(--muted)">{Math.round(progress)}% read</span>
      </div>

      {/* body */}
      <div
        className="article-body mt-6"
        style={{ ["--reader-font" as string]: `${1.125 * fontScale}rem`, ["--reader-leading" as string]: String(leading) }}
      >
        {renderBlocks(article.content)}
      </div>

      {/* follow buttons */}
      <div className="no-print mt-8 flex flex-wrap gap-2">
        {categorySlug && (
          <button className="btn text-xs" onClick={() => follow("category")}>+ Follow this category</button>
        )}
        {authorId && (
          <button className="btn text-xs" onClick={() => follow("author")}>+ Follow this author</button>
        )}
      </div>

      {toast && (
        <div className="no-print fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
}
