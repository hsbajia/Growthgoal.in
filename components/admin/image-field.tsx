"use client";

import * as React from "react";
import { ImagePlus, Loader2, Trash2, TriangleAlert } from "lucide-react";
import { prepareImage } from "@/lib/prepare-image";

export function ImageField({ label, hint, value, onChange, fallback }: {
  label: string;
  hint?: string;
  value?: string;
  onChange: (url: string | undefined) => void;
  /** Shown when there is no photo (e.g. the drawing). */
  fallback?: React.ReactNode;
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [warning, setWarning] = React.useState("");
  const id = React.useId();

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setWarning("");
    setBusy(true);
    try {
      const prepared = await prepareImage(file);
      if (!prepared.transparent) setWarning("This photo has a background. It will work, but a background-removed PNG looks much better on the shelf.");
      const ext = prepared.blob.type === "image/png" ? "png" : prepared.blob.type === "image/jpeg" ? "jpg" : "webp";
      const form = new FormData();
      if (prepared.transparent) form.append("cutout", "1");
      form.append("file", new File([prepared.blob], `photo.${ext}`, { type: prepared.blob.type }));
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Upload failed. Please try again.");
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium" id={`${id}-label`}>{label}</span>
      <div className="flex items-stretch gap-3">
        <div className="relative aspect-[4/5] w-28 shrink-0 overflow-hidden rounded-xl border border-border bg-[length:16px_16px] bg-[conic-gradient(#efe9df_25%,#fff_0_50%,#efe9df_0_75%,#fff_0)]">
          {value
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={value} alt="" className="absolute inset-0 size-full object-contain object-bottom" />
            : <div className="absolute inset-1.5">{fallback}</div>}
          {busy && <div className="absolute inset-0 flex items-center justify-center bg-white/70"><Loader2 className="size-5 animate-spin" aria-hidden="true" /></div>}
        </div>
        <div className="flex min-w-0 flex-col justify-center gap-2">
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/heic" className="sr-only" aria-labelledby={`${id}-label`} onChange={(e) => onFile(e.target.files?.[0])} />
          <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-foreground px-4 text-sm font-medium text-background disabled:opacity-60">
            <ImagePlus className="size-4" aria-hidden="true" /> {value ? "Change photo" : "Upload photo"}
          </button>
          {value && (
            <button type="button" disabled={busy} onClick={() => onChange(undefined)} className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-border px-4 text-sm text-muted-foreground hover:text-foreground">
              <Trash2 className="size-3.5" aria-hidden="true" /> Remove photo
            </button>
          )}
          {hint && <p className="text-xs leading-snug text-muted-foreground">{hint}</p>}
        </div>
      </div>
      {error && <p role="alert" className="flex items-start gap-1.5 text-xs text-red-700"><TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />{error}</p>}
      {warning && !error && <p className="text-xs text-amber-800">{warning}</p>}
    </div>
  );
}
