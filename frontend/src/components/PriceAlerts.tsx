"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

interface Alert { ticker: string; target: number; direction: "above"|"below"; }

export default function PriceAlerts({ currentTicker, currentPrice, formatPrice }: { currentTicker:string; currentPrice:number; formatPrice:(v:number)=>string }) {
  const { getUserData, updateUserData } = useAuth();
  const [alerts, setAlerts]   = useState<Alert[]>([]);
  const [sym, setSym]         = useState(currentTicker);
  const [direction, setDir]   = useState<"above"|"below">("above");
  const [target, setTarget]   = useState(currentPrice);

  useEffect(() => { setSym(currentTicker); setTarget(currentPrice); }, [currentTicker, currentPrice]);

  // Load persisted alerts
  useEffect(() => {
    const saved = getUserData("alerts");
    if (saved) setAlerts(saved);
  }, []);

  function persist(newAlerts: Alert[]) {
    setAlerts(newAlerts);
    updateUserData("alerts", newAlerts);
  }

  const triggered = alerts.filter(a =>
    a.ticker === currentTicker &&
    (a.direction === "above" ? currentPrice >= a.target : currentPrice <= a.target)
  );

  return (
    <div className="card" style={{ marginBottom:14 }}>
      <div className="section-label">🔔 Price Alerts</div>

      {triggered.map((a,i) => (
        <div key={i} style={{ background:"var(--red-dim)", border:"1px solid rgba(239,68,68,0.35)", borderRadius:"var(--radius-md)", padding:"10px 14px", marginBottom:10, fontFamily:"var(--font-mono)", fontSize:"0.8rem", color:"var(--red-bright)" }}>
          🚨 <strong>{a.ticker}</strong> is {a.direction} ${a.target.toFixed(2)} — Current: {formatPrice(currentPrice)}
        </div>
      ))}

      {/* Set alert */}
      <div style={{ background:"var(--bg-elevated)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", padding:"14px 16px", marginBottom:16 }}>
        <div className="alert-form-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:10, alignItems:"end" }}>
          <div>
            <label style={{ display:"block", fontFamily:"var(--font-mono)", fontSize:"0.62rem", color:"var(--text-muted)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>Ticker</label>
            <input className="qti-input" value={sym} onChange={e => setSym(e.target.value.toUpperCase())} />
          </div>
          <div>
            <label style={{ display:"block", fontFamily:"var(--font-mono)", fontSize:"0.62rem", color:"var(--text-muted)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>Direction</label>
            <select className="qti-input" value={direction} onChange={e => setDir(e.target.value as any)} style={{ appearance:"none", cursor:"pointer" }}>
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
          </div>
          <div>
            <label style={{ display:"block", fontFamily:"var(--font-mono)", fontSize:"0.62rem", color:"var(--text-muted)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>Target (USD)</label>
            <input className="qti-input" type="number" min="0.01" step="0.01" value={target} onChange={e => setTarget(+e.target.value)} />
          </div>
          <button className="qti-btn" style={{ height:42 }} onClick={() => persist([...alerts, { ticker:sym.toUpperCase(), target, direction }])}>
            Set
          </button>
        </div>
      </div>

      {alerts.length === 0 ? (
        <p style={{ color:"var(--text-muted)", fontFamily:"var(--font-mono)", fontSize:"0.8rem", textAlign:"center", padding:"16px 0" }}>No alerts set. Alerts are saved to your account.</p>
      ) : (
        <>
          <div className="table-wrap" style={{ marginBottom:12 }}>
            <table className="qti-table">
              <thead><tr><th>Ticker</th><th>Direction</th><th>Target</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {alerts.map((a,i) => {
                  const hit = a.ticker===currentTicker && (a.direction==="above"?currentPrice>=a.target:currentPrice<=a.target);
                  return (
                    <tr key={i}>
                      <td style={{ color:"var(--gold)", fontWeight:700 }}>{a.ticker}</td>
                      <td style={{ textTransform:"capitalize" }}>{a.direction}</td>
                      <td>${a.target.toFixed(2)}</td>
                      <td style={{ color:hit?"var(--red-bright)":"var(--text-muted)" }}>{hit?"🚨 Triggered":"⏳ Watching"}</td>
                      <td>
                        <button className="qti-btn-ghost" style={{ padding:"3px 9px", fontSize:"0.68rem", color:"var(--red-bright)" }}
                          onClick={() => persist(alerts.filter((_,j)=>j!==i))}>✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button className="qti-btn-ghost" onClick={() => persist([])} style={{ width:"100%", justifyContent:"center" }}>
            Clear All Alerts
          </button>
        </>
      )}
    </div>
  );
}
