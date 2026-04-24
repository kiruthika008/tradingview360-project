"use client";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthProvider";
import { NavMarketPills } from "@/components/MarketStatus";

function SunIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>;
}
function MoonIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
}

interface Props { onShowAuth?: () => void; }

export default function Navbar({ onShowAuth = () => {} }: Props) {
  const [time, setTime] = useState({ est:"", ist:"" });
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();

  useEffect(() => {
    const tick = () => setTime({
      est: new Date().toLocaleTimeString("en-US", { timeZone:"America/New_York", hour12:true, hour:"2-digit", minute:"2-digit" }),
      ist: new Date().toLocaleTimeString("en-US", { timeZone:"Asia/Kolkata",     hour12:true, hour:"2-digit", minute:"2-digit" }),
    });
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);

  return (
    <nav style={{
      background:"var(--bg-surface)", border:"1px solid var(--border)",
      borderRadius:"var(--radius-2xl)", marginBottom:10,
      boxShadow:"var(--shadow-card)", transition:"background 0.2s",
      overflow:"hidden",
    }}>
      {/* ── Top row: logo + controls ── */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        flexWrap:"wrap", gap:8, padding:"10px 16px",
        borderBottom:"1px solid var(--border)",
      }}>
        {/* Logo */}
        <div style={{
          fontFamily:"var(--font-sans)", fontWeight:800,
          fontSize:"1.05rem", letterSpacing:"-0.03em",
          color:"var(--text-primary)", flexShrink:0,
        }}>
          Quantum <span style={{ color:"var(--gold)" }}>Trade</span>
          <span style={{ color:"var(--text-secondary)", fontWeight:400 }}> Intelligence</span>
        </div>

        {/* Centre badges — hidden on small mobile via CSS */}
        <div className="nav-badge" style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{
            fontFamily:"var(--font-mono)", fontSize:"0.6rem",
            background:"var(--gold-dim)", color:"var(--gold)",
            border:"1px solid var(--gold-dim)", borderRadius:"20px",
            padding:"3px 9px", letterSpacing:"0.08em",
          }}>
            TERMINAL v3.0
          </div>
        </div>

        {/* Right controls */}
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          {/* Times — hidden on small mobile */}
          <div className="nav-time" style={{ display:"flex", gap:10 }}>
            <span style={{ fontFamily:"var(--font-mono)", fontSize:"0.62rem", color:"var(--text-muted)" }}>
              EST {time.est}
            </span>
            <span style={{ fontFamily:"var(--font-mono)", fontSize:"0.62rem", color:"var(--text-muted)" }}>
              IST {time.ist}
            </span>
          </div>

          {/* Theme toggle */}
          <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            <span style={{ display:"none" }}>
              {theme === "dark" ? "Light" : "Dark"}
            </span>
            <style>{`@media(min-width:480px){.theme-toggle span{display:inline}}`}</style>
          </button>

          {/* Auth */}
          {user ? (
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{
                fontFamily:"var(--font-mono)", fontSize:"0.68rem",
                color:"var(--text-secondary)",
                background:"var(--bg-elevated)", border:"1px solid var(--border-bright)",
                borderRadius:"20px", padding:"4px 10px",
                maxWidth:110, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
              }}>
                👤 {user.name.split(" ")[0]}
              </div>
              <button className="qti-btn-ghost" onClick={logout}
                style={{ padding:"5px 10px", fontSize:"0.68rem" }}>
                Sign Out
              </button>
            </div>
          ) : (
            <button className="qti-btn" onClick={onShowAuth}
              style={{ padding:"6px 14px", fontSize:"0.72rem" }}>
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* ── Bottom row: compact market status pills ── */}
      <div style={{
        padding:"8px 16px",
        background:"var(--bg-elevated)",
        display:"flex", alignItems:"center", gap:10, flexWrap:"wrap",
      }}>
        <span style={{
          fontFamily:"var(--font-mono)", fontSize:"0.58rem",
          color:"var(--text-muted)", letterSpacing:"0.1em", textTransform:"uppercase",
          flexShrink:0,
        }}>
          Markets:
        </span>
        <NavMarketPills />
      </div>
    </nav>
  );
}
