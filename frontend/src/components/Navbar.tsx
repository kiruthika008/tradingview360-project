"use client";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";

function SunIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

export default function Navbar() {
  const [time, setTime] = useState("");
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour12: true }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <nav style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 20px",
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-2xl)",
      marginBottom: "20px",
      boxShadow: "var(--shadow-card)",
      transition: "background 0.2s, border-color 0.2s",
    }}>

      {/* Logo */}
      <div style={{
        fontFamily:"var(--font-sans)", fontWeight:800,
        fontSize:"1.1rem", letterSpacing:"-0.03em",
        color:"var(--text-primary)", flexShrink:0,
      }}>
        Quantum <span style={{ color:"var(--gold)" }}>Trade</span>
        <span style={{ color:"var(--text-secondary)", fontWeight:400 }}> Intelligence</span>
      </div>

      {/* Centre badges */}
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{
          fontFamily:"var(--font-mono)", fontSize:"0.61rem",
          background:"var(--gold-dim)", color:"var(--gold)",
          border:"1px solid var(--gold-dim)", borderRadius:"20px",
          padding:"3px 10px", letterSpacing:"0.08em", fontWeight:500,
        }}>
          TERMINAL v2.0
        </div>
        <div style={{
          display:"flex", alignItems:"center", gap:5,
          fontSize:"0.7rem", color:"var(--green-bright)",
          background:"var(--green-dim)", border:"1px solid rgba(34,197,94,0.18)",
          borderRadius:"20px", padding:"3px 10px",
          fontFamily:"var(--font-mono)",
        }}>
          <span style={{
            width:5, height:5, borderRadius:"50%",
            background:"var(--green-bright)", display:"inline-block", flexShrink:0,
          }} className="dot-pulse" />
          Live
        </div>
      </div>

      {/* Right — time + theme toggle */}
      <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
        {time && (
          <span style={{
            fontFamily:"var(--font-mono)", fontSize:"0.66rem",
            color:"var(--text-muted)", letterSpacing:"0.04em",
          }}>
            EST {time}
          </span>
        )}
        <button
          className="theme-toggle"
          onClick={toggle}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </div>
    </nav>
  );
}
