import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readSession, SESSION_COOKIE } from "@/lib/session";
import { getAccountById, deleteAccountById } from "@/lib/store";
import { revokeToken } from "@/lib/x";

export const dynamic = "force-dynamic";

// DELETE /api/accounts/:id -> revoke token on X and remove locally.
export async function DELETE(_request, { params }) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const account = await getAccountById(params.id);
  if (!account) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // Best effort remote revocation (uses the current access token).
  await revokeToken(account.accessToken);

  const removed = await deleteAccountById(params.id);
  if (!removed) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // If the signed-in account was removed, kill the session too.
  if (String(account.xUserId) === String(session.sub)) {
    cookies().delete(SESSION_COOKIE);
  }

  return NextResponse.json({ ok: true });
}
