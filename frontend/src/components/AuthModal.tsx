"use client";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";

interface Props { onClose: () => void; }

export default function AuthModal({ onClose }: Props) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(""); setBusy(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(name, email, password);
      onClose();
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
    } finally { setBusy(false); }
  }

  return (
    /* Backdrop */
    <div onClick={onClose} style={{
      position:"fixed", inset:0, zIndex:1000,
      background:"rgba(0,0,0,0.65)", backdropFilter:"blur(4px)",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"16px",
    }}>
      {/* Modal */}
      <div onClick={e => e.stopPropagation()} style={{
        background:"var(--bg-surface)", border:"1px solid var(--border-bright)",
        borderRadius:"var(--radius-2xl)", padding:"clamp(24px,5vw,40px)",
        width:"100%", maxWidth:420,
        boxShadow:"0 24px 64px rgba(0,0,0,0.6)",
      }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <div>
            <h2 style={{
              fontFamily:"var(--font-sans)", fontWeight:800,
              fontSize:"1.3rem", letterSpacing:"-0.03em", color:"var(--text-primary)",
            }}>
              {mode === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p style={{
              fontFamily:"var(--font-mono)", fontSize:"0.72rem",
              color:"var(--text-muted)", marginTop:4,
            }}>
              {mode === "login"
                ? "Sign in to access your portfolio & alerts"
                : "Free account — no credit card required"}
            </p>
          </div>
          <button onClick={onClose} style={{
            background:"none", border:"none", cursor:"pointer",
            color:"var(--text-muted)", fontSize:"1.4rem", lineHeight:1,
            padding:"4px",
          }}>×</button>
        </div>

        {/* Mode tabs */}
        <div style={{ display:"flex", gap:4, background:"var(--bg-elevated)", borderRadius:"var(--radius-md)", padding:3, marginBottom:20 }}>
          {(["login","register"] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
              flex:1, padding:"8px 12px", borderRadius:"var(--radius-sm)",
              border:"none", cursor:"pointer", fontFamily:"var(--font-sans)",
              fontSize:"0.8rem", fontWeight:600, transition:"all 0.15s",
              background: mode === m ? "var(--bg-surface)" : "transparent",
              color: mode === m ? "var(--text-primary)" : "var(--text-muted)",
              boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.2)" : "none",
            }}>
              {m === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {mode === "register" && (
            <div>
              <label style={{ display:"block", fontFamily:"var(--font-mono)", fontSize:"0.65rem", color:"var(--text-muted)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:5 }}>Full Name</label>
              <input className="qti-input" placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div>
            <label style={{ display:"block", fontFamily:"var(--font-mono)", fontSize:"0.65rem", color:"var(--text-muted)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:5 }}>Email</label>
            <input className="qti-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key==="Enter" && submit()} />
          </div>
          <div>
            <label style={{ display:"block", fontFamily:"var(--font-mono)", fontSize:"0.65rem", color:"var(--text-muted)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:5 }}>Password</label>
            <input className="qti-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==="Enter" && submit()} />
          </div>

          {error && (
            <div style={{
              background:"var(--red-dim)", border:"1px solid rgba(239,68,68,0.3)",
              borderRadius:"var(--radius-md)", padding:"10px 14px",
              fontFamily:"var(--font-mono)", fontSize:"0.78rem", color:"var(--red-bright)",
            }}>
              ⚠ {error}
            </div>
          )}

          <button className="qti-btn" onClick={submit} disabled={busy} style={{ width:"100%", padding:"11px", fontSize:"0.82rem", marginTop:4 }}>
            {busy ? "Please wait…" : mode === "login" ? "Sign In →" : "Create Account →"}
          </button>
        </div>

        {/* Benefits list */}
        <div style={{
          marginTop:20, padding:"14px 16px",
          background:"var(--gold-dim)", border:"1px solid var(--gold-dim)",
          borderRadius:"var(--radius-md)",
        }}>
          <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.65rem", color:"var(--gold)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8 }}>
            Members get
          </p>
          {[
            "💼 Portfolio saved across sessions",
            "🔔 Price alerts that persist",
            "📧 Email market updates & signals",
            "📊 Subscription feeds for watchlists",
          ].map(b => (
            <p key={b} style={{ fontFamily:"var(--font-sans)", fontSize:"0.78rem", color:"var(--text-secondary)", marginBottom:4 }}>{b}</p>
          ))}
        </div>

        <p style={{
          fontFamily:"var(--font-mono)", fontSize:"0.62rem",
          color:"var(--text-muted)", textAlign:"center", marginTop:16, lineHeight:1.5,
        }}>
          By continuing, you agree to our Terms of Use and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
