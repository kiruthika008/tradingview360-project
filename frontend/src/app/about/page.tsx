"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const TIMELINE = [
  { year:"2024", title:"The Problem",     desc:"Retail investors — especially Canadians — were paying $200–$500/month for terminal access that institutional traders get by default. We decided to fix that." },
  { year:"Q1 2025", title:"v1.0 Launch",  desc:"Basic stock scanner with Finnhub data integration, live quotes, and a watchlist. 100% free. No login required." },
  { year:"Q2 2025", title:"AI Integration", desc:"Added Claude AI assistant for plain-English BUY/SELL/HOLD reasoning. Added RSI, MACD, and Bollinger Band charts." },
  { year:"Q3 2025", title:"Canadian Markets", desc:"Added TSX support and real-time CAD/USD toggle with live exchange rates. BNS.TO, RY.TO, and thousands of TSX tickers now supported." },
  { year:"Q4 2025", title:"Portfolio & Alerts", desc:"Launched portfolio P&L tracker and price alert system. Added company profiles and peer comparison charts." },
  { year:"2026",    title:"Terminal v2.0", desc:"Full frontend/backend separation. Deployed on Vercel + Render for maximum performance. You're here now." },
];

const VALUES = [
  { icon:"🆓", title:"Always Free",         desc:"We believe access to quality financial data shouldn't be gated behind expensive subscriptions. The core platform will always be free." },
  { icon:"🔍", title:"Transparent",         desc:"We tell you exactly where our data comes from (Finnhub), how our signals are calculated (price momentum), and what our AI can and cannot do." },
  { icon:"🇨🇦", title:"Canada-Inclusive",   desc:"Most trading tools are US-centric. We explicitly support TSX-listed stocks and CAD pricing because Canadian investors deserve good tools too." },
  { icon:"🤖", title:"AI-Augmented",        desc:"We use Claude AI to add a layer of natural language reasoning on top of raw data — but we always remind you it's a tool, not a financial advisor." },
  { icon:"⚡", title:"Fast & Lightweight",  desc:"No bloated dashboards. No 10-second load times. We prioritize speed because when markets are moving, you need information now." },
  { icon:"🔒", title:"Privacy-Respecting",  desc:"No mandatory accounts. No selling your data. No dark patterns. Use the platform and leave — we don't track you." },
];

