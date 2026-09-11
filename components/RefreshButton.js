"use client";

import { useState } from "react";

// Per-account token refresh button with live status badge.
export default function RefreshButton({ accountId, tokenExpiresAt }) {
  const [state, setState] = useState("idle"); // idle | busy | done | error
  const [message, setMessage] = useState("");
  const [expiresAt, setExpiresAt] = useState(tokenExpiresAt);

  const exp = Number(expiresAt) || 0;
  const isExpired = exp > 0 && exp < Date.now();
  const minsLeft = exp ? Math.round((exp - Date.now()) / 60000) : 0;
  const status = isExpired
    ? { cls: "tok tok-dead", label: "expired" }
    : minsLeft < 60
    ? { cls: "tok tok-soon", label: `${Math.max(minsLeft, 0)}m left` }
    : { cls: "tok tok-ok", label: `${Math.round(minsLeft / 60)}h left` };

  async function refresh() {
    setState("busy");
    setMessage("");
    try {
      const res = await fetch(`/api/accounts/${accountId}/refresh`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setExpiresAt(data.expiresAt);
      setState("done");
      setMessage("refreshed ✓");
      setTimeout(() => setState("idle"), 2500);
    } catch (err) {
      setState("error");
      setMessage(err.message);
      setTimeout(() => setState("idle"), 5000);
    }
  }

  return (
    <div className="refresh-cell">
      <span className={status.cls}>{status.label}</span>
      <button
        className="btn-refresh"
        onClick={refresh}
        disabled={state === "busy"}
        title="Refresh token (revive it if it can still be revived)"
      >
        {state === "busy" ? "…" : "⟳"}
      </button>
      {message && <span className={state === "error" ? "rf-err" : "rf-ok"}>{message}</span>}
    </div>
  );
}
