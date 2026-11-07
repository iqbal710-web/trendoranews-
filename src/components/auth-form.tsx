"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Zap } from "lucide-react";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [googleMsg, setGoogleMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Something went wrong");
    router.push("/dashboard");
    router.refresh();
  };

  const google = async () => {
    const res = await fetch("/api/auth/google");
    const data = await res.json();
    if (data.configured === false) {
      setGoogleMsg(data.message);
    } else {
      window.location.href = "/api/auth/google";
    }
  };

  return (
    <main className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-4 py-12">
      <div className="card w-full p-8">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-red-600 text-white">
            <Zap size={18} fill="currentColor" />
          </span>
          <span className="text-xl font-black">
            Trendora<span className="text-red-600">News</span>
          </span>
        </div>
        <h1 className="mt-6 text-2xl font-black">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-1 text-sm text-(--muted)">
          {mode === "login"
            ? "Sign in to save articles, comment with a verified badge and personalize your feed."
            : "Join TrendoraNews — follow categories & authors, bookmark stories, get alerts."}
        </p>

        <button className="btn mt-5 w-full !py-2.5" onClick={google}>
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.3h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.2 3.7-8.8z"/><path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.1-6.8-5.1L1.3 17.2C3.3 21.2 7.3 24 12 24z"/><path fill="#FBBC05" d="M5.2 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.3 6.8C.5 8.4 0 10.1 0 12s.5 3.6 1.3 5.2l3.9-2.9z"/><path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.3 0 3.3 2.8 1.3 6.8l3.9 2.9c.9-3 3.6-5 6.8-5z"/></svg>
          Continue with Google
        </button>
        {googleMsg && <p className="mt-2 text-xs text-amber-600">{googleMsg}</p>}

        <div className="my-4 flex items-center gap-3 text-xs text-(--muted)">
          <span className="h-px flex-1 bg-(--line)" /> OR <span className="h-px flex-1 bg-(--line)" />
        </div>

        {mode === "register" && (
          <div className="mb-3">
            <label className="label">Full name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
        )}
        <div className="mb-3">
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="mb-4">
          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        {error && <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm font-semibold text-red-700 dark:bg-red-950">{error}</p>}
        <button className="btn btn-primary w-full !py-2.5" onClick={submit} disabled={busy}>
          {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>
        <p className="mt-4 text-center text-sm text-(--muted)">
          {mode === "login" ? (
            <>No account? <Link href="/auth/register" className="font-bold text-red-600 hover:underline">Register</Link></>
          ) : (
            <>Already registered? <Link href="/auth/login" className="font-bold text-red-600 hover:underline">Sign in</Link></>
          )}
        </p>
        <div className="mt-4 rounded-xl bg-slate-100 p-3 text-xs text-(--muted) dark:bg-slate-800">
          <p className="font-bold">Demo newsroom accounts:</p>
          <p>admin@trendora.news · editor@trendora.news · reporter@trendora.news · factcheck@trendora.news — password: <b>password123</b></p>
        </div>
      </div>
    </main>
  );
}
