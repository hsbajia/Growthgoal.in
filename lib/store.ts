import { promises as fs } from "node:fs";
import path from "node:path";
import { del, list, put } from "@vercel/blob";
import { revalidateTag, unstable_cache } from "next/cache";
import { DEFAULT_CONTENT, normalizeContent, type SiteContent } from "@/lib/content";

/**
 * Where admin changes are stored:
 * - Vercel Blob, when BLOB_READ_WRITE_TOKEN is set (needed on Vercel — its disk is read-only).
 * - Otherwise a local folder (.content/ by default, or CONTENT_DIR) — works on your computer or any normal server.
 */
export type StorageMode = "blob" | "local" | "readonly";

const DATA_DIR = process.env.CONTENT_DIR || path.join(process.cwd(), ".content");
const CONTENT_FILE = path.join(DATA_DIR, "site-content.json");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const CONTENT_PREFIX = "content/site-content-";
const MEDIA_NAME = /^[a-z0-9-]+\.(webp|png|jpg)$/;

export function storageMode(): StorageMode {
  if (process.env.BLOB_READ_WRITE_TOKEN) return "blob";
  if (process.env.VERCEL) return "readonly";
  return "local";
}

async function readContent(): Promise<SiteContent> {
  try {
    if (storageMode() === "blob") {
      const { blobs } = await list({ prefix: CONTENT_PREFIX });
      const latest = blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))[0];
      if (!latest) return DEFAULT_CONTENT;
      const res = await fetch(latest.url, { cache: "no-store" });
      return normalizeContent(await res.json());
    }
    return normalizeContent(JSON.parse(await fs.readFile(CONTENT_FILE, "utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code !== "ENOENT") console.error("[store] could not read content, using defaults", error);
    return DEFAULT_CONTENT;
  }
}

/** Cached for the public site; refreshed whenever the admin saves. */
export const getContent = unstable_cache(readContent, ["site-content"], { tags: ["site-content"] });

/** Always fresh — for the admin panel. */
export const getContentFresh = readContent;

export class StorageError extends Error {}

export async function saveContent(input: unknown): Promise<SiteContent> {
  const content = normalizeContent({ ...(input as object), updatedAt: new Date().toISOString() });
  const mode = storageMode();
  if (mode === "readonly") throw new StorageError("Storage is not connected. On Vercel, add a Blob store to this project (Storage → Blob) and redeploy.");
  if (mode === "blob") {
    await put(`${CONTENT_PREFIX}${Date.now()}.json`, JSON.stringify(content), { access: "public", contentType: "application/json", addRandomSuffix: false });
    const { blobs } = await list({ prefix: CONTENT_PREFIX });
    const old = blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt)).slice(5);
    if (old.length) await del(old.map((b) => b.url));
  } else {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${CONTENT_FILE}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(content, null, 2), "utf8");
    await fs.rename(tmp, CONTENT_FILE);
  }
  revalidateTag("site-content");
  return content;
}

const TYPES = { "image/webp": "webp", "image/png": "png", "image/jpeg": "jpg" } as const;
export type ImageType = keyof typeof TYPES;
export const isImageType = (type: string): type is ImageType => type in TYPES;

export async function saveImage(data: ArrayBuffer, type: ImageType, cutout = false): Promise<string> {
  const name = `${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}${cutout && type !== "image/jpeg" ? "-cut" : ""}.${TYPES[type]}`;
  const mode = storageMode();
  if (mode === "readonly") throw new StorageError("Storage is not connected. On Vercel, add a Blob store to this project (Storage → Blob) and redeploy.");
  if (mode === "blob") {
    const blob = await put(`media/${name}`, Buffer.from(data), { access: "public", contentType: type, addRandomSuffix: false });
    return blob.url;
  }
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(data));
  return `/api/media/${name}`;
}

export async function readLocalImage(name: string) {
  if (!MEDIA_NAME.test(name)) return null;
  try {
    const data = await fs.readFile(path.join(UPLOAD_DIR, name));
    const ext = name.split(".").pop();
    return { data, type: ext === "png" ? "image/png" : ext === "jpg" ? "image/jpeg" : "image/webp" };
  } catch {
    return null;
  }
}
