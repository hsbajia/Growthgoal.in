/**
 * Runs in the browser before upload:
 * - shrinks big photos,
 * - for cut-outs (transparent background) trims the empty space and places the moorti
 *   on a 4:5 canvas with its base on the bottom edge, so every piece sits on the shelf the same way.
 */

const OUT_W = 1000;
const OUT_H = 1250;
const MAX_SIDE = 1600;

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function toBlob(c: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob | null>((resolve) => c.toBlob(resolve, type, quality));
}

export interface PreparedImage {
  blob: Blob;
  transparent: boolean;
  width: number;
  height: number;
}

export async function prepareImage(file: File): Promise<PreparedImage> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("This photo format isn't supported. Please use JPG, PNG or WebP.");
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const src = canvas(w, h);
  const ctx = src.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Your browser could not process this image.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const pixels = ctx.getImageData(0, 0, w, h).data;
  const alphaAt = (x: number, y: number) => pixels[(y * w + x) * 4 + 3] ?? 255;
  const corners = [alphaAt(0, 0), alphaAt(w - 1, 0), alphaAt(0, h - 1), alphaAt(w - 1, h - 1)];
  const transparent = corners.filter((a) => a < 20).length >= 3;

  let out = src;
  if (transparent) {
    let minX = w, minY = h, maxX = -1, maxY = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (alphaAt(x, y) > 16) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX >= minX && maxY >= minY) {
      const bw = maxX - minX + 1;
      const bh = maxY - minY + 1;
      const fit = Math.min((OUT_W * 0.94) / bw, (OUT_H * 0.97) / bh);
      const dw = Math.round(bw * fit);
      const dh = Math.round(bh * fit);
      out = canvas(OUT_W, OUT_H);
      const octx = out.getContext("2d");
      if (!octx) throw new Error("Your browser could not process this image.");
      octx.imageSmoothingQuality = "high";
      octx.drawImage(src, minX, minY, bw, bh, Math.round((OUT_W - dw) / 2), OUT_H - dh, dw, dh);
    }
  }

  let blob = await toBlob(out, "image/webp", 0.9);
  if (!blob || blob.type !== "image/webp") blob = await toBlob(out, transparent ? "image/png" : "image/jpeg", 0.9);
  if (!blob) throw new Error("Your browser could not process this image.");
  return { blob, transparent, width: out.width, height: out.height };
}
