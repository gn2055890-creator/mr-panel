import { useState, useEffect, useCallback } from "react";

const _API_KEY = import.meta.env.VITE_API_SECRET ?? "";
function apiFetch(url: string, opts: RequestInit = {}): Promise<Response> {
  const h = new Headers(opts.headers);
  if (_API_KEY) h.set("x-api-key", _API_KEY);
  return fetch(url, { ...opts, headers: h });
}

const T = {
  bg: "#0a0f1e",
  card: "#111827",
  cardHover: "#1a2236",
  border: "#1f2d45",
  borderLight: "#263347",
  text: "#f1f5f9",
  muted: "#64748b",
  mutedLight: "#94a3b8",
  accent: "#6366f1",
  accentLight: "#818cf8",
  accentGlow: "rgba(99,102,241,0.15)",
  green: "#22c55e",
  red: "#ef4444",
  yellow: "#f59e0b",
  orange: "#f97316",
  inputBg: "#0d1526",
  headerBg: "#0d1526",
};

type App = {
  id: number; appId: string; name: string; pin: string;
  status: string; loginLimit: number; activeSessions: number; createdAt: string;
};

function generateAppId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const seg = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `APP-${seg(4)}-${seg(4)}-${seg(4)}`;
}

function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) return navigator.clipboard.writeText(text);
  const el = document.createElement("textarea");
  el.value = text;
  el.style.position = "fixed"; el.style.opacity = "0";
  document.body.appendChild(el); el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  return Promise.resolve();
}

