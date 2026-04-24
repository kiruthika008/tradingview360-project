"use client";
import { useState, useEffect } from "react";

// ── Market session definitions ────────────────────────────────────────
// All times in local market timezone
interface MarketDef {
  id: string;
  label: string;
  flag: string;
  timezone: string;
  openHour: number;   // 24h local time
  openMin: number;
  closeHour: number;
  closeMin: number;
  preOpenHour?: number;  // pre-market start
  preOpenMin?: number;
  afterCloseHour?: number;
  afterCloseMin?: number;
  weekdays: number[];   // 1=Mon … 5=Fri (0=Sun,6=Sat closed)
  currency: string;
}

const MARKETS: MarketDef[] = [
  {
    id: "NYSE",
    label: "NYSE / NASDAQ",
    flag: "🇺🇸",
    timezone: "America/New_York",
    openHour: 9,  openMin: 30,
    closeHour: 16, closeMin: 0,
    preOpenHour: 4,  preOpenMin: 0,
    afterCloseHour: 20, afterCloseMin: 0,
    weekdays: [1,2,3,4,5],
    currency: "USD",
  },
  {
    id: "TSX",
    label: "TSX",
    flag: "🇨🇦",
    timezone: "America/Toronto",
    openHour: 9,  openMin: 30,
    closeHour: 16, closeMin: 0,
    preOpenHour: 7,  preOpenMin: 0,
    afterCloseHour: 17, afterCloseMin: 30,
    weekdays: [1,2,3,4,5],
    currency: "CAD",
  },
  {
    id: "NSE",
    label: "NSE / BSE",
    flag: "🇮🇳",
    timezone: "Asia/Kolkata",
    openHour: 9,  openMin: 15,
    closeHour: 15, closeMin: 30,
    preOpenHour: 9,  preOpenMin: 0,
    weekdays: [1,2,3,4,5],
    currency: "INR",
  },
];

type SessionState = "pre" | "open" | "after" | "closed";

interface MarketState {
  id: string;
  label: string;
  flag: string;
  currency: string;
  session: SessionState;
  localTime: string;
  localDate: string;
  minutesToNext: number;
  nextEvent: string;
}

function getMarketState(m: MarketDef, now: Date): MarketState {
  const localStr  = now.toLocaleString("en-US", { timeZone: m.timezone, hour12: false });
  const localDate = new Date(localStr);
  const dayOfWeek = localDate.getDay(); // 0=Sun,6=Sat
  const h = localDate.getHours();
  const min = localDate.getMinutes();
  const totalMin = h * 60 + min;

  const openTotal      = m.openHour  * 60 + m.openMin;
  const closeTotal     = m.closeHour * 60 + m.closeMin;
  const preOpenTotal   = (m.preOpenHour  ?? m.openHour)  * 60 + (m.preOpenMin  ?? m.openMin);
  const afterTotal     = (m.afterCloseHour ?? m.closeHour) * 60 + (m.afterCloseMin ?? m.closeMin);

  const isWeekday = m.weekdays.includes(dayOfWeek);

  const timeStr = now.toLocaleTimeString("en-US", {
    timeZone: m.timezone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
  });
  const dateStr = now.toLocaleDateString("en-US", {
    timeZone: m.timezone, weekday: "short", month: "short", day: "numeric",
  });

  let session: SessionState = "closed";
  let minutesToNext = 0;
  let nextEvent = "";

  if (!isWeekday) {
    // Weekend — find minutes to Monday open
    const daysUntilMon = dayOfWeek === 0 ? 1 : 2; // Sun→1, Sat→2
    minutesToNext = daysUntilMon * 24 * 60 - totalMin + openTotal;
    nextEvent = "Opens Mon";
    session = "closed";
  } else if (totalMin < preOpenTotal) {
    session = "closed";
    minutesToNext = preOpenTotal - totalMin;
    nextEvent = m.preOpenHour != null ? "Pre-market" : "Opens";
  } else if (totalMin < openTotal) {
    session = "pre";
    minutesToNext = openTotal - totalMin;
    nextEvent = "Regular open";
  } else if (totalMin < closeTotal) {
    session = "open";
    minutesToNext = closeTotal - totalMin;
    nextEvent = "Closes";
  } else if (m.afterCloseHour != null && totalMin < afterTotal) {
    session = "after";
    minutesToNext = afterTotal - totalMin;
    nextEvent = "After-hours end";
  } else {
    session = "closed";
    // Next open is tomorrow (or Monday)
    const tomorrow = dayOfWeek === 5 ? 3 : 1; // Fri→Mon(3 days), else next day
    minutesToNext = tomorrow * 24 * 60 - totalMin + openTotal;
    nextEvent = dayOfWeek === 5 ? "Opens Mon" : "Opens tomorrow";
  }

  return {
    id: m.id, label: m.label, flag: m.flag, currency: m.currency,
    session, localTime: timeStr, localDate: dateStr,
    minutesToNext, nextEvent,
  };
}

function fmtCountdown(mins: number): string {
  if (mins <= 0) return "now";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 23) return `${Math.ceil(mins/60/24)}d`;
  if (h > 0)  return `${h}h ${m}m`;
  return `${m}m`;
}

const SESSION_COLORS: Record<SessionState, { bg: string; border: string; dot: string; label: string }> = {
  open:   { bg:"rgba(34,197,94,0.10)",   border:"rgba(34,197,94,0.30)",   dot:"#22c55e", label:"Open"       },
  pre:    { bg:"rgba(234,179,8,0.10)",    border:"rgba(234,179,8,0.30)",   dot:"#eab308", label:"Pre-Market" },
  after:  { bg:"rgba(56,189,248,0.10)",   border:"rgba(56,189,248,0.30)",  dot:"#38bdf8", label:"After-Hours"},
  closed: { bg:"rgba(239,68,68,0.08)",    border:"rgba(239,68,68,0.25)",   dot:"#ef4444", label:"Closed"     },
};

