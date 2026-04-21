"use client";
import { useState, useEffect } from "react";

interface Alert { ticker: string; target: number; direction: "above" | "below"; }

export default function PriceAlerts({
  currentTicker, currentPrice, formatPrice,
}: { currentTicker: string; currentPrice: number; formatPrice: (v: number) => string }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [sym, setSym] = useState(currentTicker);
  const [direction, setDirection] = useState<"above" | "below">("above");
  const [target, setTarget] = useState(currentPrice);

  // Sync ticker when parent changes
  useEffect(() => { setSym(currentTicker); setTarget(currentPrice); }, [currentTicker, currentPrice]);

  // Check triggered alerts
  const triggered = alerts.filter(a =>
    a.ticker === currentTicker &&
    (a.direction === "above" ? currentPrice >= a.target : currentPrice <= a.target)
  );

  function addAlert() {
    if (!sym || !target) return;
    setAlerts(prev => [...prev, { ticker: sym.toUpperCase(), target, direction }]);
  }

  function clearAll() { setAlerts([]); }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="section-label">🔔 Price Alerts</div>

      {/* Triggered alerts */}
      {triggered.map((a, i) => (
        <div key={i} style={{
          background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.4)",
          borderRadius:8, padding:"10px 14px", marginBottom:10,
          fontFamily:"'DM Mono',monospace", fontSize:"0.8rem", color:"#fca5a5",
        }}>
          🚨 <strong>{a.ticker}</strong> is {a.direction} ${a.target.toFixed(2)} — Current: {formatPrice(currentPrice)}
        </div>
      ))}

      {/* Add form */}
      <div style={{
        background:"var(--bg-elevated)", border:"1px solid var(--border)",
        borderRadius:10, padding:"14px 16px", marginBottom:16,
      }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:10, alignItems:"end" }}>
          <div>
            <label style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.67rem", color:"var(--text-muted)", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:4 }}>Ticker</label>
            <input className="qti-input" value={sym} onChange={e => setSym(e.target.value.toUpperCase())} />
          </div>
          <div>
            <label style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.67rem", color:"var(--text-muted)", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:4 }}>Direction</label>
            <select
              className="qti-input"
              value={direction}
              onChange={e => setDirection(e.target.value as "above" | "below")}
              style={{ appearance:"none" }}
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
          </div>
          <div>
            <label style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.67rem", color:"var(--text-muted)", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:4 }}>Target (USD)</label>
            <input className="qti-input" type="number" min="0.01" step="0.01" value={target} onChange={e => setTarget(+e.target.value)} />
          </div>
          <button className="qti-btn" onClick={addAlert} style={{ height:42 }}>Set</button>
        </div>
      </div>

      {alerts.length === 0 ? (
        <p style={{ color:"var(--text-muted)", fontFamily:"'DM Mono',monospace", fontSize:"0.8rem", textAlign:"center", padding:"16px 0" }}>
          No alerts set.
        </p>
      ) : (
        <>
          <table className="qti-table" style={{ marginBottom:12 }}>
            <thead>
              <tr><th>Ticker</th><th>Direction</th><th>Target</th><th>Status</th></tr>
            </thead>
            <tbody>
              {alerts.map((a, i) => {
                const hit = a.ticker === currentTicker &&
                  (a.direction === "above" ? currentPrice >= a.target : currentPrice <= a.target);
                return (
                  <tr key={i}>
                    <td style={{ color:"var(--gold)", fontWeight:700 }}>{a.ticker}</td>
                    <td style={{ textTransform:"capitalize" }}>{a.direction}</td>
                    <td>${a.target.toFixed(2)}</td>
                    <td style={{ color: hit ? "var(--red)" : "var(--text-muted)" }}>
                      {hit ? "🚨 Triggered" : "⏳ Watching"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button className="qti-btn-ghost" onClick={clearAll} style={{ width:"100%" }}>
            Clear All Alerts
          </button>
        </>
      )}
    </div>
  );
}
