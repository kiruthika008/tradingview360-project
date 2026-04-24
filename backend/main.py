"""
Quantum Trade Intelligence — FastAPI Backend v3.0
Supports: US (NYSE/NASDAQ), Canada (TSX), India (NSE/BSE)
Deploy on Render.com
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
import time
import re
from datetime import datetime, timezone
import pytz
from anthropic import Anthropic

# ── CONFIG ────────────────────────────────────────────────────────────
FINNHUB_KEY = os.environ.get("FINNHUB_KEY", "d7ht4s9r01qu8vfmhv1gd7ht4s9r01qu8vfmhv20")
CLAUDE_KEY  = os.environ.get("ANTHROPIC_API_KEY", "")

app = FastAPI(title="QTI API", version="2.0")

# Allow Vercel frontend + localhost dev
ALLOWED_ORIGINS = os.environ.get(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,https://tradingview360-project-kiruthika008s-projects.vercel.app"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

claude_client = Anthropic(api_key=CLAUDE_KEY) if CLAUDE_KEY else None

# ── MARKET DETECTION ──────────────────────────────────────────────────
def detect_market(symbol: str) -> str:
    """Return 'IN_NSE', 'IN_BSE', 'CA', or 'US' based on symbol format."""
    s = symbol.upper().strip()
    if s.endswith(".NS"):   return "IN_NSE"
    if s.endswith(".BO"):   return "IN_BSE"
    if s.endswith(".TO") or s.endswith(".V") or s.endswith(".TSX"): return "CA"
    return "US"

def normalize_indian_symbol(symbol: str) -> str:
    """
    Accept flexible Indian inputs and normalize to Finnhub format:
      RELIANCE  → RELIANCE.NS  (assume NSE by default)
      RELIANCE.NS → RELIANCE.NS
      RELIANCE.BSE → RELIANCE.BO
      RELIANCE.BO  → RELIANCE.BO
    """
    s = symbol.upper().strip()
    if s.endswith(".NS") or s.endswith(".BO"):
        return s
    if s.endswith(".BSE"):
        return s[:-4] + ".BO"
    if s.endswith(".NSE"):
        return s[:-4] + ".NS"
    # Pure Indian ticker with no suffix → default to NSE
    # Heuristic: no dots, no typical US/CA suffixes, short name → likely Indian
    return s  # caller decides; symbol search will clarify

# ── POPULAR INDIAN STOCKS reference table ────────────────────────────
INDIAN_POPULAR = [
    {"ticker": "RELIANCE.NS",  "name": "Reliance Industries",       "exchange": "NSE"},
    {"ticker": "TCS.NS",       "name": "Tata Consultancy Services", "exchange": "NSE"},
    {"ticker": "INFY.NS",      "name": "Infosys",                   "exchange": "NSE"},
    {"ticker": "HDFCBANK.NS",  "name": "HDFC Bank",                 "exchange": "NSE"},
    {"ticker": "ICICIBANK.NS", "name": "ICICI Bank",                "exchange": "NSE"},
    {"ticker": "HINDUNILVR.NS","name": "Hindustan Unilever",        "exchange": "NSE"},
    {"ticker": "SBIN.NS",      "name": "State Bank of India",       "exchange": "NSE"},
    {"ticker": "BHARTIARTL.NS","name": "Bharti Airtel",             "exchange": "NSE"},
    {"ticker": "KOTAKBANK.NS", "name": "Kotak Mahindra Bank",       "exchange": "NSE"},
    {"ticker": "LT.NS",        "name": "Larsen & Toubro",           "exchange": "NSE"},
    {"ticker": "WIPRO.NS",     "name": "Wipro",                     "exchange": "NSE"},
    {"ticker": "ONGC.NS",      "name": "Oil and Natural Gas Corp",  "exchange": "NSE"},
    {"ticker": "AXISBANK.NS",  "name": "Axis Bank",                 "exchange": "NSE"},
    {"ticker": "MARUTI.NS",    "name": "Maruti Suzuki",             "exchange": "NSE"},
    {"ticker": "SUNPHARMA.NS", "name": "Sun Pharmaceutical",        "exchange": "NSE"},
    {"ticker": "TITAN.NS",     "name": "Titan Company",             "exchange": "NSE"},
    {"ticker": "BAJFINANCE.NS","name": "Bajaj Finance",             "exchange": "NSE"},
    {"ticker": "ADANIENT.NS",  "name": "Adani Enterprises",         "exchange": "NSE"},
    {"ticker": "ULTRACEMCO.NS","name": "UltraTech Cement",          "exchange": "NSE"},
    {"ticker": "NESTLEIND.NS", "name": "Nestle India",              "exchange": "NSE"},
    {"ticker": "HCLTECH.NS",   "name": "HCL Technologies",          "exchange": "NSE"},
    {"ticker": "ITC.NS",       "name": "ITC Limited",               "exchange": "NSE"},
    {"ticker": "POWERGRID.NS", "name": "Power Grid Corporation",    "exchange": "NSE"},
    {"ticker": "NTPC.NS",      "name": "NTPC Limited",              "exchange": "NSE"},
    {"ticker": "DRREDDY.NS",   "name": "Dr. Reddy's Laboratories",  "exchange": "NSE"},
    {"ticker": "ZOMATO.NS",    "name": "Zomato",                    "exchange": "NSE"},
    {"ticker": "BAJAJFINSV.NS","name": "Bajaj Finserv",             "exchange": "NSE"},
    {"ticker": "TECHM.NS",     "name": "Tech Mahindra",             "exchange": "NSE"},
    {"ticker": "ASIANPAINT.NS","name": "Asian Paints",              "exchange": "NSE"},
    {"ticker": "M&M.NS",       "name": "Mahindra & Mahindra",       "exchange": "NSE"},
]

# ── HELPERS ───────────────────────────────────────────────────────────
def to_ist(unix_ts):
    """Convert Unix timestamp to IST string."""
    if not unix_ts:
        return "N/A"
    if unix_ts > 10**12:
        unix_ts = unix_ts / 1000
    utc_time = datetime.fromtimestamp(unix_ts, tz=timezone.utc)
    ist = pytz.timezone("Asia/Kolkata")
    return utc_time.astimezone(ist).strftime("%Y-%m-%d %I:%M %p IST")

def to_est(unix_ts):
    if not unix_ts:
        return "N/A"
    if unix_ts > 10**12:
        unix_ts = unix_ts / 1000
    utc_time = datetime.fromtimestamp(unix_ts, tz=timezone.utc)
    est = pytz.timezone("America/New_York")
    return utc_time.astimezone(est).strftime("%Y-%m-%d %I:%M %p EST")

def format_ts(unix_ts: int, market: str) -> str:
    return to_ist(unix_ts) if market.startswith("IN") else to_est(unix_ts)

def simple_sentiment(text: str) -> str:
    t = text.lower()
    if any(w in t for w in ["rise","profit","gain","up","strong","surge","rally","growth"]):
        return "positive"
    if any(w in t for w in ["fall","loss","drop","down","crash","decline","slip","weak"]):
        return "negative"
    return "neutral"

# ── ROUTES ────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "time": datetime.utcnow().isoformat(), "version": "3.0"}

# ── Indian stock search / autocomplete ──────────────────────────────
@app.get("/api/india/search")
async def india_search(q: str = Query(..., min_length=1)):
    """Search Indian stocks by name or ticker. Returns matching NSE/BSE stocks."""
    q_upper = q.upper()
    q_lower = q.lower()
    matches = [
        s for s in INDIAN_POPULAR
        if q_upper in s["ticker"] or q_lower in s["name"].lower()
    ]
    # Also try Finnhub symbol search for broader results
    try:
        async with httpx.AsyncClient(timeout=6) as client:
            r = await client.get(
                "https://finnhub.io/api/v1/search",
                params={"q": q, "token": FINNHUB_KEY}
            )
        data = r.json()
        if isinstance(data, dict) and data.get("result"):
            for item in data["result"][:8]:
                sym = item.get("symbol","")
                if sym.endswith(".NS") or sym.endswith(".BO"):
                    # avoid duplicates
                    if not any(m["ticker"] == sym for m in matches):
                        matches.append({
                            "ticker": sym,
                            "name": item.get("description", sym),
                            "exchange": "NSE" if sym.endswith(".NS") else "BSE",
                        })
    except Exception:
        pass
    return matches[:12]

# ── Popular Indian stocks list ───────────────────────────────────────
@app.get("/api/india/popular")
async def india_popular():
    return INDIAN_POPULAR[:20]

# ── Quote (unified — US/CA/IN) ───────────────────────────────────────
@app.get("/api/quote/{symbol}")
async def get_quote(symbol: str):
    symbol = symbol.upper().strip()
    market = detect_market(symbol)

    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(
            "https://finnhub.io/api/v1/quote",
            params={"symbol": symbol, "token": FINNHUB_KEY}
        )
    data = r.json()
    if not data or "c" not in data or data["c"] == 0:
        raise HTTPException(404, f"Symbol '{symbol}' not found. "
            "For Indian stocks use format: RELIANCE.NS (NSE) or RELIANCE.BO (BSE)")

    price  = data["c"]
    prev   = data["pc"] or price
    change = ((price - prev) / prev * 100) if prev else 0
    signal = "BUY" if change > 2 else ("SELL" if change < -2 else "HOLD")

    return {
        "ticker":     symbol,
        "price":      price,
        "open":       data.get("o"),
        "high":       data.get("h"),
        "low":        data.get("l"),
        "prev_close": prev,
        "change":     round(change, 4),
        "signal":     signal,
        "market":     market,
        "currency":   "INR" if market.startswith("IN") else ("CAD" if market == "CA" else "USD"),
    }

# ── Batch quotes ─────────────────────────────────────────────────────
@app.get("/api/quotes")
async def get_quotes(symbols: str = Query(...)):
    tickers = [s.strip().upper() for s in symbols.split(",")][:10]
    results = []
    async with httpx.AsyncClient(timeout=12) as client:
        for sym in tickers:
            try:
                r = await client.get(
                    "https://finnhub.io/api/v1/quote",
                    params={"symbol": sym, "token": FINNHUB_KEY}
                )
                d = r.json()
                if d and d.get("c"):
                    price  = d["c"]
                    prev   = d["pc"] or 1
                    change = (price - prev) / prev * 100
                    mkt    = detect_market(sym)
                    results.append({
                        "ticker":   sym,
                        "price":    round(price, 2),
                        "change":   round(change, 2),
                        "signal":   "BUY" if change > 2 else ("SELL" if change < -2 else "HOLD"),
                        "market":   mkt,
                        "currency": "INR" if mkt.startswith("IN") else ("CAD" if mkt=="CA" else "USD"),
                    })
            except Exception:
                pass
    return results

# ── News ──────────────────────────────────────────────────────────────
@app.get("/api/news/{symbol}")
async def get_news(symbol: str):
    symbol = symbol.upper().strip()
    market = detect_market(symbol)
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(
            "https://finnhub.io/api/v1/company-news",
            params={"symbol": symbol, "from": "2025-01-01", "to": "2026-12-31", "token": FINNHUB_KEY}
        )
    items = r.json()
    if not isinstance(items, list):
        return []
    return [
        {
            "headline":  n.get("headline",""),
            "url":       n.get("url","#"),
            "source":    n.get("source",""),
            "datetime":  format_ts(n.get("datetime"), market),
            "sentiment": simple_sentiment(n.get("headline","")),
        }
        for n in items[:6]
    ]

# ── Candles ───────────────────────────────────────────────────────────
@app.get("/api/candles/{symbol}")
async def get_candles(symbol: str, resolution: str = "60", bars: int = 120):
    symbol = symbol.upper().strip()
    try:
        interval_secs = int(resolution) * 60 if resolution != "D" else 86400
    except Exception:
        interval_secs = 3600
    now   = int(time.time())
    start = now - bars * interval_secs

    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(
            "https://finnhub.io/api/v1/stock/candle",
            params={"symbol": symbol, "resolution": resolution, "from": start, "to": now, "token": FINNHUB_KEY}
        )
    d = r.json()
    if not isinstance(d, dict) or d.get("s") != "ok" or not d.get("t"):
        raise HTTPException(404, "No candle data — try Daily resolution or verify symbol")

    return [
        {"time": t, "open": o, "high": h, "low": l, "close": c, "volume": v}
        for t, o, h, l, c, v in zip(d["t"], d["o"], d["h"], d["l"], d["c"], d["v"])
    ]

# ── Company profile ───────────────────────────────────────────────────
@app.get("/api/profile/{symbol}")
async def get_profile(symbol: str):
    symbol = symbol.upper().strip()
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(
            "https://finnhub.io/api/v1/stock/profile2",
            params={"symbol": symbol, "token": FINNHUB_KEY}
        )
    return r.json()

# ── Peers ─────────────────────────────────────────────────────────────
@app.get("/api/peers/{symbol}")
async def get_peers(symbol: str):
    symbol = symbol.upper().strip()
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(
            "https://finnhub.io/api/v1/stock/peers",
            params={"symbol": symbol, "token": FINNHUB_KEY}
        )
    peers = r.json()
    return peers[:6] if isinstance(peers, list) else []

# ── FX rates (USD → CAD + INR) ────────────────────────────────────────
@app.get("/api/fx/rates")
async def get_fx_rates():
    """Return USD → CAD and USD → INR rates."""
    defaults = {"usd_to_cad": 1.35, "usd_to_inr": 83.5}
    try:
        async with httpx.AsyncClient(timeout=6) as client:
            r = await client.get(
                "https://api.exchangerate.host/latest",
                params={"base": "USD", "symbols": "CAD,INR"}
            )
        data = r.json()
        rates = data.get("rates", {})
        return {
            "usd_to_cad": rates.get("CAD", 1.35),
            "usd_to_inr": rates.get("INR", 83.5),
        }
    except Exception:
        return defaults

# Keep old endpoint for backwards compatibility
@app.get("/api/fx/usd-cad")
async def get_fx_legacy():
    r = await get_fx_rates()
    return {"usd_to_cad": r["usd_to_cad"]}

# ── AI Chat ───────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    question: str
    stock_info: dict

@app.post("/api/chat")
async def chat(req: ChatRequest):
    if not claude_client:
        raise HTTPException(503, "AI assistant not configured — set ANTHROPIC_API_KEY")

    market   = req.stock_info.get("market", "US")
    currency = req.stock_info.get("currency", "USD")
    exchange = "NSE/BSE (India)" if market.startswith("IN") else ("TSX (Canada)" if market=="CA" else "NYSE/NASDAQ (US)")

    prompt = f"""You are a professional stock trading assistant specializing in {exchange} markets.

Stock Data:
{req.stock_info}

Exchange: {exchange}
Currency: {currency}

User Question:
{req.question}

Provide:
1. BUY / SELL / HOLD recommendation with confidence level
2. Short reasoning (2-3 sentences) relevant to {exchange}
3. Key risk factor specific to this market
4. Any market-specific context (e.g. SEBI regulations for India, RBI rates, FII flows for Indian stocks)
"""
    response = claude_client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=600,
        messages=[{"role": "user", "content": prompt}]
    )
    return {"answer": response.content[0].text}
