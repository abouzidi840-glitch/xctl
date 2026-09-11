// ---------------------------------------------------------------------------
// Telegram notifications.
//
// Required env vars (set them in Vercel -> Settings -> Environment Variables):
//   TELEGRAM_BOT_TOKEN  - token from @BotFather ("123456:ABC-...")
//   TELEGRAM_CHAT_ID    - your chat id (send /start to the bot, then open
//                         https://api.telegram.org/bot<TOKEN>/getUpdates
//                         and copy chat.id)
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

export function fmtAccount(a) {
  return `@${a.username}${a.name && a.name !== a.username ? ` (${a.name})` : ""}`;
}
