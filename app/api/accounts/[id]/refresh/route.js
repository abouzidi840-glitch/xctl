import { NextResponse } from "next/server";
import { readPanelSession } from "@/lib/panelauth";
import { getAccountById } from "@/lib/store";
import { refreshAccountTokens } from "@/lib/x";
import { notifyTelegram, telegramConfigured, fmtAccountBlock } from "@/lib/telegram";

export const dynamic = "force-dynamic";

// POST /api/accounts/:id/refresh -> force a token refresh for one account.
export async function POST(_request, { params }) {
  const panel = await readPanelSession();
  if (!panel) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const account = await getAccountById(params.id);
  if (!account) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (!account.refreshToken) {
    return NextResponse.json(
      { error: "No refresh token for this account. Re-connect it via X login." },
      { status: 400 }
    );
  }

  try {
    const fresh = await refreshAccountTokens(account);
    if (telegramConfigured()) {
      await notifyTelegram(
        `⟳ Token refreshed\n${fmtAccountBlock(fresh)}\nValid until: ${new Date(fresh.expiresAt).toISOString()}`
      );
    }
    return NextResponse.json({
      ok: true,
      expiresAt: fresh.expiresAt,
      scope: fresh.scope,
    });
  } catch (err) {
    // X rejects the refresh token (revoked/expired) -> tell the caller to re-auth.
    if (telegramConfigured()) {
      await notifyTelegram(
        `⚠️ Token refresh failed\n${fmtAccountBlock(account)}\nError: ${err.message}\n→ Re-connect this account via X login.`
      );
    }
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
