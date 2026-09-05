import Link from "next/link";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "XCTL · Twitter Control Terminal";
  return (
    <div className="landing">
      <div className="grid">
        <div className="half">
          <div className="kicker">{appName.split("·")[0].trim()} · Terminal</div>
          <h1 className="display">
            Control every <em>X</em> account.
          </h1>
          <p className="muted small" style={{ maxWidth: 420, lineHeight: 1.9 }}>
            A dense, editorial control surface for operating multiple X identities
            from a single pane. Admin access only.
          </p>
          <div className="mods">
            <div><span className="num">01</span>Compose</div>
            <div><span className="num">02</span>Engage</div>
            <div><span className="num">03</span>Monitor</div>
          </div>
        </div>
        <div className="half">
          <div className="kicker">§ Admin entry</div>
          <h2 className="display" style={{ fontSize: 32 }}>
            Sign in to the terminal.
          </h2>
          <p className="muted small" style={{ margin: "12px 0 28px", lineHeight: 1.8 }}>
            Restricted access. Connect an X account to unlock the dashboard.
            The first account you connect becomes your admin session.
          </p>
          <Link className="btn btn-acc" href="/api/auth/twitter" style={{ display: "inline-block" }}>
            Continue with X
          </Link>
          <div className="foot">v0.1 · OAuth2 PKCE</div>
        </div>
      </div>
    </div>
  );
}
