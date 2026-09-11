export const dynamic = "force-dynamic";

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  background: "#0b0b0b",
  border: "1px solid rgba(0, 229, 255, 0.30)",
  color: "#ececea",
  padding: "13px 14px",
  fontSize: 14,
  letterSpacing: "0.08em",
  borderRadius: 4,
  outline: "none",
};

const labelStyle = {
  display: "grid",
  gap: 6,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.24em",
  textTransform: "uppercase",
  color: "rgba(236, 236, 234, 0.55)",
};

export default function LoginPage({ searchParams }) {
  const error = searchParams?.error;
  const appName =
    process.env.NEXT_PUBLIC_APP_NAME || "XCTL · Twitter Control Terminal";
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
            One HUD. Every identity. Sign in to the control panel with your
            operator credentials, then connect your X accounts and run them from
            a single gaming-style terminal — compose, engage, monitor.
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
          <div className="kicker">§ Operator login</div>
          <h2 className="display" style={{ fontSize: 34 }}>
            Press start.
          </h2>
          <p className="muted small" style={{ margin: "14px 0 26px", lineHeight: 2 }}>
            Restricted area. Enter your operator credentials to unlock the
            control panel. X accounts are connected from inside the panel.
          </p>

          {error && (
            <div
              className="msg"
              style={{
                marginBottom: 16,
                padding: "10px 12px",
                border: "1px solid #ff5470",
                borderRadius: 4,
                color: "#ff5470",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              ✖ Access denied — wrong username or password
            </div>
          )}

          <form
            method="POST"
            action="/api/panel/login"
            style={{ display: "grid", gap: 14, maxWidth: 360 }}
          >
            <label style={labelStyle}>
              Operator ID
              <input
                name="username"
                autoComplete="username"
                required
                style={inputStyle}
                placeholder="admin"
              />
            </label>
            <label style={labelStyle}>
              Passcode
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                style={inputStyle}
                placeholder="••••••••"
              />
            </label>
            <button
              className="btn btn-acc"
              type="submit"
              style={{
                display: "inline-block",
                fontSize: 13,
                padding: "16px 34px",
                cursor: "pointer",
                width: "fit-content",
              }}
            >
              ▶ Enter the terminal
            </button>
          </form>

          <div className="foot">v1.1 · operator access</div>
        </div>
      </div>
    </div>
  );
}
