import { NextResponse } from "next/server";
import { readSession } from "@/lib/session";
import { getAccountById } from "@/lib/store";
import { createTweet } from "@/lib/x";

export const dynamic = "force-dynamic";

// POST /api/tweets { accountId, text } -> post to X as that account.
export async function POST(request) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { accountId, text } = body || {};
  if (!accountId || !text || typeof text !== "string") {
    return NextResponse.json({ error: "accountId and text are required" }, { status: 400 });
  }
  if (text.length > 280) {
    return NextResponse.json({ error: "text exceeds 280 characters" }, { status: 400 });
  }

  const account = await getAccountById(accountId);
  if (!account) return NextResponse.json({ error: "account_not_found" }, { status: 404 });

  try {
    const tweet = await createTweet(account, text);
    return NextResponse.json({ tweet });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
