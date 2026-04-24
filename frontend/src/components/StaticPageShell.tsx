"use client";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";

function SunIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>;
}
function MoonIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
}

export default function StaticPageShell({ children }: { children: React.ReactNode }) {
  const { theme, toggle } = useTheme();

  return (
    <div className="page-wrap">
      {/* Simple nav — no auth prop needed */}
      <nav style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"10px 16px", marginBottom:16,
        background:"var(--bg-surface)", border:"1px solid var(--border)",
        borderRadius:"var(--radius-2xl)", boxShadow:"var(--shadow-card)",
        transition:"background 0.2s",
      }}>
        <Link href="/" style={{
          fontFamily:"var(--font-sans)", fontWeight:800,
          fontSize:"1.05rem", letterSpacing:"-0.03em",
          color:"var(--text-primary)", textDecoration:"none",
        }}>
          Quantum <span style={{ color:"var(--gold)" }}>Trade</span>
          <span style={{ color:"var(--text-secondary)", fontWeight:400 }}> Intelligence</span>
        </Link>

        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Link href="/" style={{
            fontFamily:"var(--font-mono)", fontSize:"0.72rem",
            color:"var(--text-secondary)", textDecoration:"none",
            padding:"6px 12px", borderRadius:"var(--radius-md)",
            border:"1px solid var(--border-bright)",
            transition:"color 0.15s, border-color 0.15s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color="var(--gold)"; (e.currentTarget as HTMLElement).style.borderColor="var(--gold)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color="var(--text-secondary)"; (e.currentTarget as HTMLElement).style.borderColor="var(--border-bright)"; }}
          >
            ← Terminal
          </Link>

          <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </nav>

      {children}
    </div>
  );
}
