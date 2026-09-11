import { NextResponse } from "next/server";
import { listAccounts } from "@/lib/store";
import { refreshAccountTokens } from "@/lib/x";
import { notifyTelegram, telegramConfigured, fmtAccount } from "@/lib/telegram";

export const dynamic = "force-dynamic";

// Called automatically by the Vercel cron in vercel.json (every 6 hours).
// Refreshes every account whose access token expires within 24 hours,
// lets dead tokens die, and sends a Telegram digest.
export async function GET(request) {
  // Protect the endpoint: either Vercel's cron header or a CRON_SECRET match.
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization") || "";
  const isVercelCron = request.headers.get("x-vercel-cron") !== null;
  if (!isVercelCron && secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const accounts = await listAccounts();
  const now = Date.now();
  const soon = now + 24 * 60 * 60 * 1000; // expire within 24h -> refresh
  const lines = [];
  let refreshed = 0;
  let dead = 0;
  let healthy = 0;

  for (const account of accounts) {
    if (!account.refreshToken) {
      dead += 1;
      lines.push(`💀 ${fmtAccount(account)} — no refresh token (needs re-login)`);
      continue;
    }
    if (account.expiresAt < now) {
      dead += 1;
      lines.push(`⌛ ${fmtAccount(account)} — token already expired`);
      continue;
    }
    if (account.expiresAt < soon) {
      try {
        const fresh = await refreshAccountTokens(account);
        refreshed += 1;
        lines.push(
          `♻️ ${fmtAccount(fresh)} — refreshed, valid until ${new Date(fresh.expiresAt).toLocaleString("en-GB")}`
        );
      } catch (err) {
        dead += 1;
        lines.push(`⚠️ ${fmtAccount(account)} — refresh failed: ${err.message}`);
      }
    } else {
      healthy += 1;
      lines.push(`✅ ${fmtAccount(account)} — OK`);
    }
  }

  if (telegramConfigured()) {
    const header = `🛰 <b>Auto-refresh report</b> (${new Date().toLocaleString("en-GB")})\n` +
      `accounts: ${accounts.length} · refreshed: ${refreshed} · healthy: ${healthy} · dead: ${dead}`;
    await notifyTelegram(lines.length ? `${header}\n\n${lines.join("\n")}` : header);
  }

  return NextResponse.json({ total: accounts.length, refreshed, healthy, dead, lines });
}
