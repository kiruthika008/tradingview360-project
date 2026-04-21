"use client";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [time, setTime] = useState("");

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
      padding: "14px 24px",
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: "18px",
      marginBottom: "20px",
      boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
    }}>
      {/* Logo */}
      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.2rem", letterSpacing:"-0.5px" }}>
        Quantum <span style={{ color:"var(--gold)" }}>Trade</span> Intelligence
      </div>

      {/* Centre badge */}
      <div style={{
        fontFamily:"'DM Mono',monospace", fontSize:"0.68rem",
        background:"var(--gold-dim)", color:"var(--gold)",
        border:"1px solid rgba(212,168,67,0.3)", borderRadius:"20px",
        padding:"3px 12px", letterSpacing:"0.06em",
      }}>
        TERMINAL v2.0
      </div>

      {/* Right pill */}
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.72rem", color:"var(--text-muted)" }}>
          EST {time}
        </span>
        <div style={{
          display:"flex", alignItems:"center", gap:6,
          fontSize:"0.76rem", color:"var(--green)",
          background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.2)",
          borderRadius:"20px", padding:"4px 12px",
        }}>
          <span style={{
            width:6, height:6, borderRadius:"50%",
            background:"var(--green)", display:"inline-block",
          }} className="dot-pulse" />
          Live
        </div>
      </div>
    </nav>
  );
}
