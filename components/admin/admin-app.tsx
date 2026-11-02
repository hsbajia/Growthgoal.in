"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, Check, ExternalLink, Loader2, LogOut, Pencil, Plus, Trash2, TriangleAlert, X } from "lucide-react";
import { ImageField } from "@/components/admin/image-field";
import { LotusMark } from "@/components/site/logo";
import { MarbleDefs, MoortiArt, MOORTI_KINDS, type MarbleTone, type MoortiKind } from "@/components/ui/moorti-art";
import { MARBLE_TONES, type Category, type Moorti, type SiteContent, type SiteInfo } from "@/lib/content";
import type { StorageMode } from "@/lib/store";

type Tab = "moortis" | "collection" | "site";
type Editing = { type: "moorti" | "category"; index: number } | null;

const KIND_LABELS: Record<MoortiKind, string> = { ganesha: "Ganesha", buddha: "Buddha", shivling: "Shivling", nandi: "Nandi", haathi: "Haathi (elephant)", mandir: "Mandir" };
const PHOTO_HINT = "Best: background removed (PNG), moorti standing straight. We auto-trim and place it on the shelf.";

const input = "h-11 w-full rounded-xl border border-border bg-background px-3.5 text-base outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/25 sm:text-sm";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      {children}
      {hint && <span className="text-xs font-normal leading-snug text-muted-foreground">{hint}</span>}
    </label>
  );
}

function Text({ label, hint, value, onChange, placeholder, multiline, maxLength }: { label: string; hint?: string; value?: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean; maxLength?: number }) {
  return (
    <Field label={label} hint={hint}>
      {multiline
        ? <textarea rows={3} value={value ?? ""} maxLength={maxLength} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={`${input} h-auto resize-y py-2.5`} />
        : <input value={value ?? ""} maxLength={maxLength} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={input} />}
    </Field>
  );
}

function ListInput({ label, hint, value, onChange }: { label: string; hint?: string; value: string[]; onChange: (v: string[]) => void }) {
  const [raw, setRaw] = React.useState(value.join(", "));
  return (
    <Field label={label} hint={hint}>
      <input value={raw} onChange={(e) => { setRaw(e.target.value); onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean)); }} className={input} />
    </Field>
  );
}

function DrawingSettings({ kind, tone, accent, onChange }: { kind?: MoortiKind; tone?: MarbleTone; accent?: string; onChange: (patch: { kind?: MoortiKind; tone?: MarbleTone; accent?: string }) => void }) {
  return (
    <details className="group rounded-2xl border border-border bg-background/60 p-4">
      <summary className="cursor-pointer list-none text-sm font-medium">
        Placeholder drawing <span className="font-normal text-muted-foreground">— only shown when there is no photo</span>
      </summary>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Field label="Shape">
          <select value={kind ?? "ganesha"} onChange={(e) => onChange({ kind: e.target.value as MoortiKind })} className={input}>
            {MOORTI_KINDS.map((k) => <option key={k} value={k}>{KIND_LABELS[k]}</option>)}
          </select>
        </Field>
        <Field label="Marble">
          <select value={tone ?? "white"} onChange={(e) => onChange({ tone: e.target.value as MarbleTone })} className={`${input} capitalize`}>
            {MARBLE_TONES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Cloth colour">
          <div className="flex items-center gap-2">
            <input type="color" value={accent ?? "#c8502e"} onChange={(e) => onChange({ accent: e.target.value })} className="h-11 w-14 cursor-pointer rounded-xl border border-border bg-background p-1" aria-label="Cloth colour" />
            <button type="button" onClick={() => onChange({ accent: undefined })} className="h-11 rounded-xl border border-border px-3 text-xs text-muted-foreground hover:text-foreground">{accent ? "Remove" : "None"}</button>
          </div>
        </Field>
      </div>
    </details>
  );
}

function Preview({ image, kind, tone, accent }: { image?: string; kind?: MoortiKind; tone?: MarbleTone; accent?: string }) {
  return image
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={image} alt="" className="absolute inset-0 size-full object-contain object-bottom" />
    : <MoortiArt uid="adm" kind={kind ?? "ganesha"} tone={tone} accent={accent} />;
}

function move<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
}

