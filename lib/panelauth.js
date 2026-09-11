import { SignJWT, jwtVerify } from "jose";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";

// ---------------------------------------------------------------------------
// Panel access: simple operator login (username + password), separate from the
// X OAuth flow. X OAuth is only used to CONNECT accounts; the panel itself is
// unlocked with PANEL_USER / PANEL_PASS (defaults: admin / admin).
// ---------------------------------------------------------------------------

export const PANEL_COOKIE = "panel_session";
export const PANEL_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

let cachedDevSecret = null;

function getSecret() {
  const raw = process.env.AUTH_SECRET;
  if (raw && raw.length >= 32) return new TextEncoder().encode(raw);
  // Dev-only fallback: random per boot, invalidates sessions on restart.
  if (!cachedDevSecret) {
    cachedDevSecret = randomBytes(32).toString("hex");
    console.warn("[panelauth] AUTH_SECRET missing/short - using an ephemeral dev secret.");
  }
  return new TextEncoder().encode(cachedDevSecret);
}

// Credentials for the control panel. Defaults to admin/admin so the panel
// works out of the box; set PANEL_USER / PANEL_PASS in Vercel to override.
export function panelCredentials() {
  return {
    username: process.env.PANEL_USER || "admin",
    password: process.env.PANEL_PASS || "admin",
  };
}

export async function createPanelToken(username) {
  const secret = getSecret();
  return new SignJWT({ u: username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("panel")
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyPanelToken(token) {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

// Read the signed panel session for the current request. Server components and
// route handlers only (uses next/headers cookies).
export async function readPanelSession() {
  const store = cookies();
  const token = store.get(PANEL_COOKIE)?.value;
  if (!token) return null;
  return verifyPanelToken(token);
}
