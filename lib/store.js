// ---------------------------------------------------------------------------
// Account persistence for Vercel / serverless.
//
// This version stores accounts in a Postgres database (Neon, Vercel Postgres,
// Supabase, Turso...). It works on serverless because it doesn't touch the
// local filesystem, which is ephemeral on Vercel.
//
// Why Postgres: it's the simplest reliable option for a Node app on Vercel and
// we can query/serialize easily. If you prefer a different store (Supabase,
// Upstash Redis), the function signatures below stay the same.
//
// Required env vars:
//   DATABASE_URL   e.g. postgres://user:pass@host/db (Neon provides one)
// ---------------------------------------------------------------------------
import { randomUUID } from "node:crypto";
import pg from "pg";

let poolPromise = null;

async function getPool() {
  if (poolPromise) return poolPromise;
  poolPromise = (async () => {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set. Add it in your .env.local and in Vercel env vars."
      );
    }
    const pool = new pg.Pool({ connectionString: url });
    await ensureSchema(pool);
    return pool;
  })();
  return poolPromise;
}

async function ensureSchema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS accounts (
      id            TEXT PRIMARY KEY,
      x_user_id     TEXT UNIQUE NOT NULL,
      username      TEXT NOT NULL,
      name          TEXT,
      avatar_url    TEXT,
      access_token  TEXT NOT NULL,
      refresh_token TEXT,
      expires_at    BIGINT,
      scope         TEXT,
      created_at    TIMESTAMPTZ DEFAULT now(),
      updated_at    TIMESTAMPTZ DEFAULT now()
    );
  `);
}

// Keep the same public API as the file-based store so callers don't change.
export async function listAccounts() {
  const pool = await getPool();
  const { rows } = await pool.query("SELECT * FROM accounts ORDER BY created_at ASC");
  return rows.map(rowToAccount);
}

export async function getAccountByXUserId(xUserId) {
  const pool = await getPool();
  const { rows } = await pool.query("SELECT * FROM accounts WHERE x_user_id = $1", [String(xUserId)]);
  return rows.length ? rowToAccount(rows[0]) : null;
}

export async function getAccountById(id) {
  const pool = await getPool();
  const { rows } = await pool.query("SELECT * FROM accounts WHERE id = $1", [id]);
  return rows.length ? rowToAccount(rows[0]) : null;
}

export async function upsertAccount(account) {
  const pool = await getPool();
  const id = account.id || randomUUID();
  await pool.query(
    `INSERT INTO accounts (id, x_user_id, username, name, avatar_url, access_token, refresh_token, expires_at, scope, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now(), now())
     ON CONFLICT (x_user_id)
     DO UPDATE SET
       username = EXCLUDED.username,
       name = EXCLUDED.name,
       avatar_url = EXCLUDED.avatar_url,
       access_token = EXCLUDED.access_token,
       refresh_token = EXCLUDED.refresh_token,
       expires_at = EXCLUDED.expires_at,
       scope = EXCLUDED.scope,
       updated_at = now()
     RETURNING *`,
    [
      id,
      String(account.xUserId),
      account.username,
      account.name,
      account.avatarUrl,
      account.accessToken,
      account.refreshToken,
      new Date(account.expiresAt),
      JSON.stringify(account.scope || []),
    ]
  );
  const { rows } = await pool.query("SELECT * FROM accounts WHERE x_user_id = $1", [
    String(account.xUserId),
  ]);
  return rowToAccount(rows[0]);
}

export async function deleteAccountById(id) {
  const pool = await getPool();
  const { rowCount } = await pool.query("DELETE FROM accounts WHERE id = $1", [id]);
  return rowCount > 0;
}

// Converts a snake_case Postgres row into the camelCase shape the app expects.
function rowToAccount(r) {
  let scope = [];
  try {
    scope = typeof r.scope === "string" ? JSON.parse(r.scope) : r.scope || [];
  } catch {
    scope = [];
  }
  return {
    id: r.id,
    xUserId: String(r.x_user_id),
    username: r.username,
    name: r.name,
    avatarUrl: r.avatar_url || "",
    accessToken: r.access_token,
    refreshToken: r.refresh_token || "",
    expiresAt: r.expires_at ? new Date(r.expires_at).getTime() : 0,
    scope,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
