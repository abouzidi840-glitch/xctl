"use client";

import { useMemo, useState } from "react";

export default function Composer({ accounts }) {
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const remaining = 280 - text.length;

  async function onPost(e) {
    e.preventDefault();
    if (!accountId || !text.trim() || busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/tweets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, text: text.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setMsg({ ok: true, body: `posted → https://x.com/i/status/${data.tweet.id}` });
      setText("");
    } catch (err) {
      setMsg({ ok: false, body: err.message });
    } finally {
      setBusy(false);
    }
  }

  const hasWrite = useMemo(() => {
    const acc = accounts.find((a) => a.id === accountId);
    return acc ? (acc.scope || []).includes("tweet.write") : false;
  }, [accountId, accounts]);

  return (
    <form className="composer" onSubmit={onPost}>
      <div className="row" style={{ gap: "8px", alignItems: "center" }}>
        <label className="kicker" htmlFor="composer-account">As</label>
        <select id="composer-account" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              @{a.username}
            </option>
          ))}
        </select>
        {!hasWrite && <span className="badge badge-warn">no tweet.write scope</span>}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Compose a post…"
        rows={4}
        maxLength={280}
      />
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <button className="btn btn-acc" type="submit" disabled={busy || !hasWrite || !text.trim()}>
          {busy ? "Posting…" : "Post"}
        </button>
        <span className={remaining < 0 ? "msg msg-err" : "msg"}>{remaining}</span>
      </div>
      {msg && <p className={msg.ok ? "msg msg-ok" : "msg msg-err"}>{msg.body}</p>}
    </form>
  );
}
