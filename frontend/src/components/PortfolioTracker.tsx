"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";

interface Position { shares: number; avgCost: number; }
interface PortfolioRow { ticker: string; shares: number; avgCost: number; currentPrice: number; marketValue: number; pnl: number; pnlPct: number; }

export default function PortfolioTracker({ formatPrice, defaultTicker }: { formatPrice:(v:number)=>string; defaultTicker:string }) {
  const { getUserData, updateUserData } = useAuth();
  const [portfolio, setPortfolio] = useState<Record<string,Position>>({});
  const [rows, setRows]           = useState<PortfolioRow[]>([]);
  const [sym, setSym]             = useState(defaultTicker);
  const [shares, setShares]       = useState(1);
  const [cost, setCost]           = useState(100);
  const [adding, setAdding]       = useState(false);
  const [removing, setRemoving]   = useState("");
  const [syncing, setSyncing]     = useState(false);

  // Load persisted portfolio on mount
  useEffect(() => {
    const saved = getUserData("portfolio");
    if (saved) { setPortfolio(saved); refreshRows(saved); }
  }, []);

  async function refreshRows(p: Record<string,Position>) {
    setSyncing(true);
    const result: PortfolioRow[] = [];
    for (const [ticker, pos] of Object.entries(p)) {
      try {
        const q = await api.quote(ticker);
        const mv = q.price * pos.shares, cb = pos.avgCost * pos.shares;
        result.push({ ticker, shares: pos.shares, avgCost: pos.avgCost, currentPrice: q.price, marketValue: mv, pnl: mv-cb, pnlPct: cb ? (mv-cb)/cb*100 : 0 });
      } catch {}
    }
    setRows(result);
    setSyncing(false);
  }

  async function addPosition() {
    if (!sym) return;
    setAdding(true);
    try {
      const newP = { ...portfolio, [sym.toUpperCase()]: { shares, avgCost: cost } };
      setPortfolio(newP);
      updateUserData("portfolio", newP); // persist
      await refreshRows(newP);
    } catch { alert("Could not fetch price for " + sym); }
    finally { setAdding(false); }
  }

  async function removePosition(ticker: string) {
    setRemoving(ticker);
    const newP = { ...portfolio };
    delete newP[ticker];
    setPortfolio(newP);
    updateUserData("portfolio", newP); // persist
    await refreshRows(newP);
    setRemoving("");
  }

  const totalValue = rows.reduce((a,r) => a+r.marketValue, 0);
  const totalPnl   = rows.reduce((a,r) => a+r.pnl, 0);

  return (
    <div className="card" style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:8 }}>
        <div className="section-label" style={{ marginBottom:0 }}>💼 Portfolio Tracker</div>
        {syncing && <div style={{ display:"flex", alignItems:"center", gap:6 }}><div className="spinner" style={{ width:14,height:14 }} /><span style={{ fontFamily:"var(--font-mono)", fontSize:"0.7rem", color:"var(--text-muted)" }}>Refreshing…</span></div>}
      </div>

      {/* Add form */}
      <div style={{ background:"var(--bg-elevated)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", padding:"14px 16px", marginBottom:16 }}>
        <div className="port-form-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:10, alignItems:"end" }}>
          <div>
            <label style={{ display:"block", fontFamily:"var(--font-mono)", fontSize:"0.62rem", color:"var(--text-muted)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>Ticker</label>
            <input className="qti-input" value={sym} onChange={e => setSym(e.target.value.toUpperCase())} placeholder="AAPL" />
          </div>
          <div>
            <label style={{ display:"block", fontFamily:"var(--font-mono)", fontSize:"0.62rem", color:"var(--text-muted)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>Shares</label>
            <input className="qti-input" type="number" min="0.01" step="0.01" value={shares} onChange={e => setShares(+e.target.value)} />
          </div>
          <div>
            <label style={{ display:"block", fontFamily:"var(--font-mono)", fontSize:"0.62rem", color:"var(--text-muted)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>Avg Cost (USD)</label>
            <input className="qti-input" type="number" min="0.01" step="0.01" value={cost} onChange={e => setCost(+e.target.value)} />
          </div>
          <button className="qti-btn" onClick={addPosition} disabled={adding} style={{ height:42 }}>
            {adding ? "…" : "Add"}
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <p style={{ color:"var(--text-muted)", fontFamily:"var(--font-mono)", fontSize:"0.8rem", textAlign:"center", padding:"24px 0" }}>
          No positions yet. Your portfolio is saved to your account automatically.
        </p>
      ) : (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
            <div className="metric-card"><div className="metric-label">Total Value</div><div className="metric-value">{formatPrice(totalValue)}</div></div>
            <div className="metric-card"><div className="metric-label">Total P&L</div><div className="metric-value" style={{ color:totalPnl>=0?"var(--green-bright)":"var(--red-bright)" }}>{totalPnl>=0?"+":""}{formatPrice(totalPnl)}</div></div>
          </div>
          <div className="table-wrap">
            <table className="qti-table">
              <thead><tr><th>Ticker</th><th>Shares</th><th>Avg Cost</th><th>Current</th><th>Mkt Value</th><th>P&L $</th><th>P&L %</th><th></th></tr></thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.ticker}>
                    <td style={{ color:"var(--gold)", fontWeight:700 }}>{r.ticker}</td>
                    <td>{r.shares}</td>
                    <td>{formatPrice(r.avgCost)}</td>
                    <td>{formatPrice(r.currentPrice)}</td>
                    <td>{formatPrice(r.marketValue)}</td>
                    <td style={{ color:r.pnl>=0?"var(--green-bright)":"var(--red-bright)" }}>{r.pnl>=0?"+":""}{formatPrice(r.pnl)}</td>
                    <td style={{ color:r.pnlPct>=0?"var(--green-bright)":"var(--red-bright)" }}>{r.pnlPct>=0?"+":""}{r.pnlPct.toFixed(2)}%</td>
                    <td>
                      <button className="qti-btn-ghost" style={{ padding:"3px 9px", fontSize:"0.68rem", color:"var(--red-bright)", borderColor:"rgba(239,68,68,0.3)" }} onClick={() => removePosition(r.ticker)} disabled={removing===r.ticker}>
                        {removing===r.ticker?"…":"✕"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
