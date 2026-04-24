"use client";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthProvider";

function SunIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>;
}
function MoonIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
}

interface Props { onShowAuth: () => void; }

export default function Navbar({ onShowAuth }: Props) {
  const [time, setTime] = useState("");
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { timeZone:"America/New_York", hour12:true }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <nav style={{
      display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8,
      padding:"10px 16px",
      background:"var(--bg-surface)", border:"1px solid var(--border)",
      borderRadius:"var(--radius-2xl)", marginBottom:16,
      boxShadow:"var(--shadow-card)", transition:"background 0.2s",
    }}>
      {/* Logo */}
      <div style={{ fontFamily:"var(--font-sans)", fontWeight:800, fontSize:"1.05rem", letterSpacing:"-0.03em", color:"var(--text-primary)", flexShrink:0 }}>
        Quantum <span style={{ color:"var(--gold)" }}>Trade</span>
        <span style={{ color:"var(--text-secondary)", fontWeight:400 }}> Intelligence</span>
      </div>

      {/* Centre — hidden on small mobile */}
      <div className="nav-badge" style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.6rem", background:"var(--gold-dim)", color:"var(--gold)", border:"1px solid var(--gold-dim)", borderRadius:"20px", padding:"3px 9px", letterSpacing:"0.08em" }}>
          TERMINAL v2.0
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"0.68rem", color:"var(--green-bright)", background:"var(--green-dim)", border:"1px solid rgba(34,197,94,0.18)", borderRadius:"20px", padding:"3px 9px", fontFamily:"var(--font-mono)" }}>
          <span className="dot-pulse" style={{ width:5, height:5, borderRadius:"50%", background:"var(--green-bright)", display:"inline-block", flexShrink:0 }} />
          Live
        </div>
      </div>

      {/* Right controls */}
      <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
        {/* EST time — hide on small screens */}
        <span className="nav-time" style={{ fontFamily:"var(--font-mono)", fontSize:"0.65rem", color:"var(--text-muted)" }}>EST {time}</span>

        {/* Theme toggle */}
        <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          <span style={{ display:"none" }}>{theme === "dark" ? "Light" : "Dark"}</span>
          <style>{`@media(min-width:480px){.theme-toggle span{display:inline}}`}</style>
        </button>

        {/* Auth button */}
        {user ? (
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{
              fontFamily:"var(--font-mono)", fontSize:"0.68rem", color:"var(--text-secondary)",
              background:"var(--bg-elevated)", border:"1px solid var(--border-bright)",
              borderRadius:"20px", padding:"4px 10px",
              maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
            }}>
              👤 {user.name.split(" ")[0]}
            </div>
            <button className="qti-btn-ghost" onClick={logout} style={{ padding:"5px 10px", fontSize:"0.68rem" }}>
              Sign Out
            </button>
          </div>
        ) : (
          <button className="qti-btn" onClick={onShowAuth} style={{ padding:"6px 14px", fontSize:"0.72rem" }}>
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
