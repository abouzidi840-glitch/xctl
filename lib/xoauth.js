import { createHash, randomBytes } from "node:crypto";

// ---- Endpoints -----------------------------------------------------------
export const X_AUTHORIZE_URL = "https://x.com/i/oauth2/authorize";
export const X_TOKEN_URL = "https://api.twitter.com/2/oauth2/token";
export const X_REVOKE_URL = "https://api.twitter.com/2/oauth2/revoke";

// Scopes mirror what a multi-account control surface needs. Requesting
// dm.* / media.write requires the X app to have the "Read, Write, and
// Direct Messages" permission level (see README).
export const DEFAULT_SCOPES = [
  "tweet.read",
  "tweet.write",
  "users.read",
  "follows.read",
  "follows.write",
  "like.read",
  "like.write",
  "list.read",
  "list.write",
  "block.read",
  "block.write",
  "mute.read",
  "mute.write",
  "bookmark.read",
  "bookmark.write",
  "dm.read",
  "dm.write",
  "media.write",
  "offline.access",
];

export function getScopes() {
  if (process.env.X_SCOPES) return process.env.X_SCOPES.trim().split(/\s+/);
  return DEFAULT_SCOPES;
}

// Canonical public URL of this deployment. The redirect_uri passed to X
// MUST byte-for-byte equal the callback URL registered in the dev portal.
export function getAppUrl() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/+$/, "");
  return "http://localhost:3000";
}

export function getRedirectUri() {
  return `${getAppUrl()}/api/auth/callback/twitter`;
}

// ---- PKCE / state helpers ------------------------------------------------
export function base64UrlEncode(buf) {
  return Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function randomToken(bytes = 32) {
  return base64UrlEncode(randomBytes(bytes));
}

export function sha256Base64Url(input) {
  return base64UrlEncode(createHash("sha256").update(input).digest());
}

export function createPkcePair() {
  const verifier = randomToken(48); // 64+ chars -> valid code_verifier
  const challenge = sha256Base64Url(verifier);
  return { verifier, challenge };
}

export function buildAuthorizeUrl({ state, challenge, scope }) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.X_CLIENT_ID,
    redirect_uri: getRedirectUri(),
    scope,
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });
  return `${X_AUTHORIZE_URL}?${params.toString()}`;
}
