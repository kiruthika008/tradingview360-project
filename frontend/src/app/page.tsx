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
import IndiaSearch from "@/components/IndiaSearch";
import AuthModal from "@/components/AuthModal";
import { MarketStatusBar } from "@/components/MarketStatus";
import { useAuth } from "@/components/AuthProvider";
import { api, isIndianStock } from "@/lib/api";

interface Quote {
  ticker: string; price: number; change: number; signal: string;
  open?: number; high?: number; low?: number; prev_close?: number;
  market?: string; currency?: string;
}

type Currency = "USD" | "CAD" | "INR";
type Tab = "overview" | "technicals" | "news" | "portfolio" | "alerts" | "peers";

const TABS: { id: Tab; label: string; requiresAuth?: boolean }[] = [
  { id:"overview",   label:"📊 Overview"   },
  { id:"technicals", label:"📐 Technicals" },
  { id:"news",       label:"📰 News"       },
  { id:"portfolio",  label:"💼 Portfolio",  requiresAuth:true },
  { id:"alerts",     label:"🔔 Alerts",     requiresAuth:true },
  { id:"peers",      label:"🏢 Peers"      },
];

function AuthGate({ feature, onLogin }: { feature: string; onLogin: () => void }) {
  return (
    <div className="auth-gate">
      <div style={{ fontSize:"2.5rem", marginBottom:12 }}>🔒</div>
      <h3 style={{ fontFamily:"var(--font-sans)", fontWeight:700, fontSize:"1.1rem", color:"var(--text-primary)", marginBottom:8 }}>
        Sign in to access {feature}
      </h3>
      <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.78rem", color:"var(--text-secondary)", marginBottom:20, lineHeight:1.6 }}>
        Create a free account to save your {feature.toLowerCase()} across sessions, receive email alerts, and subscribe to market feeds.
      </p>
      <button className="qti-btn" onClick={onLogin} style={{ padding:"10px 28px" }}>
        Sign In / Register — Free →
      </button>
    </div>
  );
}

// Currency symbol helper
function getCurrencySymbol(c: Currency) {
  if (c === "CAD") return "C$";
  if (c === "INR") return "₹";
  return "$";
}

