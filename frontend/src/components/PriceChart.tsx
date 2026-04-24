"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts";
import { api } from "@/lib/api";

interface Props { symbol: string; }

const TT = {
  contentStyle:{ background:"var(--bg-elevated)", border:"1px solid var(--border-bright)", borderRadius:8, fontFamily:"var(--font-mono)", fontSize:"0.76rem" },
  labelStyle:{ color:"var(--text-muted)" },
};

export default function PriceChart({ symbol }: Props) {
  const [data, setData]       = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [resolution, setRes]  = useState("60");

  useEffect(() => {
    setLoading(true); setError("");
    api.candles(symbol, resolution)
      .then((raw: any[]) => {
        if (!raw || raw.length === 0) { setError("No price data available for this ticker/resolution."); setData([]); return; }
        const fmt = (t: number) => {
          const d = new Date(t*1000);
          return resolution === "D"
            ? d.toLocaleDateString("en-US",{month:"short",day:"numeric"})
            : d.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
        };
        setData(raw.map(r => ({ ...r, lbl: fmt(r.time) })));
      })
      .catch(e => setError(e.message || "Failed to load chart data"))
      .finally(() => setLoading(false));
  }, [symbol, resolution]);

  const prices   = data.map(d => d.close).filter(Boolean);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const change   = prices.length > 1 ? prices[prices.length-1] - prices[0] : 0;
  const pct      = prices.length > 1 && prices[0] ? (change/prices[0]*100) : 0;
  const lineColor = change >= 0 ? "var(--green-bright)" : "var(--red-bright)";

  return (
    <div className="card" style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, flexWrap:"wrap", gap:8 }}>
        <div>
          <div className="section-label" style={{ marginBottom:0 }}>📈 Price Chart — {symbol}</div>
          {data.length > 0 && (
            <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.72rem", color: change>=0?"var(--green-bright)":"var(--red-bright)", marginTop:4 }}>
              {change>=0?"▲":"▼"} {Math.abs(pct).toFixed(2)}% over this period &nbsp;·&nbsp; Range ${minPrice.toFixed(2)} – ${maxPrice.toFixed(2)}
            </div>
          )}
        </div>
        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
          {[["15","15m"],["30","30m"],["60","1h"],["D","Daily"]].map(([r,l]) => (
            <button key={r} className="qti-btn-ghost"
              style={{ padding:"5px 10px", fontSize:"0.68rem", ...(resolution===r?{borderColor:"var(--gold)",color:"var(--gold)"}:{}) }}
              onClick={() => setRes(r)}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {loading && <div style={{ display:"flex",justifyContent:"center",padding:"48px 0" }}><div className="spinner"/></div>}

      {error && (
        <div style={{ background:"var(--gold-dim)", border:"1px solid var(--gold-dim)", borderRadius:"var(--radius-md)", padding:"16px" }}>
          <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.78rem", color:"var(--gold-light)", marginBottom:6 }}>⚠ {error}</p>
          <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.72rem", color:"var(--text-muted)", lineHeight:1.6 }}>
            Try switching to Daily resolution, or verify the ticker symbol is supported by Finnhub.
          </p>
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="table-wrap">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data} margin={{top:4,right:4,bottom:4,left:8}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="lbl"
                tick={{ fill:"var(--text-muted)", fontSize:9, fontFamily:"var(--font-mono)" }}
                axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis domain={["auto","auto"]}
                tick={{ fill:"var(--text-muted)", fontSize:9, fontFamily:"var(--font-mono)" }}
                axisLine={false} tickLine={false} width={54}
                tickFormatter={v => `$${Number(v).toFixed(0)}`} />
              <Tooltip {...TT}
                labelFormatter={v => String(v)}
                formatter={(v:any) => [`$${Number(v).toFixed(2)}`, "Price"]} />
              {prices.length > 0 && <ReferenceLine y={prices[0]} stroke="var(--border-bright)" strokeDasharray="4 3" />}
              <Line type="monotone" dataKey="close" stroke={lineColor} strokeWidth={2}
                dot={false} activeDot={{ r:4, fill:lineColor }} name="Price" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
