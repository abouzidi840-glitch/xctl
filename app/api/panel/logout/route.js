import { NextResponse } from "next/server";
import { PANEL_COOKIE } from "@/lib/panelauth";

export const dynamic = "force-dynamic";

function clearAndRedirect(request) {
  const res = NextResponse.redirect(new URL("/login", request.url), 303);
  res.cookies.set(PANEL_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}

// GET and POST both work so the nav link stays a simple <a>.
export async function GET(request) {
  return clearAndRedirect(request);
}

export async function POST(request) {
  return clearAndRedirect(request);
}
