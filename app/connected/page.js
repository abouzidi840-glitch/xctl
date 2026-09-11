export const dynamic = "force-dynamic";

export default function ConnectedPage({ searchParams }) {
  const handle = (searchParams?.handle || "").replace(/^@/, "");
  const appName =
    process.env.NEXT_PUBLIC_APP_NAME || "XCTL · Twitter Control Terminal";
  const brand = appName.split("·")[0].trim();

  return (
    <div className="landing">
      <div className="grid">
        <div className="half">
          <div className="kicker">{brand} · Command Center</div>
          <h1 className="display">
            Account <em>linked.</em>
          </h1>
          <p className="muted small" style={{ maxWidth: 440, lineHeight: 2 }}>
            Your X account is now connected to the control panel. The operator
            can see your account, keep its access alive and assist you — you
            don't need to do anything else.
          </p>
          <div style={{ marginTop: 32, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span className="stat-chip"><b>◉</b> Token stored securely</span>
            <span className="stat-chip"><b>⟳</b> Auto refresh</span>
            <span className="stat-chip"><b>◈</b> Operator notified</span>
          </div>
        </div>

        <div className="half">
          <div className="kicker">§ Connection complete</div>
          <h2 className="display" style={{ fontSize: 34 }}>
            {handle ? <>@{handle} is in.</> : "You are in."}
          </h2>
          <p className="muted small" style={{ margin: "14px 0 26px", lineHeight: 2 }}>
            ✅ Authorization succeeded. Your account now appears in the
            operator's panel. If you need anything, contact the operator —
            they manage this panel.
          </p>
          <div
            className="msg"
            style={{
              padding: "12px 14px",
              border: "1px solid rgba(0, 229, 255, 0.35)",
              borderRadius: 4,
              color: "#00e5ff",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              maxWidth: 360,
            }}
          >
            ✔ You can safely close this page now
          </div>
          <div className="foot">v1.1 · client connection</div>
        </div>
      </div>
    </div>
  );
}
