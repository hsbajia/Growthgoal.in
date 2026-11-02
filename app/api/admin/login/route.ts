import { NextResponse } from "next/server";
import { adminPassword, createSession, passwordMatches, SESSION_COOKIE, SESSION_DAYS } from "@/lib/auth";

export async function POST(request: Request) {
  if (!adminPassword()) {
    return NextResponse.json({ error: "Admin login is turned off. Set ADMIN_PASSWORD in the hosting settings." }, { status: 503 });
  }
  const body = (await request.json().catch(() => ({}))) as { password?: unknown };
  const password = typeof body.password === "string" ? body.password : "";
  if (!(await passwordMatches(password))) {
    await new Promise((r) => setTimeout(r, 700));
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, await createSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return response;
}
