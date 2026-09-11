import { SignJWT, jwtVerify } from "jose";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "xctl_session";

let cachedDevSecret = null;

function getSecret() {
  const raw = process.env.AUTH_SECRET;
  if (raw && raw.length >= 32) return new TextEncoder().encode(raw);
  if (raw) {
    console.warn("[session] AUTH_SECRET is shorter than 32 chars - refusing to use it. Generate a longer one.");
  }
  // Dev-only fallback: random per boot, invalidates sessions on restart.
  if (!cachedDevSecret) {
    cachedDevSecret = randomBytes(32).toString("hex");
    console.warn("[session] AUTH_SECRET not set - using an ephemeral dev secret. Sessions reset on restart.");
  }
  return new TextEncoder().encode(cachedDevSecret);
}

export async function createSessionToken(user) {
  const secret = getSecret();
  return new SignJWT({
    username: user.username,
    name: user.name,
    avatarUrl: user.avatarUrl,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.xUserId))
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(token) {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

// Read the signed session for the current request. Server components and
// route handlers only (uses next/headers cookies).
export async function readSession() {
  const store = cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