export default function AboutPage() {
  return (
    <div className="page-wrap">
      <Navbar />

      <div style={{ maxWidth:860, margin:"0 auto" }}>
        {/* Breadcrumb */}
        <div style={{
          fontFamily:"var(--font-mono)", fontSize:"0.7rem",
          color:"var(--text-muted)", marginBottom:24, display:"flex", gap:8, alignItems:"center",
        }}>
          <Link href="/" style={{ color:"var(--gold)", textDecoration:"none" }}>Home</Link>
          <span>›</span>
          <span>About Us</span>
        </div>

        {/* Hero */}
        <div style={{
          background:"var(--bg-surface)", border:"1px solid var(--border)",
          borderRadius:20, padding:"44px 48px", marginBottom:28,
          position:"relative", overflow:"hidden",
        }}>
          <div style={{
            position:"absolute", top:-60, right:-60, width:300, height:300, borderRadius:"50%",
            background:"radial-gradient(circle, rgba(212,168,67,0.07) 0%, transparent 70%)",
            pointerEvents:"none",
          }} />
          <div style={{
            fontFamily:"var(--font-mono)", fontSize:"0.65rem",
            color:"var(--gold)", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:14,
          }}>
            Our Story
          </div>
          <h1 style={{
            fontFamily:"var(--font-sans)", fontWeight:800,
            fontSize:"clamp(1.8rem, 3vw, 2.6rem)",
            letterSpacing:"-1px", color:"var(--text-primary)",
            lineHeight:1.15, marginBottom:20,
          }}>
            Institutional-Grade Tools.<br />
            <span style={{ background:"linear-gradient(90deg, var(--gold), var(--gold-light))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Zero Cost.
            </span>
          </h1>
          <p style={{
            fontFamily:"var(--font-mono)", fontSize:"0.88rem",
            color:"var(--text-secondary)", lineHeight:1.8, maxWidth:600,
          }}>
            QTI was built out of frustration. Professional traders get Bloomberg terminals.
            Retail investors get delayed quotes and paywalled research. We built Quantum Trade
            Intelligence to close that gap — bringing real-time data, AI-powered analysis, and
            technical charting to everyday investors at no cost.
          </p>
        </div>

        {/* Values grid */}
        <div style={{ marginBottom:32 }}>
          <div className="section-label">What We Stand For</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {VALUES.map(v => (
              <div key={v.title} style={{
                background:"var(--bg-card)", border:"1px solid var(--border)",
                borderRadius:12, padding:"20px 18px",
                transition:"border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(212,168,67,0.35)";
                el.style.background = "var(--bg-elevated)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--border)";
                el.style.background = "var(--bg-card)";
              }}
              >
                <div style={{ fontSize:"1.6rem", marginBottom:10 }}>{v.icon}</div>
                <div style={{
                  fontFamily:"var(--font-sans)", fontWeight:700, fontSize:"0.88rem",
                  color:"var(--text-primary)", marginBottom:8,
                }}>
                  {v.title}
                </div>
                <div style={{
                  fontFamily:"var(--font-mono)", fontSize:"0.74rem",
                  color:"var(--text-secondary)", lineHeight:1.65,
                }}>
                  {v.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div style={{ marginBottom:40 }}>
          <div className="section-label">Product Timeline</div>
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {TIMELINE.map((t, i) => (
              <div key={i} style={{ display:"flex", gap:20 }}>
                {/* Timeline spine */}
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0, width:80 }}>
                  <div style={{
                    fontFamily:"var(--font-mono)", fontSize:"0.68rem",
                    color:"var(--gold)", fontWeight:500, textAlign:"right",
                    paddingTop:18, width:"100%",
                  }}>
                    {t.year}
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flex:1 }}>
                    <div style={{
                      width:10, height:10, borderRadius:"50%",
                      background:"var(--gold)", marginTop:22, flexShrink:0,
                      boxShadow:"0 0 10px rgba(212,168,67,0.4)",
                    }} />
                    {i < TIMELINE.length - 1 && (
                      <div style={{ width:1, flex:1, background:"var(--border-bright)", marginTop:4 }} />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div style={{
                  background:"var(--bg-card)", border:"1px solid var(--border)",
                  borderRadius:10, padding:"16px 18px",
                  margin:"12px 0", flex:1,
                }}>
                  <div style={{
                    fontFamily:"var(--font-sans)", fontWeight:700, fontSize:"0.9rem",
                    color:"var(--text-primary)", marginBottom:6,
                  }}>
                    {t.title}
                  </div>
                  <div style={{
                    fontFamily:"var(--font-mono)", fontSize:"0.76rem",
                    color:"var(--text-secondary)", lineHeight:1.6,
                  }}>
                    {t.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          background:"var(--bg-surface)", border:"1px solid rgba(212,168,67,0.25)",
          borderRadius:16, padding:"32px 36px", textAlign:"center", marginBottom:40,
        }}>
          <div style={{
            fontFamily:"var(--font-sans)", fontWeight:800, fontSize:"1.3rem",
            color:"var(--text-primary)", marginBottom:12,
          }}>
            Ready to start trading smarter?
          </div>
          <p style={{
            fontFamily:"var(--font-mono)", fontSize:"0.8rem",
            color:"var(--text-secondary)", marginBottom:20, lineHeight:1.6,
          }}>
            No signup. No credit card. Just search a ticker and get instant AI-powered analysis.
          </p>
          <Link href="/" style={{ textDecoration:"none" }}>
            <button className="qti-btn" style={{ padding:"13px 36px", fontSize:"0.88rem" }}>
              Launch Terminal →
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
