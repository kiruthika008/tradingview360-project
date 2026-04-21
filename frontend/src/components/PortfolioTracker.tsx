"use client";
import { useState } from "react";
import { api } from "@/lib/api";

interface Position { shares: number; avgCost: number; }
interface PortfolioRow {
  ticker: string; shares: number; avgCost: number;
  currentPrice: number; marketValue: number; pnl: number; pnlPct: number;
}

export default function PortfolioTracker({
  formatPrice, defaultTicker,
}: { formatPrice: (v: number) => string; defaultTicker: string }) {
  const [portfolio, setPortfolio] = useState<Record<string, Position>>({});
  const [rows, setRows] = useState<PortfolioRow[]>([]);
  const [sym, setSym] = useState(defaultTicker);
  const [shares, setShares] = useState(1);
  const [cost, setCost] = useState(100);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState("");

  async function addPosition() {
    if (!sym) return;
    setAdding(true);
    try {
      const q = await api.quote(sym);
      const newPortfolio = { ...portfolio, [sym.toUpperCase()]: { shares, avgCost: cost } };
      setPortfolio(newPortfolio);
      await refreshRows(newPortfolio);
    } catch {
      alert("Could not fetch price for " + sym);
    } finally {
      setAdding(false);
    }
  }

  async function refreshRows(p: Record<string, Position>) {
    const result: PortfolioRow[] = [];
    for (const [ticker, pos] of Object.entries(p)) {
      try {
        const q = await api.quote(ticker);
        const mv = q.price * pos.shares;
        const cb = pos.avgCost * pos.shares;
        result.push({
          ticker,
          shares: pos.shares,
          avgCost: pos.avgCost,
          currentPrice: q.price,
          marketValue: mv,
          pnl: mv - cb,
          pnlPct: cb ? (mv - cb) / cb * 100 : 0,
        });
      } catch {}
    }
    setRows(result);
  }

  async function removePosition(ticker: string) {
    setRemoving(ticker);
    const newPortfolio = { ...portfolio };
    delete newPortfolio[ticker];
    setPortfolio(newPortfolio);
    await refreshRows(newPortfolio);
    setRemoving("");
  }

  const totalValue = rows.reduce((a, r) => a + r.marketValue, 0);
  const totalPnl   = rows.reduce((a, r) => a + r.pnl, 0);

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="section-label">💼 Portfolio Tracker</div>

      {/* Add form */}
      <div style={{
        background: "var(--bg-elevated)", border: "1px solid var(--border)",
        borderRadius: 10, padding: "16px 18px", marginBottom: 16,
      }}>
        <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.7rem", color:"var(--text-muted)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:12 }}>
          Add / Update Position
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:10, alignItems:"end" }}>
          <div>
            <label style={{ fontFamily:"var(--font-mono)", fontSize:"0.67rem", color:"var(--text-muted)", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:4 }}>Ticker</label>
            <input className="qti-input" value={sym} onChange={e => setSym(e.target.value.toUpperCase())} placeholder="AAPL" />
          </div>
          <div>
            <label style={{ fontFamily:"var(--font-mono)", fontSize:"0.67rem", color:"var(--text-muted)", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:4 }}>Shares</label>
            <input className="qti-input" type="number" min="0.01" step="0.01" value={shares} onChange={e => setShares(+e.target.value)} />
          </div>
          <div>
            <label style={{ fontFamily:"var(--font-mono)", fontSize:"0.67rem", color:"var(--text-muted)", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:4 }}>Avg Cost (USD)</label>
            <input className="qti-input" type="number" min="0.01" step="0.01" value={cost} onChange={e => setCost(+e.target.value)} />
          </div>
          <button className="qti-btn" onClick={addPosition} disabled={adding} style={{ height:42 }}>
            {adding ? "..." : "Add"}
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <p style={{ color:"var(--text-muted)", fontFamily:"var(--font-mono)", fontSize:"0.8rem", textAlign:"center", padding:"24px 0" }}>
          No positions yet. Add a ticker above.
        </p>
      ) : (
        <>
          {/* Summary metrics */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
            <div className="metric-card">
              <div className="metric-label">Total Portfolio Value</div>
              <div className="metric-value">{formatPrice(totalValue)}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Total P&L</div>
              <div className="metric-value" style={{ color: totalPnl >= 0 ? "var(--green)" : "var(--red)" }}>
                {totalPnl >= 0 ? "+" : ""}{formatPrice(totalPnl)}
              </div>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX:"auto" }}>
            <table className="qti-table">
              <thead>
                <tr>
                  <th>Ticker</th><th>Shares</th><th>Avg Cost</th>
                  <th>Current</th><th>Mkt Value</th><th>P&L $</th><th>P&L %</th><th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.ticker}>
                    <td style={{ color:"var(--gold)", fontWeight:700 }}>{r.ticker}</td>
                    <td>{r.shares}</td>
                    <td>{formatPrice(r.avgCost)}</td>
                    <td>{formatPrice(r.currentPrice)}</td>
                    <td>{formatPrice(r.marketValue)}</td>
                    <td style={{ color: r.pnl >= 0 ? "var(--green)" : "var(--red)" }}>
                      {r.pnl >= 0 ? "+" : ""}{formatPrice(r.pnl)}
                    </td>
                    <td style={{ color: r.pnlPct >= 0 ? "var(--green)" : "var(--red)" }}>
                      {r.pnlPct >= 0 ? "+" : ""}{r.pnlPct.toFixed(2)}%
                    </td>
                    <td>
                      <button
                        className="qti-btn-ghost"
                        style={{ padding:"4px 10px", fontSize:"0.7rem", color:"var(--red)", borderColor:"rgba(239,68,68,0.3)" }}
                        onClick={() => removePosition(r.ticker)}
                        disabled={removing === r.ticker}
                      >
                        {removing === r.ticker ? "..." : "✕"}
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
