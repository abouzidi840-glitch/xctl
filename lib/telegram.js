// ---------------------------------------------------------------------------
// Telegram notifications.
//
// Required env vars (set them in Vercel -> Settings -> Environment Variables):
//   TELEGRAM_BOT_TOKEN  - token from @BotFather ("123456:ABC-...")
//   TELEGRAM_CHAT_ID    - your chat id (number or -100... for groups)
//
// If either var is missing, notifications are silently skipped so the app
// keeps working without Telegram configured.
// ---------------------------------------------------------------------------

export function telegramConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

// Fire-and-forget: never throws, so callers don't break on Telegram outage.
export async function notifyTelegram(text) {
  if (!telegramConfigured()) return false;
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

// One-line mention (used in the cron digest).
export function fmtAccount(a) {
  return `@${a.username}${a.name && a.name !== a.username ? ` (${a.name})` : ""}`;
}

// Detailed identity block, e.g.:
//   Name: jaykalope
//   Account: @oneless21
//   X user ID: 15974747
//   Internal ID: 8d54bef9-790f-46bf-8524-fa27417e156e
//   Flow: Standard
//   Connected: 2026-09-10T23:21:46.699Z
export function fmtAccountBlock(a) {
  const lines = [
    `Name: ${a.name || a.username || "-"}`,
    `Account: @${a.username || "-"}`,
    `X user ID: ${a.xUserId || "-"}`,
    `Internal ID: ${a.id || "-"}`,
    `Flow: Standard`,
    `Connected: ${a.createdAt ? new Date(a.createdAt).toISOString() : "-"}`,
  ];
  return lines.join("\n");
}
