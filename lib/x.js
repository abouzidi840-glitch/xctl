// Thin X API v2 client + OAuth2 token lifecycle.
import { randomUUID } from "node:crypto";
import {
  X_TOKEN_URL,
  X_REVOKE_URL,
  getAppUrl,
  getScopes,
} from "@/lib/xoauth";
import { upsertAccount } from "@/lib/store";

const X_API_BASE = "https://api.twitter.com/2";

function basicAuthHeader() {
  const cred = `${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`;
  return `Basic ${Buffer.from(cred).toString("base64")}`;
}

async function tokenRequest(form) {
  const res = await fetch(X_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(form).toString(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error_description || data.error || `token endpoint HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

// Exchange the authorization code for tokens.
export async function exchangeCodeForTokens({ code, codeVerifier }) {
  return tokenRequest({
    grant_type: "authorization_code",
    code,
    redirect_uri: `${getAppUrl()}/api/auth/callback/twitter`,
    client_id: process.env.X_CLIENT_ID,
    code_verifier: codeVerifier,
  });
}

// Fetch the authenticated X user's own profile.
export async function fetchMe(accessToken) {
  const res = await fetch(
    `${X_API_BASE}/users/me?user.fields=profile_image_url,description`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.data) {
    const msg = data.errors?.[0]?.message || data.title || `users/me HTTP ${res.status}`;
    throw new Error(msg);
  }
  const u = data.data;
  return {
    xUserId: String(u.id),
    username: u.username,
    name: u.name || u.username,
    avatarUrl: u.profile_image_url || "",
  };
}

export function normalizeTokens(tokenData, profile) {
  const issuedMs = Date.now();
  const ttl = (tokenData.expires_in || 7200) * 1000;
  return {
    ...profile,
    id: randomUUID(),
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token || "",
    expiresAt: issuedMs + ttl,
    scope: (tokenData.scope || "").split(/\s+/).filter(Boolean),
  };
}

// Persist a freshly authorized account in the store.
export async function saveAuthorizedAccount(tokenData) {
  const profile = await fetchMe(tokenData.access_token);
  const account = normalizeTokens(tokenData, profile);
  return upsertAccount(account);
}

// Refresh an account's tokens using its refresh_token (offline.access).
export async function refreshAccountTokens(account) {
  if (!account.refreshToken) throw new Error("No refresh token available for this account.");
  const data = await tokenRequest({
    grant_type: "refresh_token",
    refresh_token: account.refreshToken,
    client_id: process.env.X_CLIENT_ID,
  });
  const fresh = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || account.refreshToken,
    expiresAt: Date.now() + (data.expires_in || 7200) * 1000,
    scope: (data.scope || account.scope || "").split(/\s+/).filter(Boolean),
  };
  await upsertAccount({ ...account, ...fresh });
  return { ...account, ...fresh };
}

// Return a usable access token for an account, refreshing when needed.
export async function ensureAccessToken(account) {
  if (Date.now() < account.expiresAt - 60_000) return account.accessToken;
  const fresh = await refreshAccountTokens(account);
  return fresh.accessToken;
}

// Revoke an access token on X (best effort) before removing an account.
export async function revokeToken(accessToken) {
  try {
    await fetch(X_REVOKE_URL, {
      method: "POST",
      headers: {
        Authorization: basicAuthHeader(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ token: accessToken, client_id: process.env.X_CLIENT_ID }).toString(),
    });
  } catch {
    // Best effort - local removal proceeds regardless.
  }
}

// POST /2/tweets (requires tweet.write scope + "Read and Write" app level).
export async function createTweet(account, text) {
  const token = await ensureAccessToken(account);
  const res = await fetch(`${X_API_BASE}/tweets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.errors?.[0]?.message || data.title || `tweets HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data.data; // { id, text, edit_history_tweet_ids }
}

export { getScopes };
