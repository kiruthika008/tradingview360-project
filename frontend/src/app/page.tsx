"use client";
import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import MetricCard from "@/components/MetricCard";
import PriceChart from "@/components/PriceChart";
import TechnicalIndicators from "@/components/TechnicalIndicators";
import NewsPanel from "@/components/NewsPanel";
import AIChat from "@/components/AIChat";
import Watchlist from "@/components/Watchlist";
import PortfolioTracker from "@/components/PortfolioTracker";
import PriceAlerts from "@/components/PriceAlerts";
import SectorPeers from "@/components/SectorPeers";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";

interface Quote {
  ticker: string; price: number; change: number; signal: string;
  open?: number; high?: number; low?: number; prev_close?: number;
}

type Tab = "overview" | "technicals" | "news" | "portfolio" | "alerts" | "peers";
const TABS: { id: Tab; label: string; requiresAuth?: boolean }[] = [
  { id:"overview",   label:"📊 Overview"    },
  { id:"technicals", label:"📐 Technicals"  },
  { id:"news",       label:"📰 News"        },
  { id:"portfolio",  label:"💼 Portfolio",  requiresAuth: true },
  { id:"alerts",     label:"🔔 Alerts",     requiresAuth: true },
  { id:"peers",      label:"🏢 Peers"       },
];

function AuthGate({ feature, onLogin }: { feature: string; onLogin: () => void }) {
  return (
    <div className="auth-gate">
      <div style={{ fontSize:"2.5rem", marginBottom:12 }}>🔒</div>
      <h3 style={{ fontFamily:"var(--font-sans)", fontWeight:700, fontSize:"1.1rem", color:"var(--text-primary)", marginBottom:8 }}>
        Sign in to access {feature}
      </h3>
      <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.78rem", color:"var(--text-secondary)", marginBottom:20, lineHeight:1.6 }}>
        Create a free account to save your {feature.toLowerCase()} across sessions,<br />
        receive email alerts, and subscribe to market feeds.
      </p>
      <button className="qti-btn" onClick={onLogin} style={{ padding:"10px 28px" }}>
        Sign In / Register — Free →
      </button>
    </div>
  );
}

