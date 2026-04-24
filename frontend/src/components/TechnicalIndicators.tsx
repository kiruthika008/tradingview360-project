"use client";
import { useEffect, useState, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts";
import { api } from "@/lib/api";

interface Candle { time: number; open: number; high: number; low: number; close: number; volume: number; }

function computeRSI(closes: number[], period = 14) {
  const out: (number|undefined)[] = new Array(closes.length).fill(undefined);
  if (closes.length < period + 1) return out;
  let ag = 0, al = 0;
  for (let i = 1; i <= period; i++) { const d = closes[i]-closes[i-1]; d>=0?ag+=d:al-=d; }
  ag/=period; al/=period;
  out[period] = 100 - 100/(1+ag/(al||1e-9));
  for (let i = period+1; i < closes.length; i++) {
    const d = closes[i]-closes[i-1];
    ag=(ag*(period-1)+Math.max(d,0))/period;
    al=(al*(period-1)+Math.max(-d,0))/period;
    out[i] = 100 - 100/(1+ag/(al||1e-9));
  }
  return out;
}

function computeEMA(closes: number[], span: number) {
  const k = 2/(span+1), ema: number[] = [];
  closes.forEach((v,i) => ema.push(i===0 ? v : v*k+ema[i-1]*(1-k)));
  return ema;
}

function computeMACD(closes: number[]) {
  const fast=computeEMA(closes,12), slow=computeEMA(closes,26);
  const macd = closes.map((_,i)=>i>=25?fast[i]-slow[i]:undefined);
  const valid = macd.map(v=>v??0);
  const sig   = computeEMA(valid,9);
  return {
    macd, signal: macd.map((v,i)=>v!==undefined?sig[i]:undefined),
    histogram: macd.map((v,i)=>v!==undefined?v-sig[i]:undefined),
  };
}

function computeBB(closes: number[], period=20, sd=2) {
  return closes.map((_,i)=>{
    if(i<period-1) return {u:undefined,m:undefined,l:undefined};
    const sl=closes.slice(i-period+1,i+1);
    const mean=sl.reduce((a,b)=>a+b,0)/period;
    const std=Math.sqrt(sl.reduce((a,b)=>a+(b-mean)**2,0)/period);
    return {u:+(mean+sd*std).toFixed(2),m:+mean.toFixed(2),l:+(mean-sd*std).toFixed(2)};
  });
}

const TT_STYLE = {
  contentStyle:{ background:"var(--bg-elevated)", border:"1px solid var(--border-bright)", borderRadius:8, fontFamily:"var(--font-mono)", fontSize:"0.74rem" },
  labelStyle:{ color:"var(--text-muted)" },
};
const tick = (fill="var(--text-muted)") => ({ fill, fontSize:9, fontFamily:"var(--font-mono)" });

export default function TechnicalIndicators({ symbol }: { symbol: string }) {
  const [data, setData]         = useState<any[]>([]);
  const [resolution, setRes]    = useState("60");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const load = useCallback(() => {
    setLoading(true); setError("");
    api.candles(symbol, resolution)
      .then((raw: Candle[]) => {
        if (!raw || raw.length < 30) { setError("Not enough candle data for this symbol/resolution."); setData([]); return; }
        const closes = raw.map(r => r.close);
        const rsi    = computeRSI(closes);
        const { macd, signal, histogram } = computeMACD(closes);
        const bb     = computeBB(closes);
        const fmt    = (t: number) => {
          const d = new Date(t*1000);
          return resolution==="D"
            ? d.toLocaleDateString("en-US",{month:"short",day:"numeric"})
            : d.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
        };
        setData(raw.map((r,i) => ({
          ...r, lbl: fmt(r.time),
          rsi:  rsi[i]!=null ? +rsi[i]!.toFixed(1) : undefined,
          macd: macd[i]!=null ? +macd[i]!.toFixed(4) : undefined,
          sig:  signal[i]!=null ? +signal[i]!.toFixed(4) : undefined,
          hist: histogram[i]!=null ? +histogram[i]!.toFixed(4) : undefined,
          bbU:  bb[i].u, bbM: bb[i].m, bbL: bb[i].l,
        })));
      })
      .catch(e => setError(e.message || "Failed to load candle data"))
      .finally(() => setLoading(false));
  }, [symbol, resolution]);

  useEffect(() => { load(); }, [load]);

  const last = data[data.length-1];
  const rsiVal   = last?.rsi;
  const macdVal  = last?.macd;
  const sigVal   = last?.sig;
  const bbUVal   = last?.bbU;
  const bbLVal   = last?.bbL;
  const closeVal = last?.close;

  const rsiStatus  = rsiVal!=null ? (rsiVal>70?{l:"Overbought 🔴",c:"var(--red-bright)"}:rsiVal<30?{l:"Oversold 🟢",c:"var(--green-bright)"}:{l:"Neutral 🟡",c:"var(--gold-light)"}) : null;
  const macdStatus = macdVal!=null&&sigVal!=null ? (macdVal>sigVal?{l:"Bullish 🟢",c:"var(--green-bright)"}:{l:"Bearish 🔴",c:"var(--red-bright)"}) : null;
  const bbStatus   = closeVal!=null&&bbUVal!=null&&bbLVal!=null
    ? (closeVal>=bbUVal*0.98?{l:"Near Upper 🔴",c:"var(--red-bright)"}:closeVal<=bbLVal*1.02?{l:"Near Lower 🟢",c:"var(--green-bright)"}:{l:"Inside Band 🟡",c:"var(--gold-light)"})
    : null;

  return (
    <div className="card" style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:8 }}>
        <div className="section-label" style={{ marginBottom:0 }}>📐 Technical Indicators — {symbol}</div>
        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
          {["15","30","60","D"].map(r => (
            <button key={r} className="qti-btn-ghost"
              style={{ padding:"5px 10px", fontSize:"0.68rem", ...(resolution===r?{borderColor:"var(--gold)",color:"var(--gold)"}:{}) }}
              onClick={() => setRes(r)}>
              {r==="D"?"Daily":`${r}m`}
            </button>
          ))}
        </div>
      </div>

      {loading && <div style={{ display:"flex",justifyContent:"center",padding:"48px 0" }}><div className="spinner"/></div>}

      {error && (
        <div style={{ background:"var(--gold-dim)", border:"1px solid var(--gold-dim)", borderRadius:"var(--radius-md)", padding:"16px", marginBottom:16 }}>
          <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.78rem", color:"var(--gold-light)", marginBottom:8 }}>
            ⚠ {error}
          </p>
          <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.72rem", color:"var(--text-muted)", lineHeight:1.6 }}>
            Tips: Try a different resolution (e.g. Daily), or ensure the ticker is a US/TSX stock supported by Finnhub.
            Some tickers only have daily candles available on the free API tier.
          </p>
          <button className="qti-btn-ghost" onClick={load} style={{ marginTop:12, fontSize:"0.72rem" }}>Retry</button>
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <>
          {/* ── Summary tiles ── */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20 }}>
            {/* RSI */}
            <div className="metric-card" style={{ borderTop:"2px solid var(--gold)" }}>
              <div className="metric-label">RSI (14)</div>
              <div className="metric-value" style={{ fontSize:"1.4rem" }}>{rsiVal?.toFixed(1) ?? "—"}</div>
              {rsiStatus && <div style={{ fontSize:"0.72rem", color:rsiStatus.c, marginTop:5, fontFamily:"var(--font-mono)" }}>{rsiStatus.l}</div>}
              <div style={{ marginTop:8, height:4, background:"var(--bg-elevated)", borderRadius:2, overflow:"hidden" }}>
                {rsiVal!=null && <div style={{ width:`${rsiVal}%`, height:"100%", background: rsiVal>70?"var(--red-bright)":rsiVal<30?"var(--green-bright)":"var(--gold)", transition:"width 0.4s" }} />}
              </div>
            </div>

            {/* MACD */}
            <div className="metric-card" style={{ borderTop:"2px solid var(--gold)" }}>
              <div className="metric-label">MACD Signal</div>
              <div className="metric-value" style={{ fontSize:"1rem", marginTop:4 }}>
                {macdStatus ? <span style={{ color:macdStatus.c }}>{macdStatus.l}</span> : "—"}
              </div>
              {macdVal!=null && <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.7rem", color:"var(--text-muted)", marginTop:6 }}>
                Line: {macdVal.toFixed(3)} / Sig: {sigVal?.toFixed(3)}
              </div>}
            </div>

            {/* Bollinger */}
            <div className="metric-card" style={{ borderTop:"2px solid var(--gold)" }}>
              <div className="metric-label">Bollinger Band</div>
              <div className="metric-value" style={{ fontSize:"1rem", marginTop:4 }}>
                {bbStatus ? <span style={{ color:bbStatus.c }}>{bbStatus.l}</span> : "—"}
              </div>
              {bbUVal!=null && bbLVal!=null && <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.7rem", color:"var(--text-muted)", marginTop:6 }}>
                U: ${bbUVal} / L: ${bbLVal}
              </div>}
            </div>
          </div>

          {/* ── Bollinger Bands chart ── */}
          <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.68rem", color:"var(--text-secondary)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.1em" }}>Bollinger Bands (20, 2σ)</p>
          <div className="table-wrap" style={{ marginBottom:20 }}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data} margin={{top:4,right:4,bottom:4,left:8}}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="lbl" tick={tick()} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis domain={["auto","auto"]} tick={tick()} axisLine={false} tickLine={false} width={50} tickFormatter={v=>`$${v.toFixed(0)}`} />
                <Tooltip {...TT_STYLE} formatter={(v:any,n:string)=>[`$${Number(v).toFixed(2)}`,n]} />
                <Line type="monotone" dataKey="close" stroke="var(--gold)"         strokeWidth={2} dot={false} name="Close" />
                <Line type="monotone" dataKey="bbU"   stroke="var(--red-bright)"   strokeWidth={1} strokeDasharray="4 3" dot={false} name="Upper BB" />
                <Line type="monotone" dataKey="bbM"   stroke="var(--text-muted)"   strokeWidth={1} strokeDasharray="3 3" dot={false} name="SMA 20" />
                <Line type="monotone" dataKey="bbL"   stroke="var(--green-bright)" strokeWidth={1} strokeDasharray="4 3" dot={false} name="Lower BB" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* ── RSI chart ── */}
          <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.68rem", color:"var(--text-secondary)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.1em" }}>Relative Strength Index (14)</p>
          <div className="table-wrap" style={{ marginBottom:20 }}>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={data} margin={{top:4,right:4,bottom:4,left:8}}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="lbl" tick={tick()} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis domain={[0,100]} tick={tick()} axisLine={false} tickLine={false} width={28} />
                <Tooltip {...TT_STYLE} formatter={(v:any)=>[Number(v).toFixed(1),"RSI"]} />
                <ReferenceLine y={70} stroke="var(--red-bright)"   strokeDasharray="4 3" label={{value:"70 — Overbought",position:"right",fill:"var(--red-bright)",fontSize:8}} />
                <ReferenceLine y={30} stroke="var(--green-bright)" strokeDasharray="4 3" label={{value:"30 — Oversold",  position:"right",fill:"var(--green-bright)",fontSize:8}} />
                <Line type="monotone" dataKey="rsi" stroke="var(--gold)" strokeWidth={2} dot={false} name="RSI" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* ── MACD chart ── */}
          <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.68rem", color:"var(--text-secondary)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.1em" }}>MACD (12 / 26 / 9)</p>
          <div className="table-wrap">
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={data} margin={{top:4,right:4,bottom:4,left:8}}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="lbl" tick={tick()} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis domain={["auto","auto"]} tick={tick()} axisLine={false} tickLine={false} width={44} />
                <Tooltip {...TT_STYLE} formatter={(v:any,n:string)=>[Number(v).toFixed(4),n]} />
                <ReferenceLine y={0} stroke="var(--border-bright)" />
                <Line type="monotone" dataKey="macd" stroke="var(--green-bright)" strokeWidth={2}   dot={false} name="MACD"   />
                <Line type="monotone" dataKey="sig"  stroke="var(--gold)"         strokeWidth={1.5} dot={false} name="Signal" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Interpretation guide */}
          <div style={{ marginTop:16, background:"var(--bg-elevated)", borderRadius:"var(--radius-md)", padding:"12px 16px" }}>
            <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.62rem", color:"var(--gold)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8 }}>How to read</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:8 }}>
              {[
                {t:"RSI > 70",d:"Overbought — may pull back"},
                {t:"RSI < 30",d:"Oversold — may bounce"},
                {t:"MACD crosses up",d:"Bullish momentum shift"},
                {t:"MACD crosses down",d:"Bearish momentum shift"},
                {t:"Price > Upper BB",d:"Extended — watch for reversal"},
                {t:"Price < Lower BB",d:"Compressed — watch for bounce"},
              ].map(g=>(
                <div key={g.t} style={{ fontFamily:"var(--font-mono)", fontSize:"0.68rem" }}>
                  <span style={{ color:"var(--text-primary)", fontWeight:600 }}>{g.t}</span>
                  <span style={{ color:"var(--text-muted)", display:"block" }}>{g.d}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
