import Link from "next/link";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "XCTL · Twitter Control Terminal";
  const brand = appName.split("·")[0].trim();

  return (
    <div className="landing">
      <div className="grid">
        <div className="half">
          <div className="kicker">{brand} · Command Center</div>
          <h1 className="display">
            Command every <em>X</em> account.
          </h1>
          <p className="muted small" style={{ maxWidth: 440, lineHeight: 2 }}>
            One HUD. Every identity. Connect your X accounts and run them
            from a single gaming-style control panel — compose, engage, monitor.
          </p>
          <div className="mods">
            <div><span className="num">01</span>Compose</div>
            <div><span className="num">02</span>Engage</div>
            <div><span className="num">03</span>Monitor</div>
          </div>
          <div style={{ marginTop: 32, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span className="stat-chip"><b>◉</b> OAuth2 · PKCE secured</span>
            <span className="stat-chip"><b>⟳</b> Auto token refresh</span>
            <span className="stat-chip"><b>◈</b> Telegram alerts</span>
          </div>
        </div>
        <div className="half">
          <div className="kicker">§ Player entry</div>
          <h2 className="display" style={{ fontSize: 34 }}>
            Press start.
          </h2>
          <p className="muted small" style={{ margin: "14px 0 30px", lineHeight: 2 }}>
            Restricted access. Connect an X account to unlock the dashboard.
            The first account you connect becomes your admin session.
          </p>
          <Link
            className="btn btn-acc"
            href="/api/auth/twitter"
            style={{ display: "inline-block", fontSize: 13, padding: "16px 34px" }}
          >
            ▶ Continue with X
          </Link>
          <div className="foot">v1.0 · secure login</div>
        </div>
      </div>
    </div>
  );
}