function CopyBtn({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    copyToClipboard(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      onClick={handleCopy}
      title={`Copy ${label}`}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        padding: "3px 8px", borderRadius: 6, border: `1px solid ${copied ? T.green : T.borderLight}`,
        background: copied ? T.green + "22" : "transparent",
        color: copied ? T.green : T.mutedLight, cursor: "pointer",
        fontSize: 11, fontWeight: 600, gap: 4, transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {copied ? "✓ Copied!" : `⎘ ${label}`}
    </button>
  );
}

/* ─────────── Login Screen ─────────── */
function MasterLogin({ onAuth }: { onAuth: (pin: string) => void }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const r = await apiFetch("/api/admin/verify-master-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!r.ok) { setErr("Wrong master PIN. Try again."); setPin(""); return; }
      onAuth(pin);
    } catch { setErr("Network error. Try again."); }
    finally { setLoading(false); }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: `radial-gradient(ellipse at 60% 20%, rgba(99,102,241,0.18) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(139,92,246,0.12) 0%, transparent 55%), ${T.bg}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "system-ui", padding: "20px",
    }}>
      <div style={{
        width: "100%", maxWidth: 400,
        background: T.card,
        borderRadius: 20,
        padding: "40px 36px",
        border: `1px solid ${T.borderLight}`,
        boxShadow: "0 25px 80px rgba(0,0,0,.6), 0 0 60px rgba(99,102,241,0.08)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, margin: "0 auto 16px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
          }}>🤖</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: T.text, letterSpacing: -0.5 }}>MR ROBOT</div>
          <div style={{
            display: "inline-block", marginTop: 8, fontSize: 11, color: T.accent,
            background: T.accentGlow, padding: "3px 12px", borderRadius: 99,
            border: `1px solid ${T.accent}44`, fontWeight: 700, letterSpacing: 1,
          }}>MASTER ADMIN</div>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 11, color: T.mutedLight, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" }}>
            Master PIN
          </label>
          <div style={{ position: "relative", marginTop: 8, marginBottom: 6 }}>
            <input
              type={showPin ? "text" : "password"}
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="Enter master PIN"
              autoFocus
              style={{
                width: "100%", padding: "14px 44px 14px 16px",
                borderRadius: 12, border: `1.5px solid ${pin ? T.accent + "80" : T.borderLight}`,
                background: T.inputBg, color: T.text, fontSize: 15, outline: "none",
                boxSizing: "border-box", transition: "border-color 0.2s",
                fontFamily: pin && !showPin ? "monospace" : "inherit",
                letterSpacing: pin && !showPin ? 3 : "normal",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPin(v => !v)}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 16, padding: 4,
              }}
            >{showPin ? "🙈" : "👁"}</button>
          </div>

          {err && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              color: T.red, fontSize: 13, marginTop: 10, marginBottom: 4,
              background: T.red + "15", padding: "8px 12px", borderRadius: 8,
              border: `1px solid ${T.red}33`,
            }}>
              <span>⚠</span> {err}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !pin}
            style={{
              width: "100%", marginTop: 20, padding: "14px 0", borderRadius: 12,
              background: pin && !loading
                ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                : T.borderLight,
              color: "#fff", fontWeight: 800, fontSize: 15, border: "none",
              cursor: pin && !loading ? "pointer" : "default",
              letterSpacing: 0.3, transition: "all 0.2s",
              boxShadow: pin && !loading ? "0 6px 20px rgba(99,102,241,0.35)" : "none",
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #fff4", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Verifying…
              </span>
            ) : "Unlock Panel →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: T.muted }}>
          MR ROBOT Control Panel · Secure Access
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ─────────── Create App Modal ─────────── */
function CreateAppModal({ masterPin, onClose, onCreated }: { masterPin: string; onClose: () => void; onCreated: (a: App) => void }) {
  const [name, setName] = useState("MR ROBOT");
  const [appId, setAppId] = useState(generateAppId);
  const [pin, setPin] = useState("1234");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !pin.trim()) { setErr("All fields required"); return; }
    if (pin.length < 4) { setErr("PIN must be at least 4 characters"); return; }
    setErr(""); setLoading(true);
    try {
      const r = await apiFetch("/api/master/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-master-pin": masterPin },
        body: JSON.stringify({ appId, name: name.trim(), pin }),
      });
      if (!r.ok) { const j = await r.json() as { error?: string }; setErr(j.error ?? "Failed"); return; }
      const created = await r.json() as App;
      onCreated(created);
    } catch { setErr("Network error"); }
    finally { setLoading(false); }
  }

  const inp = (extra?: React.CSSProperties): React.CSSProperties => ({
    width: "100%", marginTop: 6, padding: "11px 14px", borderRadius: 10,
    border: `1.5px solid ${T.borderLight}`, background: T.inputBg,
    color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box",
    ...extra,
  });

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: "100%", maxWidth: 420, background: T.card, borderRadius: 18, padding: "28px 28px 24px", border: `1px solid ${T.borderLight}`, boxShadow: "0 20px 60px rgba(0,0,0,.5)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>Create New Sub-Admin App</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 20, padding: "2px 6px", borderRadius: 6 }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: T.mutedLight, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>App Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Team Alpha" style={inp()} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: T.mutedLight, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>App ID</label>
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <input type="text" value={appId} onChange={e => setAppId(e.target.value)}
                style={{ ...inp(), marginTop: 0, flex: 1, fontFamily: "monospace", fontSize: 13 }} />
              <button type="button" onClick={() => setAppId(generateAppId())}
                style={{ padding: "11px 14px", borderRadius: 10, background: T.borderLight, border: "none", color: T.text, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>↺</button>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: T.mutedLight, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Login PIN</label>
            <input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="min 4 characters" style={inp()} />
          </div>
          {err && <div style={{ color: T.red, fontSize: 13, marginBottom: 10, background: T.red + "15", padding: "8px 12px", borderRadius: 8 }}>{err}</div>}
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: "12px 0", borderRadius: 10, background: T.borderLight, border: "none", color: T.text, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={loading}
              style={{ flex: 1, padding: "12px 0", borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", color: "#fff", fontWeight: 700, cursor: loading ? "default" : "pointer", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>
              {loading ? "Creating…" : "Create App"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────── Change Master PIN Modal ─────────── */
function ChangePinModal({ masterPin, onClose, onChanged }: { masterPin: string; onClose: () => void; onChanged: (p: string) => void }) {
  const [currentPin, setCurrentPin] = useState(masterPin);
  const [newPin, setNewPin] = useState("");
  const [newPin2, setNewPin2] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPin.length < 4) { setErr("New PIN must be at least 4 characters"); return; }
    if (newPin !== newPin2) { setErr("PINs do not match"); return; }
    setErr(""); setLoading(true);
    try {
      const r = await apiFetch("/api/admin/master-pin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPin, newPin }),
      });
      if (!r.ok) { const j = await r.json() as { error?: string }; setErr(j.error ?? "Failed"); return; }
      onChanged(newPin);
    } catch { setErr("Network error"); }
    finally { setLoading(false); }
  }

  const inp: React.CSSProperties = {
    width: "100%", marginTop: 6, padding: "11px 14px", borderRadius: 10,
    border: `1.5px solid ${T.borderLight}`, background: T.inputBg,
    color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: "100%", maxWidth: 380, background: T.card, borderRadius: 18, padding: "28px 28px 24px", border: `1px solid ${T.borderLight}`, boxShadow: "0 20px 60px rgba(0,0,0,.5)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>Change Master PIN</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 20, padding: "2px 6px", borderRadius: 6 }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          {[
            { label: "Current PIN", val: currentPin, set: setCurrentPin },
            { label: "New PIN", val: newPin, set: setNewPin },
            { label: "Confirm New PIN", val: newPin2, set: setNewPin2 },
          ].map(({ label, val, set }) => (
            <div key={label} style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: T.mutedLight, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{label}</label>
              <input type="password" value={val} onChange={e => set(e.target.value)} style={inp} />
            </div>
          ))}
          {err && <div style={{ color: T.red, fontSize: 13, marginBottom: 10, background: T.red + "15", padding: "8px 12px", borderRadius: 8 }}>{err}</div>}
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: "12px 0", borderRadius: 10, background: T.borderLight, border: "none", color: T.text, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={loading}
              style={{ flex: 1, padding: "12px 0", borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", color: "#fff", fontWeight: 700, cursor: loading ? "default" : "pointer" }}>
              {loading ? "Saving…" : "Change PIN"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────── Edit App Modal ─────────── */
function EditAppModal({ app, masterPin, onClose, onUpdated }: { app: App; masterPin: string; onClose: () => void; onUpdated: (a: App) => void }) {
  const [name, setName] = useState(app.name);
  const [pin, setPin] = useState(app.pin);
  const [loginLimit, setLoginLimit] = useState(app.loginLimit ?? 5);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setErr("Name required"); return; }
    if (pin.length < 4) { setErr("PIN must be at least 4 characters"); return; }
    setErr(""); setLoading(true);
    try {
      const r = await apiFetch(`/api/master/apps/${encodeURIComponent(app.appId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-master-pin": masterPin },
        body: JSON.stringify({ name: name.trim(), pin, loginLimit }),
      });
      if (!r.ok) { const j = await r.json() as { error?: string }; setErr(j.error ?? "Failed"); return; }
      const updated = await r.json() as App;
      onUpdated({ ...updated, activeSessions: app.activeSessions });
    } catch { setErr("Network error"); }
    finally { setLoading(false); }
  }

  const inp: React.CSSProperties = {
    width: "100%", marginTop: 6, padding: "11px 14px", borderRadius: 10,
    border: `1.5px solid ${T.borderLight}`, background: T.inputBg,
    color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: "100%", maxWidth: 420, background: T.card, borderRadius: 18, padding: "28px 28px 24px", border: `1px solid ${T.borderLight}`, boxShadow: "0 20px 60px rgba(0,0,0,.5)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>Edit App</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 20, padding: "2px 6px", borderRadius: 6 }}>✕</button>
        </div>
        <div style={{ fontSize: 12, color: T.muted, marginBottom: 22, fontFamily: "monospace", background: T.inputBg, padding: "5px 10px", borderRadius: 6, display: "inline-block" }}>{app.appId}</div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: T.mutedLight, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>App Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} style={inp} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: T.mutedLight, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Login PIN</label>
            <input type="text" value={pin} onChange={e => setPin(e.target.value)} style={{ ...inp, fontFamily: "monospace" }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: T.mutedLight, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Max Concurrent Logins</label>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10 }}>
              <input
                type="range" min={1} max={100} step={1}
                value={loginLimit}
                onChange={e => setLoginLimit(Number(e.target.value))}
                style={{ flex: 1, accentColor: T.accent, cursor: "pointer", height: 4 }}
              />
              <div style={{ minWidth: 48, textAlign: "center", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", borderRadius: 8, padding: "6px 10px", fontWeight: 900, fontSize: 18, lineHeight: 1 }}>
                {loginLimit}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.muted, marginTop: 4, paddingRight: 62 }}>
              <span>1</span><span>25</span><span>50</span><span>75</span><span>100</span>
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>
              {loginLimit === 1 ? "Sirf 1 banda ek time pe logged in ho sakta hai" : `Max ${loginLimit} log ek saath logged in ho sakte hain`}
            </div>
          </div>
          {err && <div style={{ color: T.red, fontSize: 13, marginBottom: 10, background: T.red + "15", padding: "8px 12px", borderRadius: 8 }}>{err}</div>}
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: "12px 0", borderRadius: 10, background: T.borderLight, border: "none", color: T.text, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={loading}
              style={{ flex: 1, padding: "12px 0", borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", color: "#fff", fontWeight: 700, cursor: loading ? "default" : "pointer" }}>
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────── App Card ─────────── */
function AppCard({
  app, masterPin,
  onEdit, onDelete, onToggle, onLogoutAll, onCopyUrl,
  copyMsg, deletingId, togglingId, logoutAllId,
}: {
  app: App; masterPin: string;
  onEdit: (a: App) => void;
  onDelete: (a: App) => void;
  onToggle: (a: App) => void;
  onLogoutAll: (a: App) => void;
  onCopyUrl: (a: App) => void;
  copyMsg: Record<string, string>;
  deletingId: string | null;
  togglingId: string | null;
  logoutAllId: string | null;
}) {
  const isActive = app.status === "active";
  const sessionsOver = (app.activeSessions ?? 0) >= app.loginLimit;
  const dateStr = new Date(app.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div style={{
      background: T.card,
      borderRadius: 14,
      border: `1px solid ${T.borderLight}`,
      overflow: "hidden",
      transition: "box-shadow 0.2s",
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(99,102,241,0.1)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
    >
      {/* Card top bar — status indicator */}
      <div style={{ height: 3, background: isActive ? `linear-gradient(90deg,${T.green},#4ade80)` : T.red, opacity: 0.8 }} />

      <div style={{ padding: "16px 18px" }}>
        {/* Top row: name + status badge */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.text, wordBreak: "break-word" }}>{app.name}</div>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 99,
                color: isActive ? T.green : T.red,
                background: (isActive ? T.green : T.red) + "20",
                border: `1px solid ${(isActive ? T.green : T.red)}44`,
              }}>
                {isActive ? "● Active" : "○ Disabled"}
              </span>
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>Created {dateStr}</div>
          </div>
        </div>

        {/* Info rows */}
        <div style={{
          background: T.inputBg, borderRadius: 10, padding: "10px 14px",
          marginBottom: 14, display: "flex", flexDirection: "column", gap: 8,
        }}>
          {/* App ID row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", minWidth: 34 }}>ID</span>
            <span style={{ fontSize: 12, color: T.accentLight, fontFamily: "monospace", fontWeight: 600, flex: 1, wordBreak: "break-all" }}>{app.appId}</span>
            <CopyBtn value={app.appId} label="ID" />
          </div>
          {/* PIN row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", minWidth: 34 }}>PIN</span>
            <span style={{ fontSize: 12, color: T.text, fontFamily: "monospace", letterSpacing: 3, flex: 1 }}>{app.pin}</span>
            <CopyBtn value={app.pin} label="PIN" />
          </div>
          {/* Sessions row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", minWidth: 34 }}>SESS</span>
            <span style={{ fontSize: 12, color: T.muted }}>
              Active:{" "}
              <span style={{ color: sessionsOver ? T.red : T.green, fontWeight: 700 }}>
                {app.activeSessions ?? 0}/{app.loginLimit}
              </span>
              <span style={{ fontSize: 10, color: T.muted, marginLeft: 6 }}>max {app.loginLimit}</span>
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {/* Copy URL */}
          <button onClick={() => onCopyUrl(app)}
            style={{ padding: "7px 13px", borderRadius: 8, background: copyMsg[app.appId] ? T.green + "22" : T.borderLight, border: `1px solid ${copyMsg[app.appId] ? T.green + "44" : "transparent"}`, color: copyMsg[app.appId] ? T.green : T.mutedLight, fontWeight: 600, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
            {copyMsg[app.appId] || "📋 URL"}
          </button>

          {/* Edit */}
          <button onClick={() => onEdit(app)}
            style={{ padding: "7px 13px", borderRadius: 8, background: T.accentGlow, border: `1px solid ${T.accent}33`, color: T.accent, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
            ✏️ Edit
          </button>

          {/* Logout All */}
          <button onClick={() => onLogoutAll(app)} disabled={logoutAllId === app.appId}
            style={{ padding: "7px 13px", borderRadius: 8, background: T.orange + "18", border: `1px solid ${T.orange}33`, color: T.orange, fontWeight: 700, fontSize: 12, cursor: logoutAllId === app.appId ? "wait" : "pointer", whiteSpace: "nowrap", opacity: logoutAllId === app.appId ? 0.5 : 1 }}>
            {logoutAllId === app.appId ? "…" : "🔓 Logout All"}
          </button>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Toggle */}
          <button onClick={() => onToggle(app)} disabled={togglingId === app.appId}
            style={{ padding: "8px 18px", borderRadius: 9, background: isActive ? T.yellow + "18" : T.green + "18", border: `1.5px solid ${isActive ? T.yellow : T.green}`, color: isActive ? T.yellow : T.green, fontWeight: 800, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
            {togglingId === app.appId ? "…" : isActive ? "⏸ Disable" : "▶ Enable"}
          </button>

          {/* Delete */}
          <button onClick={() => onDelete(app)} disabled={deletingId === app.appId}
            style={{ padding: "8px 18px", borderRadius: 9, background: T.red + "18", border: `1.5px solid ${T.red}`, color: T.red, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
            {deletingId === app.appId ? "…" : "🗑️"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Dashboard ─────────── */
function Dashboard({ masterPin, onLogout, onPinChanged }: { masterPin: string; onLogout: () => void; onPinChanged: (p: string) => void }) {
  const [appList, setAppList] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showChangePin, setShowChangePin] = useState(false);
  const [editApp, setEditApp] = useState<App | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [copyMsg, setCopyMsg] = useState<Record<string, string>>({});
  const [logoutAllId, setLogoutAllId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Sort by createdAt descending — newest first
  const sortedApps = [...appList].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const fetchApps = useCallback(async () => {
    try {
      const r = await apiFetch("/api/master/apps", { headers: { "x-master-pin": masterPin } });
      if (r.status === 401) { onLogout(); return; }
      if (!r.ok) return;
      setAppList(await r.json() as App[]);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [masterPin, onLogout]);

  useEffect(() => { void fetchApps(); }, [fetchApps]);

  async function toggleStatus(app: App) {
    setTogglingId(app.appId);
    const newStatus = app.status === "active" ? "disabled" : "active";
    try {
      await apiFetch(`/api/master/apps/${encodeURIComponent(app.appId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-master-pin": masterPin },
        body: JSON.stringify({ status: newStatus }),
      });
      setAppList(prev => prev.map(a => a.appId === app.appId ? { ...a, status: newStatus } : a));
    } catch { /* ignore */ } finally { setTogglingId(null); }
  }

  async function deleteApp(app: App) {
    if (!confirm(`Delete "${app.name}"?\nThis cannot be undone.`)) return;
    setDeletingId(app.appId);
    try {
      await apiFetch(`/api/master/apps/${encodeURIComponent(app.appId)}`, {
        method: "DELETE",
        headers: { "x-master-pin": masterPin },
      });
      setAppList(prev => prev.filter(a => a.appId !== app.appId));
    } catch { /* ignore */ } finally { setDeletingId(null); }
  }

  async function logoutAll(app: App) {
    if (!confirm(`"${app.name}" ke sabhi logged-in users ko logout karein?`)) return;
    setLogoutAllId(app.appId);
    try {
      await apiFetch(`/api/admin/sessions?appId=${encodeURIComponent(app.appId)}`, { method: "DELETE" });
      setAppList(prev => prev.map(a => a.appId === app.appId ? { ...a, activeSessions: 0 } : a));
    } catch { /* ignore */ } finally { setLogoutAllId(null); }
  }

  function copyUrl(app: App) {
    const url = `${window.location.origin}/preview/dashboard/WebDashboard?appId=${app.appId}`;
    copyToClipboard(url).then(() => {
      setCopyMsg(p => ({ ...p, [app.appId]: "✓ Copied!" }));
      setTimeout(() => setCopyMsg(p => ({ ...p, [app.appId]: "" })), 2000);
    });
  }

  const filteredApps = search.trim() === ""
    ? sortedApps
    : sortedApps.filter(a =>
        a.appId.toLowerCase().includes(search.trim().toLowerCase()) ||
        a.name.toLowerCase().includes(search.trim().toLowerCase())
      );

  const activeCount = appList.filter(a => a.status === "active").length;
  const disabledCount = appList.length - activeCount;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "system-ui", color: T.text }}>

      {/* ── Header ── */}
      <div style={{
        background: T.headerBg,
        borderBottom: `1px solid ${T.border}`,
        padding: "0 20px",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{
          maxWidth: 960, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 60, gap: 12,
        }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, flexShrink: 0,
            }}>🤖</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: T.text, letterSpacing: -0.3, lineHeight: 1.1 }}>MR ROBOT</div>
              <div style={{ fontSize: 10, color: T.accent, fontWeight: 700, letterSpacing: 0.5 }}>Master Admin</div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => setShowChangePin(true)}
              style={{ padding: "7px 14px", borderRadius: 8, background: T.borderLight, border: "none", color: T.text, fontWeight: 600, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
              🔑 <span style={{ display: "inline" }}>PIN</span>
            </button>
            <button onClick={onLogout}
              style={{ padding: "7px 14px", borderRadius: 8, background: "transparent", border: `1px solid ${T.border}`, color: T.muted, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>

        {/* Stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 12, marginBottom: 24,
        }}>
          {[
            { label: "Total Apps", val: appList.length, color: T.accent, icon: "📦" },
            { label: "Active", val: activeCount, color: T.green, icon: "✅" },
            { label: "Disabled", val: disabledCount, color: T.red, icon: "🚫" },
          ].map(({ label, val, color, icon }) => (
            <div key={label} style={{
              background: T.card, borderRadius: 12, padding: "16px 18px",
              border: `1px solid ${T.borderLight}`,
              boxShadow: `0 0 0 1px ${color}18 inset`,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <span style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>{label}</span>
              </div>
              <div style={{ fontSize: 30, fontWeight: 900, color }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Apps header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>Sub-Admin Apps</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Sorted by newest first</div>
          </div>
          <button onClick={() => setShowCreate(true)}
            style={{
              padding: "10px 20px", borderRadius: 10,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              border: "none", color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer",
              boxShadow: "0 4px 14px rgba(99,102,241,0.35)", whiteSpace: "nowrap",
            }}>
            + New App
          </button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 14, position: "relative" }}>
          <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: T.muted, pointerEvents: "none" }}>🔍</span>
          <input
            type="text"
            placeholder="Search by App ID or name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", boxSizing: "border-box", padding: "10px 36px 10px 38px",
              borderRadius: 10, background: T.card, border: `1px solid ${T.borderLight}`,
              color: T.text, fontSize: 13, outline: "none", fontFamily: "monospace",
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 16, lineHeight: 1 }}>✕</button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: T.muted }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>⏳</div>
            Loading apps…
          </div>
        ) : filteredApps.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: T.muted, background: T.card, borderRadius: 14, border: `1px solid ${T.borderLight}` }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>{search ? "🔍" : "📭"}</div>
            {search ? `"${search}" se koi app nahi mila.` : 'No apps yet. Click "+ New App" to create one.'}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredApps.map(app => (
              <AppCard
                key={app.appId}
                app={app}
                masterPin={masterPin}
                onEdit={setEditApp}
                onDelete={deleteApp}
                onToggle={toggleStatus}
                onLogoutAll={logoutAll}
                onCopyUrl={copyUrl}
                copyMsg={copyMsg}
                deletingId={deletingId}
                togglingId={togglingId}
                logoutAllId={logoutAllId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateAppModal masterPin={masterPin} onClose={() => setShowCreate(false)}
          onCreated={a => { setAppList(prev => [a, ...prev]); setShowCreate(false); }} />
      )}
      {showChangePin && (
        <ChangePinModal masterPin={masterPin} onClose={() => setShowChangePin(false)}
          onChanged={p => { onPinChanged(p); setShowChangePin(false); }} />
      )}
      {editApp && (
        <EditAppModal app={editApp} masterPin={masterPin} onClose={() => setEditApp(null)}
          onUpdated={a => { setAppList(prev => prev.map(x => x.appId === a.appId ? a : x)); setEditApp(null); }} />
      )}

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 480px) {
          .mr-stats-grid { grid-template-columns: repeat(3,1fr) !important; }
        }
      `}</style>
    </div>
  );
}

/* ─────────── Root Export ─────────── */
export default function MainAdminPanel() {
  const [masterPin, setMasterPin] = useState<string | null>(() => {
    return sessionStorage.getItem("mrrobot_master_auth") ?? null;
  });

  function handleAuth(pin: string) {
    sessionStorage.setItem("mrrobot_master_auth", pin);
    setMasterPin(pin);
  }

  function handleLogout() {
    sessionStorage.removeItem("mrrobot_master_auth");
    setMasterPin(null);
  }

  function handlePinChanged(newPin: string) {
    sessionStorage.setItem("mrrobot_master_auth", newPin);
    setMasterPin(newPin);
    alert("Master PIN changed successfully!");
  }

  if (!masterPin) return <MasterLogin onAuth={handleAuth} />;
  return <Dashboard masterPin={masterPin} onLogout={handleLogout} onPinChanged={handlePinChanged} />;
}
