import { NextResponse } from "next/server";
import {
  createPanelToken,
  panelCredentials,
  PANEL_COOKIE,
  PANEL_MAX_AGE,
} from "@/lib/panelauth";

export const dynamic = "force-dynamic";

// POST /api/panel/login  (form post: username, password)
export async function POST(request) {
  const form = await request.formData();
  const username = String(form.get("username") || "").trim();
  const password = String(form.get("password") || "");

  const creds = panelCredentials();
  if (username !== creds.username || password !== creds.password) {
    return NextResponse.redirect(new URL("/login?error=1", request.url), 303);
  }

  const token = await createPanelToken(username);
  const res = NextResponse.redirect(new URL("/", request.url), 303);
  res.cookies.set(PANEL_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PANEL_MAX_AGE,
  });
  return res;
}
