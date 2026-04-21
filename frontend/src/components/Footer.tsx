"use client";
import { useState } from "react";
import Link from "next/link";

const FOOTER_LINKS = {
  "Platform": [
    { label:"Stock Scanner",   href:"/" },
    { label:"Technical Charts",href:"/" },
    { label:"Portfolio Tracker",href:"/" },
    { label:"Price Alerts",    href:"/" },
    { label:"AI Assistant",    href:"/" },
    { label:"Watchlist",       href:"/" },
  ],
  "Markets": [
    { label:"US Stocks (NYSE / NASDAQ)", href:"/" },
    { label:"Canadian Stocks (TSX)",     href:"/" },
    { label:"ETFs",                       href:"/" },
    { label:"USD / CAD Converter",        href:"/" },
  ],
  "Company": [
    { label:"About Us",      href:"/about" },
    { label:"Contact Us",    href:"/contact" },
    { label:"Privacy Policy",href:"/privacy" },
    { label:"Terms of Use",  href:"/terms" },
    { label:"Disclaimer",    href:"/disclaimer" },
  ],
  "Resources": [
    { label:"How to Read RSI",          href:"/" },
    { label:"MACD Explained",           href:"/" },
    { label:"Bollinger Bands Guide",    href:"/" },
    { label:"What is a BUY Signal?",    href:"/" },
    { label:"Finnhub Data Docs",        href:"https://finnhub.io/docs/api" },
    { label:"Anthropic Claude API",     href:"https://docs.anthropic.com" },
  ],
};

