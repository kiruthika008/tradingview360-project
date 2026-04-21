"use client";
import { useEffect, useState, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine
} from "recharts";
import { api } from "@/lib/api";

interface Candle { time: number; open: number; high: number; low: number; close: number; volume: number; }
interface Enriched extends Candle { rsi?: number; macd?: number; signal?: number; histogram?: number; bbUpper?: number; bbMid?: number; bbLower?: number; }

function computeRSI(closes: number[], period = 14): (number | undefined)[] {
  const result: (number | undefined)[] = new Array(closes.length).fill(undefined);
  if (closes.length < period + 1) return result;
  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1];
    if (d >= 0) avgGain += d; else avgLoss -= d;
  }
  avgGain /= period; avgLoss /= period;
  result[period] = 100 - 100 / (1 + avgGain / (avgLoss || 1e-9));
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(d, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-d, 0)) / period;
    result[i] = 100 - 100 / (1 + avgGain / (avgLoss || 1e-9));
  }
  return result;
}

function computeEMA(closes: number[], span: number): number[] {
  const k = 2 / (span + 1);
  const ema: number[] = [];
  closes.forEach((v, i) => {
    if (i === 0) { ema.push(v); return; }
    ema.push(v * k + ema[i - 1] * (1 - k));
  });
  return ema;
}

function computeMACD(closes: number[]): { macd: (number|undefined)[]; signal: (number|undefined)[]; histogram: (number|undefined)[]; } {
  const fast = computeEMA(closes, 12);
  const slow = computeEMA(closes, 26);
  const macdLine = closes.map((_, i) => (i >= 25 ? fast[i] - slow[i] : undefined));
  const validMacd = macdLine.map(v => v ?? 0);
  const signalEMA = computeEMA(validMacd, 9);
  return {
    macd: macdLine,
    signal: macdLine.map((v, i) => v !== undefined ? signalEMA[i] : undefined),
    histogram: macdLine.map((v, i) => v !== undefined ? v - signalEMA[i] : undefined),
  };
}

