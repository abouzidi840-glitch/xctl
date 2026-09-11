import Link from "next/link";
import { redirect } from "next/navigation";
import { readPanelSession } from "@/lib/panelauth";
import { listAccounts } from "@/lib/store";
import { getRedirectUri, getScopes } from "@/lib/xoauth";
import DisconnectButton from "@/components/DisconnectButton";

export const dynamic = "force-dynamic";

const appName = () => process.env.NEXT_PUBLIC_APP_NAME || "XCTL · Twitter Control Terminal";
const brandShort = () => appName().split("·")[0].trim();

export default async function SettingsPage() {
  const panel = await readPanelSession();
  if (!panel) redirect("/login");

  const accounts = await listAccounts();

  return (
    <div className="wrap">
      <header className="masthead">
        <div className="brand"><b>{brandShort()}</b> · Twitter Control Terminal</div>
        <nav className="nav">
          <Link href="/">Terminal</Link>
          <Link href="/settings" className="active">Settings</Link>
          <a href="/api/panel/logout">Log out</a>
        </nav>
      </header>

      <div className="kicker">§ Settings</div>
      <h1 className="display" style={{ fontSize: 44 }}>Connections &amp; accounts.</h1>

      <div className="panel">
        <h2><span className="count">{accounts.length}</span> X accounts</h2>
        {accounts.length === 0 ? (
          <div className="empty">No accounts connected.</div>
        ) : (
          accounts.map((a) => {
            return (
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
                    token refresh {new Date(a.expiresAt).toLocaleString()} · scopes:{" "}
                    {(a.scope || []).join(", ")}
                  </div>
                </div>
                <DisconnectButton accountId={a.id} />
              </div>
            );
          })
        )}
        <div style={{ marginTop: 16 }}>
          <Link className="btn btn-acc" href="/api/auth/twitter" style={{ display: "inline-block" }}>
            + Connect another X account
          </Link>
        </div>
      </div>

      <div className="panel">
        <h2>Panel access</h2>
        <div className="row" style={{ gap: 8, alignItems: "center" }}>
          <span className="msg">Signed in as</span>
          <span>
            {panel.u} <span className="at muted">operator</span>
          </span>
        </div>
        <p className="msg small" style={{ marginTop: 10, lineHeight: 1.9 }}>
          The panel is protected by an operator login (username &amp; password).
          Set PANEL_USER / PANEL_PASS environment variables in Vercel to change
          the credentials. X account tokens stay stored until you disconnect them.
        </p>
      </div>

      <div className="panel">
        <h2>OAuth details</h2>
        <p className="msg small" style={{ lineHeight: 1.9 }}>
          Redirect URI registered with X: <span className="dot">{getRedirectUri()}</span>
        </p>
        <p className="msg small" style={{ lineHeight: 1.9 }}>
          Requested scopes ({getScopes().length}): {getScopes().join(" ")}
        </p>
      </div>

      <div className="foot">v0.1 · build ▲ main</div>
    </div>
  );
}
