import { NextResponse } from "next/server";
import { isAdmin, unauthorized } from "@/lib/require-admin";
import { getContentFresh, saveContent, storageMode, StorageError } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  return NextResponse.json({ content: await getContentFresh(), storage: storageMode() });
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid data." }, { status: 400 });
  try {
    return NextResponse.json({ content: await saveContent(body) });
  } catch (error) {
    console.error("[admin] save failed", error);
    const message = error instanceof StorageError ? error.message : "Could not save. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
