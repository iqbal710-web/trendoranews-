"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { timeAgo } from "@/lib/utils";

type FC = { id: number; claim: string; verdict: string; explanation: string; createdAt: string };

export function FactCheckCenter({
  initial,
  verdictStyle,
}: {
  initial: FC[];
  verdictStyle: Record<string, { label: string; cls: string }>;
}) {
  const [items, setItems] = useState<FC[]>(initial);
  const [claim, setClaim] = useState("");
  const [verdict, setVerdict] = useState("false");
  const [explanation, setExplanation] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async () => {
    const res = await fetch("/api/fact-checks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claim, verdict, explanation }),
    });
    const data = await res.json();
    if (res.ok) {
      setItems((p) => [data.item, ...p]);
      setClaim("");
      setExplanation("");
      setMsg("Fact check published ✔");
    } else {
      setMsg(data.error ?? "Failed");
    }
    setTimeout(() => setMsg(null), 2500);
  };

  return (
    <div className="mt-6">
      <div className="card mb-8 p-5">
        <p className="label flex items-center gap-1"><ShieldCheck size={13} /> Submit a claim for verification (fact-checker desk)</p>
        <textarea className="input mb-2 min-h-16" placeholder="The claim being checked…" value={claim} onChange={(e) => setClaim(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          <select className="input !w-44" value={verdict} onChange={(e) => setVerdict(e.target.value)}>
            {Object.keys(verdictStyle).map((v) => (
              <option key={v} value={v}>{verdictStyle[v].label}</option>
            ))}
          </select>
          <input className="input flex-1" placeholder="Explanation / evidence…" value={explanation} onChange={(e) => setExplanation(e.target.value)} />
          <button className="btn btn-primary" onClick={submit}>Publish verdict</button>
        </div>
        {msg && <p className="mt-2 text-sm font-semibold text-red-600">{msg}</p>}
      </div>

      <div className="flex flex-col gap-4">
        {items.map((f) => {
          const v = verdictStyle[f.verdict] ?? verdictStyle.unproven;
          return (
            <article key={f.id} className="card p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`chip text-white ${v.cls}`}>{v.label}</span>
                <span className="ml-auto text-xs text-(--muted)">{timeAgo(f.createdAt)}</span>
              </div>
              <p className="mt-2 font-bold">“{f.claim}”</p>
              <p className="mt-1 text-sm text-(--muted)">{f.explanation}</p>
            </article>
          );
        })}
        {items.length === 0 && <p className="card p-8 text-center text-sm text-(--muted)">No fact checks published yet.</p>}
      </div>
    </div>
  );
}
