import { NextResponse } from "next/server";
import { readPanelSession } from "@/lib/panelauth";
import { listAccounts } from "@/lib/store";

export const dynamic = "force-dynamic";

// GET /api/accounts -> connected X accounts (never expose raw tokens).
export async function GET() {
  const panel = await readPanelSession();
  if (!panel) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const accounts = (await listAccounts()).map((a) => ({
    id: a.id,
    xUserId: a.xUserId,
    username: a.username,
    name: a.name,
    avatarUrl: a.avatarUrl,
    scope: a.scope,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    tokenExpiresAt: a.expiresAt,
  }));

  return NextResponse.json({ accounts });
}