export function AdminApp({ initial, storage }: { initial: SiteContent; storage: StorageMode }) {
  const [content, setContent] = React.useState(initial);
  const [saved, setSaved] = React.useState(() => JSON.stringify(initial));
  const [tab, setTab] = React.useState<Tab>("moortis");
  const [editing, setEditing] = React.useState<Editing>(null);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const dirty = JSON.stringify(content) !== saved;

  const save = React.useCallback(async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(content) });
      const data = (await res.json().catch(() => ({}))) as { content?: SiteContent; error?: string };
      if (res.status === 401) { window.location.href = "/admin/login"; return; }
      if (!res.ok || !data.content) throw new Error(data.error || "Could not save.");
      setContent(data.content);
      setSaved(JSON.stringify(data.content));
      setMessage({ kind: "ok", text: "Saved — the website is updated." });
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof Error ? e.message : "Could not save." });
    } finally {
      setSaving(false);
    }
  }, [content]);

  React.useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); };
    const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") { e.preventDefault(); if (dirty && !saving) void save(); } };
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("beforeunload", onBeforeUnload); window.removeEventListener("keydown", onKey); };
  }, [dirty, saving, save]);

  React.useEffect(() => {
    if (message?.kind !== "ok") return;
    const t = window.setTimeout(() => setMessage(null), 3500);
    return () => window.clearTimeout(t);
  }, [message]);

  const setMoorti = (index: number, patch: Partial<Moorti>) => setContent((c) => ({ ...c, moortis: c.moortis.map((m, i) => (i === index ? { ...m, ...patch } : m)) }));
  const setCategory = (index: number, patch: Partial<Category>) => setContent((c) => ({ ...c, categories: c.categories.map((m, i) => (i === index ? { ...m, ...patch } : m)) }));
  const setSite = (patch: Partial<SiteInfo>) => setContent((c) => ({ ...c, site: { ...c.site, ...patch } }));

  const addMoorti = () => {
    setContent((c) => ({ ...c, moortis: [...c.moortis, { id: `moorti-${Date.now().toString(36)}`, name: "New moorti", kind: "ganesha", tone: "white", details: [], price: "Price on request" }] }));
    setEditing({ type: "moorti", index: content.moortis.length });
  };
  const addCategory = () => {
    setContent((c) => ({ ...c, categories: [...c.categories, { id: `collection-${Date.now().toString(36)}`, name: "New collection", nameHi: "", line: "", kind: "ganesha", tone: "white" }] }));
    setEditing({ type: "category", index: content.categories.length });
  };

  const logout = async () => {
    if (dirty && !window.confirm("You have unsaved changes. Log out anyway?")) return;
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  const tabs: { id: Tab; label: string; short: string; count?: number }[] = [
    { id: "moortis", label: "Hero moortis", short: "Moortis", count: content.moortis.length },
    { id: "collection", label: "Collection", short: "Collection", count: content.categories.length },
    { id: "site", label: "Site details", short: "Site" },
  ];

  const editedMoorti = editing?.type === "moorti" ? content.moortis[editing.index] : undefined;
  const editedCategory = editing?.type === "category" ? content.categories[editing.index] : undefined;

  return (
    <div className="pb-32">
      <MarbleDefs uid="adm" />
      <header className="sticky top-0 z-30 border-b border-border bg-[#F4EFE7]/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <LotusMark className="h-6 w-8 text-gold" />
            <div className="leading-tight">
              <p className="font-display text-lg font-semibold">{content.site.short} Admin</p>
              <p className="text-[11px] text-muted-foreground">{storage === "blob" ? "Saved to cloud storage" : storage === "local" ? "Saved on this server" : "Saving is off"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-sm"><ExternalLink className="size-3.5" aria-hidden="true" /><span className="hidden sm:inline">View site</span></a>
            <button type="button" onClick={logout} aria-label="Log out" className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-sm sm:px-4"><LogOut className="size-3.5" aria-hidden="true" /><span className="hidden sm:inline">Log out</span></button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        {storage === "readonly" && (
          <div role="alert" className="mb-6 flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>Saving is turned off on this hosting. In Vercel, open this project → <b>Storage</b> → create a <b>Blob</b> store and connect it, then redeploy. After that, photos and changes will save.</p>
          </div>
        )}

        <div role="tablist" aria-label="Sections" className="flex gap-1 overflow-x-auto rounded-full border border-border bg-card p-1 [scrollbar-width:none]">
          {tabs.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} type="button" onClick={() => setTab(t.id)} className={`flex h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 text-sm sm:px-4 font-medium transition-colors ${tab === t.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
              <span className="sm:hidden">{t.short}</span><span className="hidden sm:inline">{t.label}</span>
              {t.count !== undefined && <span className={`rounded-full px-1.5 text-[11px] ${tab === t.id ? "bg-background/20" : "bg-muted"}`}>{t.count}</span>}
            </button>
          ))}
        </div>

        {tab === "moortis" && (
          <section className="mt-6">
            <p className="text-sm text-muted-foreground">These stand on the shelf at the top of the home page, left to right in this order. Tap <b>Edit</b> to change the photo, name or details.</p>
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {content.moortis.map((m, i) => (
                <li key={m.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
                  <button type="button" onClick={() => setEditing({ type: "moorti", index: i })} className="relative aspect-[4/5] bg-[#EFE9DF]" aria-label={`Edit ${m.name}`}>
                    <div className="absolute inset-[10%]"><Preview image={m.image} kind={m.kind} tone={m.tone} accent={m.accent} /></div>
                    <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${m.image ? "bg-emerald-600 text-white" : "bg-amber-100 text-amber-900"}`}>{m.image ? "Photo" : "Drawing"}</span>
                    <span className="absolute right-2 top-2 rounded-full bg-background/80 px-2 py-0.5 font-mono text-[10px]">{i + 1}</span>
                  </button>
                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <div className="min-w-0">
                      <p className="truncate font-display text-lg font-medium leading-tight">{m.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{[m.tag, m.price].filter(Boolean).join(" · ") || "—"}</p>
                    </div>
                    <div className="mt-auto flex items-center gap-1">
                      <button type="button" aria-label="Move left" disabled={i === 0} onClick={() => setContent((c) => ({ ...c, moortis: move(c.moortis, i, i - 1) }))} className="inline-flex size-9 items-center justify-center rounded-full border border-border disabled:opacity-30"><ArrowUp className="size-3.5 -rotate-90" aria-hidden="true" /></button>
                      <button type="button" aria-label="Move right" disabled={i === content.moortis.length - 1} onClick={() => setContent((c) => ({ ...c, moortis: move(c.moortis, i, i + 1) }))} className="inline-flex size-9 items-center justify-center rounded-full border border-border disabled:opacity-30"><ArrowDown className="size-3.5 -rotate-90" aria-hidden="true" /></button>
                      <button type="button" onClick={() => setEditing({ type: "moorti", index: i })} className="ml-auto inline-flex h-9 items-center gap-1 rounded-full bg-foreground px-3 text-xs font-medium text-background"><Pencil className="size-3" aria-hidden="true" /> Edit</button>
                      <button type="button" aria-label={`Delete ${m.name}`} onClick={() => { if (window.confirm(`Remove "${m.name}" from the shelf?`)) setContent((c) => ({ ...c, moortis: c.moortis.filter((_, j) => j !== i) })); }} className="inline-flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-red-700"><Trash2 className="size-3.5" aria-hidden="true" /></button>
                    </div>
                  </div>
                </li>
              ))}
              <li>
                <button type="button" onClick={addMoorti} disabled={content.moortis.length >= 30} className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:border-gold hover:text-foreground">
                  <Plus className="size-6" aria-hidden="true" /> Add moorti
                </button>
              </li>
            </ul>
          </section>
        )}

        {tab === "collection" && (
          <section className="mt-6">
            <p className="text-sm text-muted-foreground">The cards in “The collection” section. Each card opens a WhatsApp enquiry for that collection.</p>
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {content.categories.map((c, i) => (
                <li key={c.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
                  <button type="button" onClick={() => setEditing({ type: "category", index: i })} className="relative aspect-[4/5] bg-[#EFE9DF]" aria-label={`Edit ${c.name}`}>
                    <div className="absolute inset-[10%]"><Preview image={c.image} kind={c.kind} tone={c.tone} accent={c.accent} /></div>
                    <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${c.image ? "bg-emerald-600 text-white" : "bg-amber-100 text-amber-900"}`}>{c.image ? "Photo" : "Drawing"}</span>
                  </button>
                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <p className="truncate font-display text-lg font-medium leading-tight">{c.name}</p>
                    <div className="mt-auto flex items-center gap-1">
                      <button type="button" aria-label="Move left" disabled={i === 0} onClick={() => setContent((s) => ({ ...s, categories: move(s.categories, i, i - 1) }))} className="inline-flex size-9 items-center justify-center rounded-full border border-border disabled:opacity-30"><ArrowUp className="size-3.5 -rotate-90" aria-hidden="true" /></button>
                      <button type="button" aria-label="Move right" disabled={i === content.categories.length - 1} onClick={() => setContent((s) => ({ ...s, categories: move(s.categories, i, i + 1) }))} className="inline-flex size-9 items-center justify-center rounded-full border border-border disabled:opacity-30"><ArrowDown className="size-3.5 -rotate-90" aria-hidden="true" /></button>
                      <button type="button" onClick={() => setEditing({ type: "category", index: i })} className="ml-auto inline-flex h-9 items-center gap-1 rounded-full bg-foreground px-3 text-xs font-medium text-background"><Pencil className="size-3" aria-hidden="true" /> Edit</button>
                      <button type="button" aria-label={`Delete ${c.name}`} onClick={() => { if (window.confirm(`Remove the "${c.name}" card?`)) setContent((s) => ({ ...s, categories: s.categories.filter((_, j) => j !== i) })); }} className="inline-flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-red-700"><Trash2 className="size-3.5" aria-hidden="true" /></button>
                    </div>
                  </div>
                </li>
              ))}
              <li>
                <button type="button" onClick={addCategory} disabled={content.categories.length >= 12} className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:border-gold hover:text-foreground">
                  <Plus className="size-6" aria-hidden="true" /> Add collection
                </button>
              </li>
            </ul>
          </section>
        )}

        {tab === "site" && (
          <section className="mt-6 grid gap-5 lg:grid-cols-2">
            <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 sm:p-6">
              <h2 className="font-display text-2xl font-medium">Contact</h2>
              <Text label="WhatsApp number" hint="With country code, numbers only — e.g. 919876543210. All enquiry buttons open this chat." value={content.site.whatsapp} onChange={(v) => setSite({ whatsapp: v.replace(/\D/g, "") })} placeholder="919876543210" maxLength={20} />
              <Text label="Phone (shown on site)" value={content.site.phone} onChange={(v) => setSite({ phone: v })} placeholder="+91 98765 43210" />
              <Text label="Email" value={content.site.email} onChange={(v) => setSite({ email: v })} />
              <Text label="Workshop address" value={content.site.address} onChange={(v) => setSite({ address: v })} multiline />
              <Text label="Opening hours" value={content.site.hours} onChange={(v) => setSite({ hours: v })} />
              <Text label="Instagram link" value={content.site.instagram} onChange={(v) => setSite({ instagram: v })} placeholder="https://instagram.com/…" />
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 sm:p-6">
                <h2 className="font-display text-2xl font-medium">Brand</h2>
                <Text label="Business name" value={content.site.name} onChange={(v) => setSite({ name: v })} />
                <Text label="Short name (logo)" value={content.site.short} onChange={(v) => setSite({ short: v })} />
                <Text label="Tagline" value={content.site.tagline} onChange={(v) => setSite({ tagline: v })} />
                <Text label="Hindi tagline" value={content.site.taglineHi} onChange={(v) => setSite({ taglineHi: v })} />
                <Text label="Short description (Google + footer)" value={content.site.description} onChange={(v) => setSite({ description: v })} multiline maxLength={400} />
              </div>
              <div className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-5 sm:p-6">
                <h2 className="font-display text-2xl font-medium">Section photos</h2>
                <ImageField label="“Our belief” section (dark)" hint={PHOTO_HINT} value={content.site.signatureImage} onChange={(url) => setSite({ signatureImage: url })} fallback={<MoortiArt uid="adm" kind="mandir" tone="white" />} />
                <ImageField label="“The craft” section" hint="This photo is revealed from a marble block as people scroll." value={content.site.craftImage} onChange={(url) => setSite({ craftImage: url })} fallback={<MoortiArt uid="adm" kind="ganesha" tone="white" accent="#C8502E" />} />
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Editor sheet */}
      {(editedMoorti || editedCategory) && (
        <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true" aria-label="Edit">
          <div className="absolute inset-0 bg-stone/40 backdrop-blur-sm" onClick={() => setEditing(null)} aria-hidden="true" />
          <div className="relative flex h-full w-full max-w-xl flex-col bg-card shadow-2xl animate-in slide-in-from-right-8 fade-in [animation-duration:250ms]">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-2xl font-medium">{editedMoorti ? "Edit moorti" : "Edit collection"}</h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="inline-flex size-10 items-center justify-center rounded-full border border-border"><X className="size-4" aria-hidden="true" /></button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
              {editedMoorti && editing && (
                <div key={editedMoorti.id} className="flex flex-col gap-5">
                  <ImageField label="Front photo" hint={PHOTO_HINT} value={editedMoorti.image} onChange={(url) => setMoorti(editing.index, { image: url })} fallback={<Preview kind={editedMoorti.kind} tone={editedMoorti.tone} accent={editedMoorti.accent} />} />
                  <ImageField label="Back photo (optional)" hint="Shown when a visitor turns the moorti around. Use the same distance and angle as the front photo." value={editedMoorti.backImage} onChange={(url) => setMoorti(editing.index, { backImage: url })} fallback={<Preview kind={editedMoorti.kind} tone={editedMoorti.tone} accent={editedMoorti.accent} />} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Text label="Name" value={editedMoorti.name} onChange={(v) => setMoorti(editing.index, { name: v })} maxLength={80} />
                    <Text label="Hindi name" value={editedMoorti.nameHi} onChange={(v) => setMoorti(editing.index, { nameHi: v })} maxLength={80} />
                    <Text label="Size tag (on shelf)" hint={'e.g. 12"'} value={editedMoorti.tag} onChange={(v) => setMoorti(editing.index, { tag: v })} maxLength={16} />
                    <Text label="Price" hint="e.g. ₹12,500 or Price on request" value={editedMoorti.price} onChange={(v) => setMoorti(editing.index, { price: v })} maxLength={60} />
                  </div>
                  <Text label="Description" value={editedMoorti.description} onChange={(v) => setMoorti(editing.index, { description: v })} multiline maxLength={400} />
                  <ListInput label="Details" hint="Separate with commas — e.g. White marble, Gold leaf, 12 inch" value={editedMoorti.details ?? []} onChange={(v) => setMoorti(editing.index, { details: v })} />
                  {!editedMoorti.image && <DrawingSettings kind={editedMoorti.kind} tone={editedMoorti.tone} accent={editedMoorti.accent} onChange={(p) => setMoorti(editing.index, p)} />}
                </div>
              )}
              {editedCategory && editing && (
                <div key={editedCategory.id} className="flex flex-col gap-5">
                  <ImageField label="Photo" hint={PHOTO_HINT} value={editedCategory.image} onChange={(url) => setCategory(editing.index, { image: url })} fallback={<Preview kind={editedCategory.kind} tone={editedCategory.tone} accent={editedCategory.accent} />} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Text label="Name" value={editedCategory.name} onChange={(v) => setCategory(editing.index, { name: v })} maxLength={60} />
                    <Text label="Hindi name" value={editedCategory.nameHi} onChange={(v) => setCategory(editing.index, { nameHi: v })} maxLength={60} />
                  </div>
                  <Text label="Short line" value={editedCategory.line} onChange={(v) => setCategory(editing.index, { line: v })} maxLength={120} />
                  {!editedCategory.image && <DrawingSettings kind={editedCategory.kind} tone={editedCategory.tone} accent={editedCategory.accent} onChange={(p) => setCategory(editing.index, p)} />}
                </div>
              )}
            </div>
            <div className="border-t border-border px-5 py-4" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}>
              <button type="button" onClick={() => setEditing(null)} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-sm font-medium text-background"><Check className="size-4" aria-hidden="true" /> Done</button>
              <p className="mt-2 text-center text-xs text-muted-foreground">Remember to press <b>Save changes</b> to publish.</p>
            </div>
          </div>
        </div>
      )}

      {/* Save bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[calc(env(safe-area-inset-bottom)+14px)]">
        <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-full border border-border bg-card/95 p-2 pl-5 shadow-[0_20px_40px_-15px_rgba(23,19,16,0.4)] backdrop-blur">
          <p aria-live="polite" className={`min-w-0 flex-1 truncate text-sm ${message?.kind === "error" ? "text-red-700" : "text-muted-foreground"}`}>
            {message ? message.text : dirty ? "You have unsaved changes" : "Everything is saved"}
          </p>
          <button type="button" onClick={save} disabled={!dirty || saving || storage === "readonly"} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity disabled:opacity-40">
            {saving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Check className="size-4" aria-hidden="true" />} Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
