/** Tiny password + signed-cookie auth for the admin panel. Works in middleware (edge) and route handlers. */

export const SESSION_COOKIE = "mh_admin";
export const SESSION_DAYS = 7;
const DEV_PASSWORD = "admin123";
const enc = new TextEncoder();

const isProd = () => process.env.NODE_ENV === "production";

/** The admin password, or null when login is disabled (production without ADMIN_PASSWORD). */
export function adminPassword(): string | null {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  return isProd() ? null : DEV_PASSWORD;
}

function secret() {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || (isProd() ? "" : "dev-only-secret");
}

async function hmac(data: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

function sameString(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function passwordMatches(input: string) {
  const password = adminPassword();
  if (!password || !secret()) return false;
  return sameString(await hmac(`pw:${input}`), await hmac(`pw:${password}`));
}

export async function createSession() {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  return `${expires}.${await hmac(`session:${expires}`)}`;
}

export async function verifySession(token: string | undefined | null) {
  if (!token || !secret()) return false;
  const [expires, sig] = token.split(".");
  if (!expires || !sig || !/^\d+$/.test(expires) || Number(expires) < Date.now()) return false;
  return sameString(await hmac(`session:${expires}`), sig);
}
