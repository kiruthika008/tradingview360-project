"use client";
import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, ReferenceLine
} from "recharts";
import { api } from "@/lib/api";

interface CandlePoint { time: number; close: number; }

interface Props { symbol: string; }

export default function PriceChart({ symbol }: Props) {
  const [data, setData] = useState<CandlePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolution, setResolution] = useState("60");

  useEffect(() => {
    setLoading(true);
    api.candles(symbol, resolution)
      .then((raw: any[]) => {
        setData(raw.map(r => ({ time: r.time, close: r.close })));
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [symbol, resolution]);

  const fmt = (t: number) => {
    const d = new Date(t * 1000);
    return resolution === "D"
      ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const resOptions = ["15", "30", "60", "D"];

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div className="section-label" style={{ marginBottom:0 }}>📈 Price Chart — {symbol}</div>
        <div style={{ display:"flex", gap:4 }}>
          {resOptions.map(r => (
            <button
              key={r}
              className="qti-btn-ghost"
              style={resolution === r ? { borderColor:"var(--gold)", color:"var(--gold)" } : {}}
              onClick={() => setResolution(r)}
            >
              {r === "D" ? "1D" : `${r}m`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:"48px 0" }}>
          <div className="spinner" />
        </div>
      ) : data.length === 0 ? (
        <p style={{ color:"var(--text-muted)", textAlign:"center", padding:"48px 0", fontFamily:"'DM Mono',monospace", fontSize:"0.8rem" }}>
          No chart data available
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top:4, right:8, bottom:4, left:8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="time"
              tickFormatter={fmt}
              tick={{ fill:"var(--text-muted)", fontSize:10, fontFamily:"'DM Mono',monospace" }}
              axisLine={false} tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={["auto","auto"]}
              tick={{ fill:"var(--text-muted)", fontSize:10, fontFamily:"'DM Mono',monospace" }}
              axisLine={false} tickLine={false}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
              width={56}
            />
            <Tooltip
              contentStyle={{
                background:"var(--bg-elevated)", border:"1px solid var(--border-bright)",
                borderRadius:8, fontFamily:"'DM Mono',monospace", fontSize:"0.78rem",
              }}
              labelStyle={{ color:"var(--text-muted)", marginBottom:4 }}
              itemStyle={{ color:"var(--gold)" }}
              labelFormatter={(v) => fmt(v as number)}
              formatter={(v: any) => [`$${Number(v).toFixed(2)}`, "Price"]}
            />
            <Line
              type="monotone" dataKey="close"
              stroke="var(--gold)" strokeWidth={2}
              dot={false} activeDot={{ r:4, fill:"var(--gold)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
