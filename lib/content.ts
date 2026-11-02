import { MOORTI_KINDS, type MarbleTone, type MoortiKind } from "@/components/ui/moorti-art";
import { CATEGORIES, HERO_MOORTIS, type Category, type Moorti } from "@/data/moortis";
import { SITE } from "@/data/site";

export type { Category, Moorti };

export interface SiteInfo {
  name: string;
  short: string;
  tagline: string;
  taglineHi: string;
  description: string;
  /** Digits only with country code, e.g. 919876543210. */
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  instagram: string;
  /** Photo for the dark "Our belief" section. */
  signatureImage?: string;
  /** Photo revealed in "The craft" section. */
  craftImage?: string;
}

export interface SiteContent {
  site: SiteInfo;
  moortis: Moorti[];
  categories: Category[];
  updatedAt?: string;
}

export const DEFAULT_CONTENT: SiteContent = { site: SITE, moortis: HERO_MOORTIS, categories: CATEGORIES };

export const MARBLE_TONES: MarbleTone[] = ["white", "ivory", "black", "green", "pink"];

export function whatsappLink(number: string, message: string) {
  const text = encodeURIComponent(message);
  const digits = number.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}?text=${text}` : `https://wa.me/?text=${text}`;
}

/** Uploaded cut-outs (background removed) are saved with "-cut" in the file name. */
export function isCutout(url?: string) {
  return !!url && /-cut\.(webp|png)(\?|$)/.test(url);
}

export function telLink(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
}

/* ---------- validation ---------- */

const IMAGE_URL = /^(\/api\/media\/[A-Za-z0-9._-]+|https:\/\/[^\s"'()<>\\]+)$/;
const COLOR = /^#[0-9a-fA-F]{6}$/;

function str(value: unknown, max = 200, fallback = ""): string {
  return typeof value === "string" ? value.trim().slice(0, max) : fallback;
}
function opt(value: unknown, max = 200): string | undefined {
  const s = str(value, max);
  return s || undefined;
}
function image(value: unknown): string | undefined {
  const s = str(value, 600);
  return IMAGE_URL.test(s) ? s : undefined;
}
function kind(value: unknown): MoortiKind {
  return MOORTI_KINDS.includes(value as MoortiKind) ? (value as MoortiKind) : "ganesha";
}
function tone(value: unknown): MarbleTone {
  return MARBLE_TONES.includes(value as MarbleTone) ? (value as MarbleTone) : "white";
}
function color(value: unknown): string | undefined {
  const s = str(value, 7);
  return COLOR.test(s) ? s : undefined;
}
function slug(value: unknown, fallback: string, used: Set<string>) {
  let id = str(value, 60).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || fallback;
  while (used.has(id)) id = `${id}-x`;
  used.add(id);
  return id;
}
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});

export function normalizeContent(input: unknown): SiteContent {
  const raw = obj(input);
  const s = obj(raw.site);
  const d = DEFAULT_CONTENT.site;
  const site: SiteInfo = {
    name: str(s.name, 80) || d.name,
    short: str(s.short, 40) || d.short,
    tagline: str(s.tagline, 120, d.tagline),
    taglineHi: str(s.taglineHi, 120, d.taglineHi),
    description: str(s.description, 400, d.description),
    whatsapp: str(s.whatsapp, 20).replace(/\D/g, ""),
    phone: str(s.phone, 40, d.phone),
    email: str(s.email, 120, d.email),
    address: str(s.address, 300, d.address),
    hours: str(s.hours, 120, d.hours),
    instagram: str(s.instagram, 300, d.instagram) || "#",
    signatureImage: image(s.signatureImage),
    craftImage: image(s.craftImage),
  };

  const usedM = new Set<string>();
  const moortis: Moorti[] = (Array.isArray(raw.moortis) ? raw.moortis : DEFAULT_CONTENT.moortis).slice(0, 30).map((item, i) => {
    const m = obj(item);
    return {
      id: slug(m.id ?? m.name, `moorti-${i + 1}`, usedM),
      name: str(m.name, 80) || "Untitled moorti",
      nameHi: opt(m.nameHi, 80),
      description: opt(m.description, 400),
      kind: kind(m.kind),
      tone: tone(m.tone),
      accent: color(m.accent),
      image: image(m.image),
      backImage: image(m.backImage),
      tag: opt(m.tag, 16),
      details: (Array.isArray(m.details) ? m.details : []).map((x) => str(x, 40)).filter(Boolean).slice(0, 8),
      price: opt(m.price, 60),
    };
  });

  const usedC = new Set<string>();
  const categories: Category[] = (Array.isArray(raw.categories) ? raw.categories : DEFAULT_CONTENT.categories).slice(0, 12).map((item, i) => {
    const c = obj(item);
    return {
      id: slug(c.id ?? c.name, `collection-${i + 1}`, usedC),
      name: str(c.name, 60) || "Untitled",
      nameHi: str(c.nameHi, 60),
      line: str(c.line, 120),
      kind: kind(c.kind),
      tone: tone(c.tone),
      accent: color(c.accent),
      image: image(c.image),
    };
  });

  return { site, moortis, categories, updatedAt: opt(raw.updatedAt, 40) };
}
