"use client";

import { useState } from "react";
import { MailCheck, Send } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");

  return (
    <form
      className="flex w-full max-w-md gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const res = await fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        setState(res.ok ? "ok" : "err");
        if (res.ok) setEmail("");
      }}
    >
      <input
        className="input"
        type="email"
        required
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="btn btn-primary" type="submit">
        <Send size={15} /> Subscribe
      </button>
      {state === "ok" && (
        <span className="flex items-center gap-1 text-sm font-semibold text-green-600">
          <MailCheck size={15} /> Subscribed!
        </span>
      )}
      {state === "err" && <span className="text-sm font-semibold text-red-600">Failed — try again</span>}
    </form>
  );
}
