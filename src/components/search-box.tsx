"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function SearchBox() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setSuggestions(data.suggestions ?? []);
        setOpen(true);
      } catch {
        /* ignore */
      }
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = (term?: string) => {
    const v = (term ?? q).trim();
    if (v) router.push(`/search?q=${encodeURIComponent(v)}`);
    setOpen(false);
  };

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        className="input !pl-9"
        placeholder="Search news, authors, countries, tags…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => suggestions.length && setOpen(true)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      {open && suggestions.length > 0 && (
        <div className="fade-up absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-(--line) bg-(--surface) shadow-2xl">
          {suggestions.map((s) => (
            <button
              key={s}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-slate-800"
              onClick={() => submit(s)}
            >
              <Search size={12} className="mr-2 inline text-slate-400" />
              {s}
            </button>
          ))}
          <button
            className="block w-full border-t border-(--line) px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-slate-800"
            onClick={() => submit()}
          >
            See all results for “{q}” →
          </button>
        </div>
      )}
    </div>
  );
}
