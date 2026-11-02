import { NextResponse } from "next/server";
import { isAdmin, unauthorized } from "@/lib/require-admin";
import { isImageType, saveImage, StorageError } from "@/lib/store";

const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });
  if (!isImageType(file.type)) return NextResponse.json({ error: "Please upload a JPG, PNG or WebP image." }, { status: 415 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image is too large (max 4 MB)." }, { status: 413 });
  try {
    const url = await saveImage(await file.arrayBuffer(), file.type, form?.get("cutout") === "1");
    return NextResponse.json({ url });
  } catch (error) {
    console.error("[admin] upload failed", error);
    const message = error instanceof StorageError ? error.message : "Upload failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
