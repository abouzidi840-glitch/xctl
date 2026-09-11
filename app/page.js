import Link from "next/link";
import { redirect } from "next/navigation";
import { readPanelSession } from "@/lib/panelauth";
import { listAccounts } from "@/lib/store";
import Composer from "@/components/Composer";
import DisconnectButton from "@/components/DisconnectButton";
import RefreshButton from "@/components/RefreshButton";

export const dynamic = "force-dynamic";

const appName = () => process.env.NEXT_PUBLIC_APP_NAME || "XCTL · Twitter Control Terminal";
const brandShort = () => appName().split("·")[0].trim();

export default async function HomePage() {
  const panel = await readPanelSession();
  if (!panel) redirect("/login");

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
  }));

  return (
    <div className="wrap">
      <header className="masthead">
        <div className="brand"><b>{brandShort()}</b> · Twitter Control Terminal</div>
        <nav className="nav">
          <Link href="/" className="active">Terminal</Link>
          <Link href="/settings">Settings</Link>
          <a href="/api/panel/logout">Log out</a>
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
            <Link href="/devs">Connect the first account →</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="panel">
            <h2><span className="count">{visible.length}</span> connected</h2>
            <div style={{ margin: "10px 0 4px" }}>
              <Link className="btn btn-acc" href="/devs" style={{ display: "inline-block" }}>
                + Add X account
              </Link>
            </div>
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
                    {a.name} <span className="at">@{a.username}</span>
                  </div>
                  <div className="acc-meta">
                    {a.scope.includes("tweet.write") ? "write" : "read-only"} · connected{" "}
                    {new Date(a.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="acc-actions">
                  <RefreshButton accountId={a.id} tokenExpiresAt={a.tokenExpiresAt} />
                  <DisconnectButton accountId={a.id} />
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
        Signed in as {panel.u} · panel session {new Date(panel.exp * 1000).toLocaleDateString()}
      </div>
    </div>
  );
}