export default function HomePage() {
  const { user, logout } = useAuth();
  const [ticker, setTicker]     = useState("AAPL");
  const [inputVal, setInputVal] = useState("AAPL");
  const [quote, setQuote]       = useState<Quote | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [currency, setCurrency] = useState<"USD"|"CAD">("USD");
  const [usdCad, setUsdCad]     = useState(1.35);
  const [tab, setTab]           = useState<Tab>("overview");
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail]       = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => { api.fx().then(r => setUsdCad(r.usd_to_cad)).catch(() => {}); }, []);
  useEffect(() => { fetchQuote("AAPL"); }, []);

  const formatPrice = useCallback((v: number) => {
    if (currency === "CAD") return `C$${(v * usdCad).toLocaleString("en-US", { minimumFractionDigits:2, maximumFractionDigits:2 })}`;
    return `$${v.toLocaleString("en-US", { minimumFractionDigits:2, maximumFractionDigits:2 })}`;
  }, [currency, usdCad]);

  async function fetchQuote(sym: string) {
    setLoading(true); setError("");
    try {
      const q = await api.quote(sym);
      setQuote(q); setTicker(sym);
    } catch (e: any) {
      setError(e.message || "Invalid ticker"); setQuote(null);
    } finally { setLoading(false); }
  }

  function handleTabClick(t: Tab) {
    const tabDef = TABS.find(x => x.id === t);
    if (tabDef?.requiresAuth && !user) { setShowAuth(true); return; }
    setTab(t);
  }

  const signalClass = quote?.signal === "BUY" ? "signal-buy" : quote?.signal === "SELL" ? "signal-sell" : "signal-hold";
  const signalIcon  = quote?.signal === "BUY" ? "▲" : quote?.signal === "SELL" ? "▼" : "◆";

  return (
    <div className="page-wrap">
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      <Navbar onShowAuth={() => setShowAuth(true)} />
      <HeroBanner />

      {/* ── Search / Controls bar ── */}
      <div className="search-bar">
        {/* Currency */}
        <div style={{ display:"flex", gap:4, flexShrink:0 }}>
          {(["USD","CAD"] as const).map(c => (
            <button key={c}
              className={currency === c ? "qti-btn" : "qti-btn-ghost"}
              style={{ padding:"7px 14px", fontSize:"0.74rem" }}
              onClick={() => setCurrency(c)}
            >
              {c === "USD" ? "🇺🇸 USD" : "🇨🇦 CAD"}
            </button>
          ))}
        </div>

        <div className="search-bar-divider" />

        {/* Ticker search */}
        <div className="search-group">
          <input className="qti-input" value={inputVal}
            onChange={e => setInputVal(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && fetchQuote(inputVal.trim())}
            placeholder="Ticker: AAPL / BNS.TO / TSLA"
          />
          <button className="qti-btn" onClick={() => fetchQuote(inputVal.trim())} disabled={loading} style={{ flexShrink:0 }}>
            {loading ? "…" : "Search"}
          </button>
        </div>

        {/* Email subscription (login-gated) */}
        {user ? (
          <div className="email-group">
            <input className="qti-input" type="email" placeholder="Email alerts"
              value={email} onChange={e => setEmail(e.target.value)} />
            <button className="qti-btn-ghost" style={{ flexShrink:0 }}
              onClick={() => { if (email) setSubscribed(true); }}>
              {subscribed ? "✓ On" : "Subscribe"}
            </button>
          </div>
        ) : (
          <button className="qti-btn-ghost" onClick={() => setShowAuth(true)} style={{ flexShrink:0 }}>
            🔔 Sign in for alerts
          </button>
        )}
      </div>

      {/* ── Error display ── */}
      {error && (
        <div style={{
          background:"var(--red-dim)", border:"1px solid rgba(239,68,68,0.3)",
          borderRadius:"var(--radius-lg)", padding:"14px 18px", marginBottom:14,
          fontFamily:"var(--font-mono)", fontSize:"0.82rem", color:"var(--red-bright)",
        }}>
          ⚠ {error}
          {error.includes("NEXT_PUBLIC_API_URL") && (
            <div style={{ marginTop:8, fontSize:"0.73rem", color:"var(--text-muted)", lineHeight:1.7 }}>
              Fix: Vercel → Settings → Environment Variables → add <code style={{ color:"var(--gold)" }}>NEXT_PUBLIC_API_URL=https://your-backend.onrender.com</code> → Redeploy.
            </div>
          )}
        </div>
      )}

      {/* ── AdSense banner — top, between search and content (mobile friendly) ── */}
      <div style={{ marginBottom:16 }}>
        <AdBanner slot="TOP_BANNER_SLOT" format="horizontal" />
      </div>

      {/* ── 3-col main grid ── */}
      <div className="main-grid">

        {/* Left ad */}
        <div className="ad-col">
          <AdBanner slot="LEFT_AD_SLOT" style={{ position:"sticky", top:16 }} />
        </div>

        {/* Main content */}
        <div>
          {quote ? (
            <>
              {/* Metrics row 1 */}
              <div className="metrics-3">
                <MetricCard label="Ticker" value={quote.ticker} />
                <MetricCard label="Price" value={formatPrice(quote.price)}
                  delta={`${Math.abs(quote.change).toFixed(2)}%`}
                  deltaPositive={quote.change >= 0} />
                <MetricCard label="Change"
                  value={`${quote.change >= 0 ? "+" : ""}${quote.change.toFixed(2)}%`}
                  delta={quote.prev_close ? `Prev ${formatPrice(quote.prev_close)}` : undefined}
                  deltaPositive={quote.change >= 0} />
              </div>

              {/* Metrics row 2 */}
              {(quote.high || quote.low) && (
                <div className="metrics-4">
                  <MetricCard label="Open"       value={formatPrice(quote.open ?? 0)} />
                  <MetricCard label="Day High"   value={formatPrice(quote.high ?? 0)} />
                  <MetricCard label="Day Low"    value={formatPrice(quote.low ?? 0)} />
                  <MetricCard label="Prev Close" value={formatPrice(quote.prev_close ?? 0)} />
                </div>
              )}

              {/* Signal */}
              <div style={{ marginBottom:14 }}>
                <span className={signalClass}>{signalIcon} {quote.signal} SIGNAL</span>
              </div>

              {/* Tabs */}
              <div className="tab-bar" style={{ marginBottom:16 }}>
                {TABS.map(t => (
                  <button key={t.id}
                    className={`tab-btn${tab === t.id ? " active" : ""}`}
                    onClick={() => handleTabClick(t.id)}
                  >
                    {t.label}{t.requiresAuth && !user ? " 🔒" : ""}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {tab === "overview" && <>
                <PriceChart symbol={ticker} />
                <Watchlist formatPrice={formatPrice} />
                <AIChat stockInfo={quote} />
              </>}
              {tab === "technicals" && <TechnicalIndicators symbol={ticker} />}
              {tab === "news"       && <NewsPanel symbol={ticker} />}
              {tab === "portfolio"  && (
                user
                  ? <PortfolioTracker formatPrice={formatPrice} defaultTicker={ticker} />
                  : <AuthGate feature="Portfolio" onLogin={() => setShowAuth(true)} />
              )}
              {tab === "alerts" && (
                user
                  ? <PriceAlerts currentTicker={ticker} currentPrice={quote.price} formatPrice={formatPrice} />
                  : <AuthGate feature="Price Alerts" onLogin={() => setShowAuth(true)} />
              )}
              {tab === "peers" && <SectorPeers symbol={ticker} formatPrice={formatPrice} />}
            </>
          ) : !loading && !error ? (
            <div style={{ textAlign:"center", padding:"60px 20px", color:"var(--text-muted)", fontFamily:"var(--font-mono)", fontSize:"0.85rem" }}>
              Enter a ticker symbol above to begin.
            </div>
          ) : loading ? (
            <div style={{ display:"flex", justifyContent:"center", padding:"60px 0" }}>
              <div className="spinner" style={{ width:28, height:28 }} />
            </div>
          ) : null}
        </div>

        {/* Right ad */}
        <div className="ad-col">
          <AdBanner slot="RIGHT_AD_SLOT" style={{ position:"sticky", top:16 }} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
