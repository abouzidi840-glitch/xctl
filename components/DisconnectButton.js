"use client";

import { useState } from "react";

export default function DisconnectButton({ accountId, isSessionUser }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function onDisconnect() {
    const label = isSessionUser
      ? "This is the account you signed in with — disconnecting it will end your session. Continue?"
      : "Revoke this account's X token and remove it?";
    if (!window.confirm(label)) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(`/api/accounts/${accountId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      window.location.reload();
    } catch (err) {
      setMsg(`Failed: ${err.message}`);
      setBusy(false);
    }
  }

  return (
    <span style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
      <button className="btn btn-danger" onClick={onDisconnect} disabled={busy}>
        {busy ? "…" : "Disconnect"}
      </button>
      {msg && <span className="msg msg-err">{msg}</span>}
    </span>
  );
}
