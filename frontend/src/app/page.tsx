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

import { api } from "@/lib/api";
interface Quote {
  ticker: string; price: number; change: number; signal: string;
  open?: number; high?: number; low?: number; prev_close?: number;
}

type Tab = "overview" | "technicals" | "news" | "portfolio" | "alerts" | "peers";

const TABS: { id: Tab; label: string }[] = [
  { id:"overview",    label:"📊 Overview"   },
  { id:"technicals",  label:"📐 Technicals" },
  { id:"news",        label:"📰 News"       },
  { id:"portfolio",   label:"💼 Portfolio"  },
  { id:"alerts",      label:"🔔 Alerts"     },
  { id:"peers",       label:"🏢 Peers"      },
];

export default function HomePage() {
  const [ticker, setTicker]       = useState("AAPL");
  const [inputVal, setInputVal]   = useState("AAPL");
  const [quote, setQuote]         = useState<Quote | null>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [currency, setCurrency]   = useState<"USD" | "CAD">("USD");
  const [usdCad, setUsdCad]       = useState(1.35);
  const [tab, setTab]             = useState<Tab>("overview");
  const [email, setEmail]         = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Fetch FX on mount
  useEffect(() => {
    api.fx().then(r => setUsdCad(r.usd_to_cad)).catch(() => {});
  }, []);

  const formatPrice = useCallback((v: number) => {
    if (currency === "CAD") return `C$${(v * usdCad).toLocaleString("en-US", { minimumFractionDigits:2, maximumFractionDigits:2 })}`;
    return `$${v.toLocaleString("en-US", { minimumFractionDigits:2, maximumFractionDigits:2 })}`;
  }, [currency, usdCad]);

  async function fetchQuote(sym: string) {
    setLoading(true); setError("");
    try {
      const q = await api.quote(sym);
      setQuote(q);
      setTicker(sym);
    } catch (e: any) {
      setError(e.message || "Invalid ticker or no data");
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }

  // Load default on mount
  useEffect(() => { fetchQuote("AAPL"); }, []);

  function handleSearch() {
    const sym = inputVal.trim().toUpperCase();
    if (sym) fetchQuote(sym);
  }

  const signalClass = quote?.signal === "BUY"
    ? "signal-buy" : quote?.signal === "SELL"
    ? "signal-sell" : "signal-hold";

  const signalIcon = quote?.signal === "BUY" ? "▲" : quote?.signal === "SELL" ? "▼" : "◆";

  return (
    <div style={{ position:"relative", zIndex:1, maxWidth:1280, margin:"0 auto", padding:"24px 20px" }}>
      <Navbar />
      <HeroBanner />

      {/* Currency + Search row */}
      <div style={{
        display:"flex", alignItems:"center", gap:12, flexWrap:"wrap",
        marginBottom:20,
        background:"var(--bg-surface)", border:"1px solid var(--border)",
        borderRadius:14, padding:"14px 18px",
      }}>
        {/* Currency toggle */}
        <div style={{ display:"flex", gap:4 }}>
          {(["USD","CAD"] as const).map(c => (
            <button
              key={c}
              className={currency === c ? "qti-btn" : "qti-btn-ghost"}
              style={{ padding:"7px 16px", fontSize:"0.78rem" }}
              onClick={() => setCurrency(c)}
            >
              {c === "USD" ? "🇺🇸 USD" : "🇨🇦 CAD"}
            </button>
          ))}
        </div>

        <div style={{ width:1, height:28, background:"var(--border-bright)" }} />

        {/* Ticker search */}
        <div style={{ display:"flex", gap:8, flex:1, minWidth:200 }}>
          <input
            className="qti-input"
            value={inputVal}
            onChange={e => setInputVal(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Ticker symbol e.g. AAPL / BNS.TO"
            style={{ flex:1 }}
          />
          <button className="qti-btn" onClick={handleSearch} disabled={loading} style={{ flexShrink:0 }}>
            {loading ? "..." : "Search"}
          </button>
        </div>

        {/* Email subscription */}
        <div style={{ display:"flex", gap:8, minWidth:260 }}>
          <input
            className="qti-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email for alerts"
            type="email"
            style={{ flex:1 }}
          />
          <button
            className="qti-btn-ghost"
            onClick={() => { if (email) setSubscribed(true); }}
            style={{ flexShrink:0 }}
          >
            {subscribed ? "✓ Subscribed" : "Subscribe"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.35)",
          borderRadius:8, padding:"10px 16px", marginBottom:16,
          fontFamily:"'DM Mono',monospace", fontSize:"0.82rem", color:"#fca5a5",
        }}>
          ⚠ {error}
        </div>
      )}

      {/* 3-column layout */}
      <div style={{ display:"grid", gridTemplateColumns:"180px 1fr 180px", gap:20, alignItems:"start" }}>

        {/* LEFT AD */}
        <div>
          <AdBanner slot="LEFT_AD_SLOT" style={{ position:"sticky", top:20 }} />
        </div>

        {/* MAIN CONTENT */}
        <div>
          {quote && (
            <>
              {/* Overview metrics */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16 }}>
                <MetricCard label="Ticker" value={quote.ticker} />
                <MetricCard
                  label="Price"
                  value={formatPrice(quote.price)}
                  delta={`${Math.abs(quote.change).toFixed(2)}%`}
                  deltaPositive={quote.change >= 0}
                />
                <MetricCard
                  label="Change"
                  value={`${quote.change >= 0 ? "+" : ""}${quote.change.toFixed(2)}%`}
                  delta={quote.prev_close ? `Prev ${formatPrice(quote.prev_close)}` : undefined}
                  deltaPositive={quote.change >= 0}
                />
              </div>

              {quote.high && quote.low && (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:16 }}>
                  <MetricCard label="Open"       value={formatPrice(quote.open ?? 0)} />
                  <MetricCard label="Day High"   value={formatPrice(quote.high)} />
                  <MetricCard label="Day Low"    value={formatPrice(quote.low)} />
                  <MetricCard label="Prev Close" value={formatPrice(quote.prev_close ?? 0)} />
                </div>
              )}

              {/* Signal badge */}
              <div style={{ marginBottom:16 }}>
                <span className={signalClass}>
                  {signalIcon} {quote.signal} SIGNAL
                </span>
              </div>

              {/* Tab navigation */}
              <div className="tab-bar" style={{ marginBottom:20 }}>
                {TABS.map(t => (
                  <button
                    key={t.id}
                    className={`tab-btn${tab === t.id ? " active" : ""}`}
                    onClick={() => setTab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {tab === "overview" && (
                <>
                  <PriceChart symbol={ticker} />
                  <Watchlist formatPrice={formatPrice} />
                  <AIChat stockInfo={quote} />
                </>
              )}
              {tab === "technicals" && <TechnicalIndicators symbol={ticker} />}
              {tab === "news"       && <NewsPanel symbol={ticker} />}
              {tab === "portfolio"  && <PortfolioTracker formatPrice={formatPrice} defaultTicker={ticker} />}
              {tab === "alerts"     && <PriceAlerts currentTicker={ticker} currentPrice={quote.price} formatPrice={formatPrice} />}
              {tab === "peers"      && <SectorPeers symbol={ticker} formatPrice={formatPrice} />}
            </>
          )}

          {!quote && !loading && !error && (
            <div style={{ textAlign:"center", padding:"80px 0", color:"var(--text-muted)", fontFamily:"'DM Mono',monospace" }}>
              Enter a ticker symbol above to begin.
            </div>
          )}
        </div>

        {/* RIGHT AD */}
        <div>
          <AdBanner slot="RIGHT_AD_SLOT" style={{ position:"sticky", top:20 }} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