function computeBollinger(closes: number[], period = 20, stdDev = 2) {
  return closes.map((_, i) => {
    if (i < period - 1) return { upper: undefined, mid: undefined, lower: undefined };
    const slice = closes.slice(i - period + 1, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const std = Math.sqrt(slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period);
    return { upper: mean + stdDev * std, mid: mean, lower: mean - stdDev * std };
  });
}

const ttStyle = {
  contentStyle: { background:"var(--bg-elevated)", border:"1px solid var(--border-bright)", borderRadius:8, fontFamily:"var(--font-mono)", fontSize:"0.75rem" },
  labelStyle: { color:"var(--text-muted)" },
};
const xTickProps = { fill:"var(--text-muted)", fontSize:9, fontFamily:"var(--font-mono)" };
const yTickProps = { fill:"var(--text-muted)", fontSize:9, fontFamily:"var(--font-mono)" };

export default function TechnicalIndicators({ symbol }: { symbol: string }) {
  const [data, setData] = useState<Enriched[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolution, setResolution] = useState("60");

  const load = useCallback(() => {
    setLoading(true);
    api.candles(symbol, resolution)
      .then((raw: Candle[]) => {
        const closes = raw.map(r => r.close);
        const rsiArr = computeRSI(closes);
        const { macd, signal, histogram } = computeMACD(closes);
        const bb = computeBollinger(closes);
        const fmt = (t: number) => {
          const d = new Date(t * 1000);
          return resolution === "D"
            ? d.toLocaleDateString("en-US", { month:"short", day:"numeric" })
            : d.toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit" });
        };
        setData(raw.map((r, i) => ({
          ...r,
          label: fmt(r.time),
          rsi: rsiArr[i] !== undefined ? +rsiArr[i]!.toFixed(2) : undefined,
          macd: macd[i] !== undefined ? +macd[i]!.toFixed(4) : undefined,
          signal: signal[i] !== undefined ? +signal[i]!.toFixed(4) : undefined,
          histogram: histogram[i] !== undefined ? +histogram[i]!.toFixed(4) : undefined,
          bbUpper: bb[i].upper !== undefined ? +bb[i].upper!.toFixed(2) : undefined,
          bbMid: bb[i].mid !== undefined ? +bb[i].mid!.toFixed(2) : undefined,
          bbLower: bb[i].lower !== undefined ? +bb[i].lower!.toFixed(2) : undefined,
        } as any)));
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [symbol, resolution]);

  useEffect(() => { load(); }, [load]);

  const last = data[data.length - 1];
  const rsiStatus = last?.rsi != null
    ? last.rsi > 70 ? { label:"Overbought 🔴", col:"var(--red)" }
    : last.rsi < 30 ? { label:"Oversold 🟢", col:"var(--green)" }
    : { label:"Neutral 🟡", col:"var(--gold)" } : null;
  const macdStatus = last?.macd != null && last?.signal != null
    ? last.macd > last.signal ? { label:"Bullish 🟢", col:"var(--green)" } : { label:"Bearish 🔴", col:"var(--red)" }
    : null;
  const bbStatus = last?.close != null && last?.bbUpper != null && last?.bbLower != null
    ? last.close >= last.bbUpper * 0.98 ? { label:"Near Upper 🔴", col:"var(--red)" }
    : last.close <= last.bbLower * 1.02 ? { label:"Near Lower 🟢", col:"var(--green)" }
    : { label:"Inside Band 🟡", col:"var(--gold)" } : null;

  return (
    <div className="card" style={{ marginBottom:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div className="section-label" style={{ marginBottom:0 }}>📐 Technical Indicators</div>
        <div style={{ display:"flex", gap:4 }}>
          {["15","30","60","D"].map(r => (
            <button key={r} className="qti-btn-ghost"
              style={resolution === r ? { borderColor:"var(--gold)", color:"var(--gold)" } : {}}
              onClick={() => setResolution(r)}>
              {r === "D" ? "1D" : `${r}m`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:"48px 0" }}><div className="spinner" /></div>
      ) : data.length === 0 ? (
        <p style={{ color:"var(--text-muted)", textAlign:"center", padding:"32px 0", fontFamily:"var(--font-mono)", fontSize:"0.8rem" }}>No data</p>
      ) : (
        <>
          {/* Summary metrics */}
          {(rsiStatus || macdStatus || bbStatus) && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
              {rsiStatus && (
                <div className="metric-card">
                  <div className="metric-label">RSI (14)</div>
                  <div className="metric-value" style={{ fontSize:"1.15rem" }}>{last.rsi?.toFixed(1)}</div>
                  <div style={{ fontSize:"0.72rem", color:rsiStatus.col, marginTop:4 }}>{rsiStatus.label}</div>
                </div>
              )}
              {macdStatus && (
                <div className="metric-card">
                  <div className="metric-label">MACD</div>
                  <div className="metric-value" style={{ fontSize:"1rem", color:macdStatus.col }}>{macdStatus.label}</div>
                </div>
              )}
              {bbStatus && (
                <div className="metric-card">
                  <div className="metric-label">Bollinger</div>
                  <div className="metric-value" style={{ fontSize:"1rem", color:bbStatus.col }}>{bbStatus.label}</div>
                </div>
              )}
            </div>
          )}

          {/* Bollinger Bands */}
          <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.7rem", color:"var(--text-secondary)", marginBottom:8 }}>Bollinger Bands (20, 2)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top:4, right:8, bottom:4, left:8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={xTickProps} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis domain={["auto","auto"]} tick={yTickProps} axisLine={false} tickLine={false} width={52} tickFormatter={v => `$${v.toFixed(0)}`} />
              <Tooltip {...ttStyle} />
              <Line type="monotone" dataKey="close"   stroke="var(--gold)"   strokeWidth={2} dot={false} name="Close" />
              <Line type="monotone" dataKey="bbUpper" stroke="#ef4444" strokeWidth={1} strokeDasharray="4 3" dot={false} name="Upper" />
              <Line type="monotone" dataKey="bbMid"   stroke="#facc15" strokeWidth={1} strokeDasharray="3 3" dot={false} name="SMA20" />
              <Line type="monotone" dataKey="bbLower" stroke="#ef4444" strokeWidth={1} strokeDasharray="4 3" dot={false} name="Lower" />
            </LineChart>
          </ResponsiveContainer>

          {/* RSI */}
          <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.7rem", color:"var(--text-secondary)", marginBottom:8, marginTop:20 }}>RSI (14)</p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={data} margin={{ top:4, right:8, bottom:4, left:8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={xTickProps} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis domain={[0,100]} tick={yTickProps} axisLine={false} tickLine={false} width={30} />
              <Tooltip {...ttStyle} />
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 3" label={{ value:"70", position:"right", fill:"#ef4444", fontSize:9 }} />
              <ReferenceLine y={30} stroke="#38bdf8" strokeDasharray="4 3" label={{ value:"30", position:"right", fill:"#38bdf8", fontSize:9 }} />
              <Line type="monotone" dataKey="rsi" stroke="var(--gold)" strokeWidth={2} dot={false} name="RSI" />
            </LineChart>
          </ResponsiveContainer>

          {/* MACD */}
          <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.7rem", color:"var(--text-secondary)", marginBottom:8, marginTop:20 }}>MACD (12/26/9)</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={data} margin={{ top:4, right:8, bottom:4, left:8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={xTickProps} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis domain={["auto","auto"]} tick={yTickProps} axisLine={false} tickLine={false} width={44} />
              <Tooltip {...ttStyle} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
              <Line type="monotone" dataKey="macd"   stroke="var(--green)" strokeWidth={2} dot={false} name="MACD" />
              <Line type="monotone" dataKey="signal" stroke="#facc15"      strokeWidth={1.5} dot={false} name="Signal" />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
