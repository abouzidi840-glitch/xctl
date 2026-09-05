import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/session";

// GET /api/auth/logout -> clear admin session.
export async function GET() {
  cookies().delete(SESSION_COOKIE);
  return NextResponse.redirect(new URL("/login", process.env.APP_URL || "http://localhost:3000"), 302);
}
