"use client";
import { useState } from "react";
import { api } from "@/lib/api";

interface Quote { ticker: string; price: number; change: number; signal: string; }

export default function Watchlist({ formatPrice }: { formatPrice: (v: number) => string }) {
  const [input, setInput] = useState("AAPL,MSFT,GOOGL");
  const [data, setData] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);

  async function scan() {
    setLoading(true);
    try {
      const res = await api.quotes(input);
      setData(res);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  const signalColor = (s: string) =>
    s === "BUY" ? "var(--green)" : s === "SELL" ? "var(--red)" : "var(--gold)";

  return (
    <div className="card" style={{ marginBottom:16 }}>
      <div className="section-label">📌 Watchlist Scanner</div>

      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        <input
          className="qti-input"
          value={input}
          onChange={e => setInput(e.target.value.toUpperCase())}
          placeholder="AAPL,MSFT,TSLA (up to 10)"
        />
        <button className="qti-btn" onClick={scan} disabled={loading} style={{ flexShrink:0 }}>
          {loading ? "..." : "Scan"}
        </button>
      </div>

      {data.length === 0 ? (
        <p style={{ color:"var(--text-muted)", fontFamily:"var(--font-mono)", fontSize:"0.8rem", textAlign:"center", padding:"16px 0" }}>
          Enter tickers and click Scan.
        </p>
      ) : (
        <div style={{ overflowX:"auto" }}>
          <table className="qti-table">
            <thead>
              <tr><th>Ticker</th><th>Price</th><th>Change %</th><th>Signal</th></tr>
            </thead>
            <tbody>
              {data.map(q => (
                <tr key={q.ticker}>
                  <td style={{ color:"var(--gold)", fontWeight:700 }}>{q.ticker}</td>
                  <td>{formatPrice(q.price)}</td>
                  <td style={{ color: q.change >= 0 ? "var(--green)" : "var(--red)" }}>
                    {q.change >= 0 ? "+" : ""}{q.change.toFixed(2)}%
                  </td>
                  <td>
                    <span style={{
                      color: signalColor(q.signal),
                      background: q.signal === "BUY" ? "rgba(34,197,94,0.1)" : q.signal === "SELL" ? "rgba(239,68,68,0.1)" : "rgba(212,168,67,0.1)",
                      border: `1px solid ${signalColor(q.signal)}44`,
                      borderRadius:6, padding:"2px 10px",
                      fontWeight:700, fontSize:"0.72rem", letterSpacing:"0.06em",
                    }}>
                      {q.signal}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
