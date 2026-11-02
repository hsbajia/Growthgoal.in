"use client";

import * as React from "react";
import { Loader2, LockKeyhole } from "lucide-react";
import { LotusMark } from "@/components/site/logo";

export default function AdminLogin() {
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (res.ok) {
      window.location.href = "/admin";
      return;
    }
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setError(data.error || "Could not log in.");
    setBusy(false);
  };

  return (
    <main className="flex min-h-svh items-center justify-center px-5">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-[0_30px_60px_-40px_rgba(23,19,16,0.5)]">
        <LotusMark className="h-7 w-10 text-gold" />
        <h1 className="mt-4 font-display text-3xl font-medium">Admin login</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage moortis, photos and contact details.</p>
        <label className="mt-6 flex flex-col gap-1.5 text-sm font-medium">
          Password
          <input type="password" autoFocus required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl border border-border bg-background px-4 text-base outline-none focus:border-gold focus:ring-2 focus:ring-gold/25" />
        </label>
        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={busy} className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-sm font-medium text-background disabled:opacity-60">
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <LockKeyhole className="size-4" aria-hidden="true" />} Log in
        </button>
      </form>
    </main>
  );
}
