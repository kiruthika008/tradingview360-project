"use client";
import { useState, useEffect } from "react";

const TICKERS = ["AAPL", "RELIANCE.NS", "TSLA", "TCS.NS", "NVDA", "INFY.NS", "MSFT", "HDFCBANK.NS", "BNS.TO", "WIPRO.NS", "SPY", "ZOMATO.NS"];
const FEATURES = [
  { icon:"⚡", label:"Live Quotes",      desc:"Real-time prices, delayed ≤15s" },
  { icon:"🤖", label:"AI Analysis",      desc:"Claude-powered BUY/SELL/HOLD" },
  { icon:"📐", label:"Technical Charts", desc:"RSI, MACD, Bollinger Bands" },
  { icon:"💼", label:"Portfolio Tracker",desc:"P&L tracked across positions" },
  { icon:"🔔", label:"Price Alerts",     desc:"Trigger above or below targets" },
  { icon:"🇨🇦", label:"CAD/USD Toggle",  desc:"Instant currency conversion" },
  { icon:"🇮🇳", label:"Indian Markets",  desc:"NSE & BSE via Finnhub" },
];

export default function HeroBanner() {
  const [tickerIdx, setTickerIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setTickerIdx(i => (i + 1) % TICKERS.length);
        setVisible(true);
      }, 300);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: 20,
      padding: "36px 40px 32px",
      marginBottom: 20,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative glow blobs */}
      <div style={{
        position:"absolute", top:-60, right:-40, width:320, height:320,
        borderRadius:"50%",
        background:"radial-gradient(circle, rgba(212,168,67,0.07) 0%, transparent 70%)",
        pointerEvents:"none",
      }} />
      <div style={{
        position:"absolute", bottom:-80, left:-60, width:260, height:260,
        borderRadius:"50%",
        background:"radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%)",
        pointerEvents:"none",
      }} />

      {/* Top row: headline + animated ticker */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:20, marginBottom:18 }}>
        <div style={{ maxWidth:620 }}>
          {/* Eyebrow */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            fontFamily:"var(--font-mono)", fontSize:"0.68rem", fontWeight:500,
            letterSpacing:"0.12em", textTransform:"uppercase",
            color:"var(--gold)", marginBottom:14,
          }}>
            <span style={{ width:20, height:1, background:"var(--gold)", display:"inline-block" }} />
            Free · No Login Required · Updated Daily
            <span style={{ width:20, height:1, background:"var(--gold)", display:"inline-block" }} />
          </div>

          {/* Main headline */}
          <h1 style={{
            fontFamily:"var(--font-sans)", fontWeight:800,
            fontSize:"clamp(1.6rem, 3vw, 2.4rem)",
            lineHeight:1.15, letterSpacing:"-1px",
            color:"var(--text-primary)", marginBottom:14,
          }}>
            Your Free AI-Powered{" "}
            <span style={{
              background:"linear-gradient(90deg, var(--gold), var(--gold-light))",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            }}>
              Stock Terminal
            </span>
            <br />for US, Canadian &amp; Indian Markets
          </h1>

          {/* Sub-copy */}
          <p style={{
            fontFamily:"var(--font-mono)", fontSize:"0.88rem",
            color:"var(--text-secondary)", lineHeight:1.7, maxWidth:560,
          }}>
            Get institutional-grade analysis without the $300/month price tag. Search any ticker,
            read AI signals powered by Claude, track your portfolio, set price alerts, and scan
            the market — all in one terminal. Works for{" "}
            <span style={{ color:"var(--text-primary)", fontWeight:500 }}>NYSE, NASDAQ, TSX</span>{" "}
            and more.
          </p>
        </div>

        {/* Animated ticker display */}
        <div style={{
          background:"var(--bg-card)", border:"1px solid var(--border-bright)",
          borderRadius:14, padding:"20px 28px", minWidth:180, textAlign:"center",
          flexShrink:0,
        }}>
          <div style={{
            fontFamily:"var(--font-mono)", fontSize:"0.65rem",
            color:"var(--text-muted)", letterSpacing:"0.1em",
            textTransform:"uppercase", marginBottom:10,
          }}>
            Now tracking
          </div>
          <div style={{
            fontFamily:"var(--font-sans)", fontWeight:800,
            fontSize:"1.8rem", letterSpacing:"-1px",
            color:"var(--gold)",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(-8px)",
            transition:"opacity 0.3s ease, transform 0.3s ease",
          }}>
            {TICKERS[tickerIdx]}
          </div>
          <div style={{
            fontFamily:"var(--font-mono)", fontSize:"0.65rem",
            color:"var(--text-muted)", letterSpacing:"0.06em", marginTop:8,
          }}>
            + thousands more
          </div>
        </div>
      </div>

      {/* Feature pills */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:22 }}>
        {FEATURES.map(f => (
          <div key={f.label} style={{
            display:"flex", alignItems:"center", gap:8,
            background:"var(--bg-elevated)", border:"1px solid var(--border-bright)",
            borderRadius:8, padding:"7px 14px",
            fontFamily:"var(--font-mono)", fontSize:"0.74rem",
          }}>
            <span style={{ fontSize:"0.9rem" }}>{f.icon}</span>
            <span style={{ color:"var(--text-primary)", fontWeight:500 }}>{f.label}</span>
            <span style={{ color:"var(--text-muted)" }}>— {f.desc}</span>
          </div>
        ))}
      </div>

      {/* Why come back / value props */}
      <div style={{
        display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12,
      }}>
        {[
          {
            icon:"🔄",
            title:"Updated Every Session",
            body:"Prices, news, and AI signals refresh each time you search. Bookmark us and check back before every trade.",
          },
          {
            icon:"🧠",
            title:"AI That Explains Itself",
            body:"Don't just get a BUY signal — ask Claude why. Get plain-English reasoning, risk factors, and what to watch.",
          },
          {
            icon:"🇨🇦",
            title:"Built for Canadians Too",
            body:"Toggle between USD and CAD with live exchange rates. TSX tickers like BNS.TO and RY.TO fully supported.",
          },
        ].map(v => (
          <div key={v.title} style={{
            background:"var(--bg-card)", border:"1px solid var(--border)",
            borderLeft:"3px solid var(--gold)",
            borderRadius:10, padding:"14px 16px",
          }}>
            <div style={{ fontSize:"1.1rem", marginBottom:6 }}>{v.icon}</div>
            <div style={{
              fontFamily:"var(--font-sans)", fontWeight:700, fontSize:"0.85rem",
              color:"var(--text-primary)", marginBottom:6,
            }}>
              {v.title}
            </div>
            <div style={{
              fontFamily:"var(--font-mono)", fontSize:"0.74rem",
              color:"var(--text-secondary)", lineHeight:1.6,
            }}>
              {v.body}
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer ribbon */}
      <div style={{
        marginTop:18, padding:"8px 14px",
        background:"rgba(212,168,67,0.06)", border:"1px solid rgba(212,168,67,0.15)",
        borderRadius:8,
        fontFamily:"var(--font-mono)", fontSize:"0.68rem",
        color:"var(--text-muted)", lineHeight:1.5,
      }}>
        ⚠ <strong style={{ color:"var(--gold)" }}>Not financial advice.</strong>{" "}
        QTI is an informational tool only. All signals are algorithmic and educational.
        Always do your own research before making investment decisions.
        Data provided by Finnhub. AI analysis by Anthropic Claude.
      </div>
    </div>
  );
}
