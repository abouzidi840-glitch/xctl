import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildAuthorizeUrl, createPkcePair, randomToken, getScopes } from "@/lib/xoauth";

export const dynamic = "force-dynamic";

// GET /devs -> kick off the X OAuth2 PKCE dance.
export async function GET() {
  if (!process.env.X_CLIENT_ID || !process.env.X_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "X OAuth is not configured. Set X_CLIENT_ID / X_CLIENT_SECRET / APP_URL." },
      { status: 500 }
    );
  }

  const { verifier, challenge } = createPkcePair();
  const state = randomToken(32);

  const cookieOpts = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600, // 10 minutes to complete the flow
  };

  const store = cookies();
  store.set("x_oauth_verifier", verifier, cookieOpts);
  store.set("x_oauth_state", state, cookieOpts);

  const url = buildAuthorizeUrl({
    state,
    challenge,
    scope: getScopes().join(" "),
  });

  return NextResponse.redirect(url, 302);
}
