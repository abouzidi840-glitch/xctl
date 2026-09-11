import { NextResponse } from "next/server";
import { readPanelSession } from "@/lib/panelauth";
import { getAccountById, deleteAccountById } from "@/lib/store";
import { revokeToken } from "@/lib/x";
import { notifyTelegram, telegramConfigured, fmtAccountBlock } from "@/lib/telegram";

export const dynamic = "force-dynamic";

// DELETE /api/accounts/:id -> revoke token on X and remove locally.
export async function DELETE(_request, { params }) {
  const panel = await readPanelSession();
  if (!panel) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const account = await getAccountById(params.id);
  if (!account) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (telegramConfigured()) {
    await notifyTelegram(`❌ X account removed\n${fmtAccountBlock(account)}`);
  }

  // Best effort remote revocation (uses the current access token).
  await revokeToken(account.accessToken);

  const removed = await deleteAccountById(params.id);
  if (!removed) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