// ── Single market pill ────────────────────────────────────────────────
function MarketPill({ state, compact = false }: { state: MarketState; compact?: boolean }) {
  const colors = SESSION_COLORS[state.session];
  const isOpen = state.session === "open";

  return (
    <div style={{
      display:"flex", flexDirection:"column", gap:3,
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: compact ? "var(--radius-md)" : "var(--radius-lg)",
      padding: compact ? "6px 10px" : "10px 14px",
      minWidth: compact ? 90 : 130,
      transition:"background 0.3s, border-color 0.3s",
      flexShrink: 0,
    }}>
      {/* Top row: flag + label + dot */}
      <div style={{ display:"flex", alignItems:"center", gap:5 }}>
        <span style={{ fontSize: compact ? "0.75rem" : "0.85rem" }}>{state.flag}</span>
        <span style={{
          fontFamily:"var(--font-sans)", fontWeight:700,
          fontSize: compact ? "0.62rem" : "0.7rem",
          color:"var(--text-primary)", letterSpacing:"0.02em",
        }}>
          {state.label}
        </span>
        <span style={{
          width:6, height:6, borderRadius:"50%",
          background: colors.dot, flexShrink:0,
          marginLeft:"auto",
          animation: isOpen ? "pulse-dot 1.8s ease-in-out infinite" : "none",
          boxShadow: isOpen ? `0 0 6px ${colors.dot}` : "none",
        }} />
      </div>

      {/* Session badge */}
      <div style={{
        display:"inline-flex", alignItems:"center",
        fontFamily:"var(--font-mono)", fontWeight:600,
        fontSize: compact ? "0.6rem" : "0.65rem",
        color: colors.dot,
        letterSpacing:"0.06em", textTransform:"uppercase",
      }}>
        {colors.label}
      </div>

      {!compact && (
        <>
          {/* Local time */}
          <div style={{
            fontFamily:"var(--font-mono)", fontSize:"0.7rem",
            color:"var(--text-secondary)", letterSpacing:"0.02em",
            fontVariantNumeric:"tabular-nums",
          }}>
            {state.localTime}
          </div>

          {/* Countdown */}
          <div style={{
            fontFamily:"var(--font-mono)", fontSize:"0.62rem",
            color:"var(--text-muted)",
          }}>
            {state.nextEvent} in {fmtCountdown(state.minutesToNext)}
          </div>
        </>
      )}

      {compact && (
        <div style={{
          fontFamily:"var(--font-mono)", fontSize:"0.58rem",
          color:"var(--text-muted)", fontVariantNumeric:"tabular-nums",
        }}>
          {state.nextEvent} {fmtCountdown(state.minutesToNext)}
        </div>
      )}
    </div>
  );
}

// ── Full market status bar (used below Navbar) ────────────────────────
export function MarketStatusBar() {
  const [states, setStates] = useState<MarketState[]>([]);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setStates(MARKETS.map(m => getMarketState(m, now)));
    };
    update();
    const id = setInterval(update, 30_000); // refresh every 30s
    return () => clearInterval(id);
  }, []);

  if (states.length === 0) return null;

  const openCount = states.filter(s => s.session === "open").length;

  return (
    <div style={{
      background:"var(--bg-surface)", border:"1px solid var(--border)",
      borderRadius:"var(--radius-xl)", padding:"12px 16px",
      marginBottom:14, display:"flex", flexDirection:"column", gap:10,
      transition:"background 0.2s",
    }}>
      {/* Header row */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontFamily:"var(--font-mono)", fontSize:"0.62rem", color:"var(--gold)", letterSpacing:"0.12em", textTransform:"uppercase" }}>
            Market Status
          </span>
          <span style={{
            fontFamily:"var(--font-mono)", fontSize:"0.6rem",
            background: openCount > 0 ? "var(--green-dim)" : "var(--red-dim)",
            color: openCount > 0 ? "var(--green-bright)" : "var(--red-bright)",
            border: `1px solid ${openCount > 0 ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            borderRadius:"20px", padding:"2px 8px",
          }}>
            {openCount} / {states.length} Open
          </span>
        </div>
        <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.62rem", color:"var(--text-muted)" }}>
          Auto-updates every 30s
        </div>
      </div>

      {/* Market pills */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {states.map(s => <MarketPill key={s.id} state={s} />)}
      </div>

      {/* Legend */}
      <div style={{
        display:"flex", gap:14, flexWrap:"wrap",
        paddingTop:6, borderTop:"1px solid var(--border)",
      }}>
        {Object.entries(SESSION_COLORS).map(([key, val]) => (
          <div key={key} style={{ display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:val.dot, flexShrink:0 }} />
            <span style={{ fontFamily:"var(--font-mono)", fontSize:"0.6rem", color:"var(--text-muted)" }}>{val.label}</span>
          </div>
        ))}
        <span style={{ fontFamily:"var(--font-mono)", fontSize:"0.6rem", color:"var(--text-muted)", marginLeft:"auto" }}>
          Times shown in each market's local timezone
        </span>
      </div>
    </div>
  );
}

// ── Compact pills for inside Navbar ──────────────────────────────────
export function NavMarketPills() {
  const [states, setStates] = useState<MarketState[]>([]);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setStates(MARKETS.map(m => getMarketState(m, now)));
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
      {states.map(s => <MarketPill key={s.id} state={s} compact />)}
    </div>
  );
}

export default MarketStatusBar;
