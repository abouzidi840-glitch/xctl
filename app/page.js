import Link from "next/link";
import { redirect } from "next/navigation";
import { readSession } from "@/lib/session";
import { listAccounts } from "@/lib/store";
import Composer from "@/components/Composer";
import DisconnectButton from "@/components/DisconnectButton";
import RefreshButton from "@/components/RefreshButton";

export const dynamic = "force-dynamic";

const appName = () => process.env.NEXT_PUBLIC_APP_NAME || "XCTL · Twitter Control Terminal";
const brandShort = () => appName().split("·")[0].trim();

export default async function HomePage() {
  const session = await readSession();
  if (!session) redirect("/login");

  const accounts = await listAccounts();
  const visible = accounts.map((a) => ({
    id: a.id,
    xUserId: a.xUserId,
    username: a.username,
    name: a.name,
    avatarUrl: a.avatarUrl,
    scope: a.scope || [],
    createdAt: a.createdAt,
    tokenExpiresAt: a.expiresAt || 0,
    isSessionUser: String(a.xUserId) === String(session.sub),
  }));

  return (
    <div className="wrap">
      <header className="masthead">
        <div className="brand"><b>{brandShort()}</b> · Twitter Control Terminal</div>
        <nav className="nav">
          <Link href="/" className="active">Terminal</Link>
          <Link href="/settings">Settings</Link>
          <a href="/api/auth/logout">Log out</a>
        </nav>
      </header>

      <div className="kicker">§ Terminal · {appName().split("·")[0].trim()}</div>
      <h1 className="display" style={{ fontSize: 44 }}>
        Operate <em>{visible.length}</em> {visible.length === 1 ? "identity" : "identities"}.
      </h1>

      {visible.length === 0 ? (
        <div className="panel">
          <div className="empty">
            No X accounts connected yet.
            <br />
            <br />
            <Link href="/api/auth/twitter">Connect the first account →</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="panel">
            <h2><span className="count">{visible.length}</span> connected</h2>
            {visible.map((a) => (
              <div className="acc-row" key={a.id}>
                {a.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="avatar" src={a.avatarUrl} alt="" width={40} height={40} />
                ) : (
                  <div className="avatar" />
                )}
                <div>
                  <div className="acc-name">
                    {a.name} <span className="at">@{a.username}</span>{" "}
                    {a.isSessionUser && <span className="badge">session</span>}
                  </div>
                  <div className="acc-meta">
                    {a.scope.includes("tweet.write") ? "write" : "read-only"} · connected{" "}
                    {new Date(a.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="acc-actions">
                  <RefreshButton accountId={a.id} tokenExpiresAt={a.tokenExpiresAt} />
                  <DisconnectButton accountId={a.id} isSessionUser={a.isSessionUser} />
                </div>
              </div>
            ))}
          </div>

          <div className="panel">
            <h2>Compose</h2>
            <Composer accounts={visible} />
          </div>
        </>
      )}

      <div className="foot">
        Signed in as @{session.username} · session {new Date(session.exp * 1000).toLocaleDateString()}
      </div>
    </div>
  );
}