export default function HomePage() {
  const { user, logout } = useAuth();
  const [ticker, setTicker]     = useState("AAPL");
  const [inputVal, setInputVal] = useState("AAPL");
  const [quote, setQuote]       = useState<Quote | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [usdCad, setUsdCad]     = useState(1.35);
  const [usdInr, setUsdInr]     = useState(83.5);
  const [tab, setTab]           = useState<Tab>("overview");
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail]       = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [marketMode, setMarketMode] = useState<"global" | "india">("global");

  // Load FX rates on mount
  useEffect(() => {
    api.fxRates()
      .then(r => { setUsdCad(r.usd_to_cad); setUsdInr(r.usd_to_inr); })
      .catch(() => {});
  }, []);

  // Load default quote
  useEffect(() => { fetchQuote("AAPL"); }, []);

  // Auto-switch currency when Indian stock is loaded
  useEffect(() => {
    if (quote?.currency === "INR" && currency === "USD") setCurrency("INR");
    if (quote?.currency === "USD" && currency === "INR") setCurrency("USD");
  }, [quote?.currency]);

  const formatPrice = useCallback((v: number, nativeCurrency?: string) => {
    // If this is an INR-native price and we're showing INR, display directly
    if (nativeCurrency === "INR" && currency === "INR") {
      return `₹${v.toLocaleString("en-IN", { minimumFractionDigits:2, maximumFractionDigits:2 })}`;
    }
    // USD prices converted
    const sym = getCurrencySymbol(currency);
    let val = v;
    if (currency === "CAD") val = v * usdCad;
    if (currency === "INR") val = v * usdInr;
    return `${sym}${val.toLocaleString("en-IN", { minimumFractionDigits:2, maximumFractionDigits:2 })}`;
  }, [currency, usdCad, usdInr]);

  async function fetchQuote(sym: string) {
    setLoading(true); setError("");
    try {
      const q = await api.quote(sym.toUpperCase().trim());
      setQuote(q); setTicker(sym.toUpperCase().trim());
    } catch (e: any) {
      setError(e.message || "Invalid ticker");
      setQuote(null);
    } finally { setLoading(false); }
  }

  function handleTabClick(t: Tab) {
    const def = TABS.find(x => x.id === t);
    if (def?.requiresAuth && !user) { setShowAuth(true); return; }
    setTab(t);
  }

  function handleIndiaSelect(ticker: string) {
    setInputVal(ticker);
    fetchQuote(ticker);
  }

  const signalClass = quote?.signal === "BUY" ? "signal-buy" : quote?.signal === "SELL" ? "signal-sell" : "signal-hold";
  const signalIcon  = quote?.signal === "BUY" ? "▲" : quote?.signal === "SELL" ? "▼" : "◆";
  const isIndian    = quote ? isIndianStock(quote.ticker) : false;
  const nativeCur   = quote?.currency;

  return (
    <div className="page-wrap">
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      <Navbar onShowAuth={() => setShowAuth(true)} />
      <HeroBanner />

      {/* ── Market mode selector ── */}
      <div style={{
        display:"flex", gap:6, marginBottom:12,
        background:"var(--bg-surface)", border:"1px solid var(--border)",
        borderRadius:"var(--radius-xl)", padding:"10px 14px",
        flexWrap:"wrap",
      }}>
        <span style={{ fontFamily:"var(--font-mono)", fontSize:"0.65rem", color:"var(--text-muted)", letterSpacing:"0.1em", textTransform:"uppercase", alignSelf:"center", marginRight:4 }}>Market:</span>
        {[
          { id:"global", label:"🌍 US / CA / Global" },
          { id:"india",  label:"🇮🇳 India NSE / BSE"  },
        ].map(m => (
          <button key={m.id}
            className={marketMode === m.id ? "qti-btn" : "qti-btn-ghost"}
            style={{ padding:"6px 14px", fontSize:"0.74rem" }}
            onClick={() => setMarketMode(m.id as any)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* ── Search / Controls bar ── */}
      <div className="search-bar">
        {/* Currency toggle */}
        <div style={{ display:"flex", gap:4, flexShrink:0, flexWrap:"wrap" }}>
          {(["USD","CAD","INR"] as Currency[]).map(c => (
            <button key={c}
              className={currency === c ? "qti-btn" : "qti-btn-ghost"}
              style={{ padding:"6px 12px", fontSize:"0.72rem" }}
              onClick={() => setCurrency(c)}
            >
              {c === "USD" ? "🇺🇸 USD" : c === "CAD" ? "🇨🇦 CAD" : "🇮🇳 INR"}
            </button>
          ))}
        </div>

        <div className="search-bar-divider" />

        {/* Ticker search — India or Global */}
        {marketMode === "india" ? (
          <div style={{ flex:1, minWidth:0 }}>
            <IndiaSearch onSelect={handleIndiaSelect} />
          </div>
        ) : (
          <div className="search-group">
            <input className="qti-input"
              value={inputVal}
              onChange={e => setInputVal(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && fetchQuote(inputVal.trim())}
              placeholder="Ticker: AAPL / BNS.TO / RELIANCE.NS / INFY.NS"
            />
            <button className="qti-btn" onClick={() => fetchQuote(inputVal.trim())} disabled={loading} style={{ flexShrink:0 }}>
              {loading ? "…" : "Search"}
            </button>
          </div>
        )}

        {/* Email alerts (login-gated) */}
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

      {/* ── Quick India popular chips (only in India mode, no quote yet) ── */}
      {marketMode === "india" && !quote?.ticker.includes(".NS") && !quote?.ticker.includes(".BO") && (
        <div style={{ marginBottom:14 }}>
          <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.62rem", color:"var(--text-muted)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8 }}>Popular NSE Stocks</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {["RELIANCE.NS","TCS.NS","INFY.NS","HDFCBANK.NS","ICICIBANK.NS","WIPRO.NS","SBIN.NS","ZOMATO.NS"].map(t => (
              <button key={t} className="qti-btn-ghost"
                style={{ padding:"5px 12px", fontSize:"0.72rem" }}
                onClick={() => { setInputVal(t); fetchQuote(t); }}>
                {t.replace(".NS","")}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{
          background:"var(--red-dim)", border:"1px solid rgba(239,68,68,0.3)",
          borderRadius:"var(--radius-lg)", padding:"14px 18px", marginBottom:14,
          fontFamily:"var(--font-mono)", fontSize:"0.82rem", color:"var(--red-bright)",
        }}>
          ⚠ {error}
          {isIndianStock(inputVal) && (
            <div style={{ marginTop:8, fontSize:"0.73rem", color:"var(--text-muted)", lineHeight:1.7 }}>
              Indian stocks use format: <code style={{ color:"var(--gold)" }}>RELIANCE.NS</code> (NSE) or <code style={{ color:"var(--cyan)" }}>RELIANCE.BO</code> (BSE).
              Try switching to 🇮🇳 India mode and using the search.
            </div>
          )}
          {error.includes("NEXT_PUBLIC") && (
            <div style={{ marginTop:8, fontSize:"0.73rem", color:"var(--text-muted)", lineHeight:1.7 }}>
              Fix: Vercel → Settings → Environment Variables → add <code style={{ color:"var(--gold)" }}>NEXT_PUBLIC_API_URL=https://your-backend.onrender.com</code> → Redeploy.
            </div>
          )}
        </div>
      )}

      {/* ── AdSense top banner ── */}
      <div style={{ marginBottom:14 }}>
        <AdBanner slot="TOP_BANNER_SLOT" format="horizontal" />
      </div>

      {/* ── 3-col layout ── */}
      <div className="main-grid">
        {/* Left ad */}
        <div className="ad-col">
          <AdBanner slot="LEFT_AD_SLOT" style={{ position:"sticky", top:16 }} />
        </div>

        {/* Main */}
        <div>
          {quote ? (
            <>
              {/* Indian market banner */}
              {isIndian && (
                <div style={{
                  background:"rgba(255,153,0,0.08)", border:"1px solid rgba(255,153,0,0.25)",
                  borderRadius:"var(--radius-md)", padding:"8px 14px", marginBottom:12,
                  display:"flex", alignItems:"center", gap:10, flexWrap:"wrap",
                }}>
                  <span style={{ fontSize:"1.1rem" }}>🇮🇳</span>
                  <span style={{ fontFamily:"var(--font-sans)", fontSize:"0.8rem", color:"var(--text-secondary)" }}>
                    <strong style={{ color:"var(--text-primary)" }}>Indian Market</strong> &nbsp;·&nbsp;
                    {quote.market === "IN_NSE" ? "National Stock Exchange (NSE)" : "Bombay Stock Exchange (BSE)"} &nbsp;·&nbsp;
                    Prices in <strong style={{ color:"var(--gold)" }}>₹ INR</strong> &nbsp;·&nbsp;
                    IST timezone
                  </span>
                </div>
              )}

              {/* Metrics row 1 */}
              <div className="metrics-3" style={{ marginBottom:10 }}>
                <MetricCard label="Ticker" value={quote.ticker} />
                <MetricCard label={isIndian ? "Price (₹ INR)" : "Price"}
                  value={isIndian
                    ? `₹${quote.price.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}`
                    : formatPrice(quote.price)}
                  delta={`${Math.abs(quote.change).toFixed(2)}%`}
                  deltaPositive={quote.change >= 0}
                />
                <MetricCard label="Change"
                  value={`${quote.change >= 0 ? "+" : ""}${quote.price ? quote.change.toFixed(2) : "0.00"}%`}
                  delta={quote.prev_close ? `Prev ${isIndian ? `₹${quote.prev_close.toLocaleString("en-IN")}` : formatPrice(quote.prev_close)}` : undefined}
                  deltaPositive={quote.change >= 0}
                />
              </div>

              {/* Metrics row 2 */}
              {(quote.high || quote.low) && (
                <div className="metrics-4" style={{ marginBottom:10 }}>
                  {[
                    { label:"Open",       val:quote.open       ?? 0 },
                    { label:"Day High",   val:quote.high       ?? 0 },
                    { label:"Day Low",    val:quote.low        ?? 0 },
                    { label:"Prev Close", val:quote.prev_close ?? 0 },
                  ].map(({ label, val }) => (
                    <MetricCard key={label} label={label}
                      value={isIndian
                        ? `₹${val.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}`
                        : formatPrice(val)}
                    />
                  ))}
                </div>
              )}

              {/* Signal + exchange label */}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, flexWrap:"wrap" }}>
                <span className={signalClass}>{signalIcon} {quote.signal} SIGNAL</span>
                <span style={{
                  fontFamily:"var(--font-mono)", fontSize:"0.65rem", color:"var(--text-muted)",
                  background:"var(--bg-elevated)", border:"1px solid var(--border)",
                  borderRadius:"20px", padding:"3px 10px",
                }}>
                  {isIndian
                    ? (quote.market === "IN_NSE" ? "🇮🇳 NSE" : "🇮🇳 BSE")
                    : quote.ticker.endsWith(".TO") ? "🇨🇦 TSX" : "🇺🇸 NYSE/NASDAQ"}
                </span>
              </div>

              {/* Tabs */}
              <div className="tab-bar" style={{ marginBottom:14 }}>
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
              {tab === "overview"   && <><PriceChart symbol={ticker} /><Watchlist formatPrice={formatPrice} /><AIChat stockInfo={quote} /></>}
              {tab === "technicals" && <TechnicalIndicators symbol={ticker} />}
              {tab === "news"       && <NewsPanel symbol={ticker} />}
              {tab === "portfolio"  && (user ? <PortfolioTracker formatPrice={formatPrice} defaultTicker={ticker} /> : <AuthGate feature="Portfolio" onLogin={() => setShowAuth(true)} />)}
              {tab === "alerts"     && (user ? <PriceAlerts currentTicker={ticker} currentPrice={quote.price} formatPrice={formatPrice} /> : <AuthGate feature="Price Alerts" onLogin={() => setShowAuth(true)} />)}
              {tab === "peers"      && <SectorPeers symbol={ticker} formatPrice={formatPrice} />}
            </>
          ) : loading ? (
            <div style={{ display:"flex", justifyContent:"center", padding:"60px 0" }}>
              <div className="spinner" style={{ width:28, height:28 }} />
            </div>
          ) : !error ? (
            <div style={{ textAlign:"center", padding:"60px 20px", color:"var(--text-muted)", fontFamily:"var(--font-mono)", fontSize:"0.85rem" }}>
              Enter a ticker symbol above to begin.
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