const STATS = [
  { value:"10,000+", label:"Tickers Covered"  },
  { value:"Free",    label:"Always"            },
  { value:"Live",    label:"Market Data"       },
  { value:"AI",      label:"Powered Analysis"  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone]   = useState(false);

  return (
    <footer style={{
      background:"var(--bg-surface)",
      border:"1px solid var(--border)",
      borderRadius:"20px 20px 0 0",
      marginTop:60, padding:"48px 40px 28px",
    }}>

      {/* Stats bar */}
      <div style={{
        display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:1,
        background:"var(--border)", borderRadius:12, overflow:"hidden",
        marginBottom:48,
      }}>
        {STATS.map(s => (
          <div key={s.label} style={{
            background:"var(--bg-card)", padding:"18px 20px", textAlign:"center",
          }}>
            <div style={{
              fontFamily:"'Syne',sans-serif", fontWeight:800,
              fontSize:"1.45rem", color:"var(--gold)", letterSpacing:"-0.5px",
            }}>
              {s.value}
            </div>
            <div style={{
              fontFamily:"'DM Mono',monospace", fontSize:"0.68rem",
              color:"var(--text-muted)", letterSpacing:"0.08em",
              textTransform:"uppercase", marginTop:4,
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Main footer grid */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", gap:32, marginBottom:48 }}>

        {/* Brand column */}
        <div>
          <div style={{
            fontFamily:"'Syne',sans-serif", fontWeight:800,
            fontSize:"1.15rem", color:"var(--text-primary)", marginBottom:12,
          }}>
            Quantum <span style={{ color:"var(--gold)" }}>Trade</span> Intelligence
          </div>
          <p style={{
            fontFamily:"'DM Mono',monospace", fontSize:"0.78rem",
            color:"var(--text-secondary)", lineHeight:1.7, marginBottom:20,
          }}>
            A free, AI-powered stock terminal for everyday investors in the US and Canada.
            No login. No subscription. Just data, signals, and smart analysis.
          </p>

          {/* Newsletter signup */}
          <div style={{
            background:"var(--bg-elevated)", border:"1px solid var(--border-bright)",
            borderRadius:10, padding:"16px",
          }}>
            <div style={{
              fontFamily:"'DM Mono',monospace", fontSize:"0.68rem",
              color:"var(--gold)", letterSpacing:"0.1em", textTransform:"uppercase",
              marginBottom:10,
            }}>
              📬 Market Updates
            </div>
            <p style={{
              fontFamily:"'DM Mono',monospace", fontSize:"0.74rem",
              color:"var(--text-muted)", marginBottom:10, lineHeight:1.5,
            }}>
              Get weekly market signals and feature updates. No spam, ever.
            </p>
            {done ? (
              <div style={{
                fontFamily:"'DM Mono',monospace", fontSize:"0.78rem",
                color:"var(--green)", padding:"8px 0",
              }}>
                ✓ You're subscribed!
              </div>
            ) : (
              <div style={{ display:"flex", gap:8 }}>
                <input
                  className="qti-input"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ flex:1, fontSize:"0.78rem", padding:"8px 12px" }}
                />
                <button
                  className="qti-btn"
                  style={{ padding:"8px 14px", fontSize:"0.72rem", flexShrink:0 }}
                  onClick={() => { if (email) setDone(true); }}
                >
                  Join
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
          <div key={heading}>
            <div style={{
              fontFamily:"'DM Mono',monospace", fontSize:"0.65rem",
              fontWeight:500, letterSpacing:"0.12em", textTransform:"uppercase",
              color:"var(--gold)", marginBottom:14,
              paddingBottom:8, borderBottom:"1px solid rgba(212,168,67,0.2)",
            }}>
              {heading}
            </div>
            <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:8 }}>
              {links.map(l => (
                <li key={l.label}>
                  <Link href={l.href} style={{
                    fontFamily:"'DM Mono',monospace", fontSize:"0.76rem",
                    color:"var(--text-secondary)", textDecoration:"none",
                    transition:"color 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Big disclaimer block */}
      <div style={{
        background:"var(--bg-card)", border:"1px solid var(--border)",
        borderLeft:"3px solid rgba(212,168,67,0.4)",
        borderRadius:10, padding:"18px 20px", marginBottom:28,
        fontFamily:"'DM Mono',monospace", fontSize:"0.72rem",
        color:"var(--text-muted)", lineHeight:1.8,
      }}>
        <strong style={{ color:"var(--gold)", display:"block", marginBottom:6, fontSize:"0.74rem", letterSpacing:"0.06em" }}>
          ⚠ IMPORTANT DISCLAIMER
        </strong>
        Quantum Trade Intelligence ("QTI") is provided for <strong style={{ color:"var(--text-secondary)" }}>informational and educational purposes only</strong>.
        Nothing on this platform constitutes financial, investment, legal, or tax advice.
        All BUY / SELL / HOLD signals are generated algorithmically and should not be relied
        upon as the sole basis for any investment decision. Past performance is not indicative
        of future results. Investing in stocks and securities involves risk of loss, including
        possible loss of principal. Always consult a licensed financial advisor before making
        investment decisions. Market data is sourced from Finnhub and may be delayed.
        AI analysis is generated by Anthropic Claude and may contain errors.
        QTI is not registered as an investment advisor with any regulatory authority.
      </div>

      {/* Bottom bar */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        flexWrap:"wrap", gap:12,
        paddingTop:20, borderTop:"1px solid var(--border)",
      }}>
        <div style={{
          fontFamily:"'DM Mono',monospace", fontSize:"0.66rem",
          color:"var(--text-muted)", letterSpacing:"0.06em",
        }}>
          © {new Date().getFullYear()} Quantum Trade Intelligence · All rights reserved ·
          Data by <a href="https://finnhub.io" target="_blank" rel="noopener noreferrer"
            style={{ color:"var(--text-muted)", textDecoration:"underline" }}>Finnhub</a> ·
          AI by <a href="https://anthropic.com" target="_blank" rel="noopener noreferrer"
            style={{ color:"var(--text-muted)", textDecoration:"underline" }}>Anthropic</a>
        </div>

        <div style={{ display:"flex", gap:16 }}>
          {[
            { label:"Privacy",    href:"/privacy"     },
            { label:"Terms",      href:"/terms"       },
            { label:"Disclaimer", href:"/disclaimer"  },
            { label:"Contact",    href:"/contact"     },
          ].map(l => (
            <Link key={l.label} href={l.href} style={{
              fontFamily:"'DM Mono',monospace", fontSize:"0.66rem",
              color:"var(--text-muted)", textDecoration:"none",
              transition:"color 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
