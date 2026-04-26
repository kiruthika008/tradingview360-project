"""
Quantum Trade Intelligence — FastAPI Backend v3.1
Supports: US (NYSE/NASDAQ), Canada (TSX), India (NSE/BSE)
Providers: Finnhub (quotes/candles/news) | Twelve Data (indicators) | FMP (fundamentals/earnings)
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
CLAUDE_KEY     = os.environ.get("ANTHROPIC_API_KEY", "")
TWELVEDATA_KEY = os.environ.get("TWELVEDATA_KEY", "")
FMP_KEY        = os.environ.get("FMP_KEY", "")

BASE_FMP    = "https://financialmodelingprep.com/api/v3"
BASE_TD     = "https://api.twelvedata.com"
BASE_FH     = "https://finnhub.io/api/v1"

app = FastAPI(title="QTI API", version="3.1")

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
    s = symbol.upper().strip()
    if s.endswith(".NS"):                              
        return "IN_NSE"
    if s.endswith(".BO"):                              
        return "IN_BSE"
    if s.endswith(".TO") or s.endswith(".V") or s.endswith(".TSX"): 
        return "CA"
    return "US"

def get_currency(market: str) -> str:
    if market.startswith("IN"): 
        return "INR"
    if market == "CA":          
        return "CAD"
    return "USD"

def get_exchange_label(market: str) -> str:
    if market.startswith("IN"): 
        return "NSE/BSE (India)"
    if market == "CA":          
        return "TSX (Canada)"
    return "NYSE/NASDAQ (US)"

# ── TIMESTAMP HELPERS ─────────────────────────────────────────────────
def to_ist(unix_ts):
    if not unix_ts: 
        return "N/A"
    if unix_ts > 10**12: 
        unix_ts /= 1000
    utc = datetime.fromtimestamp(unix_ts, tz=timezone.utc)
    return utc.astimezone(pytz.timezone("Asia/Kolkata")).strftime("%Y-%m-%d %I:%M %p IST")

def to_est(unix_ts):
    if not unix_ts: 
        return "N/A"
    if unix_ts > 10**12: 
        unix_ts /= 1000
    utc = datetime.fromtimestamp(unix_ts, tz=timezone.utc)
    return utc.astimezone(pytz.timezone("America/New_York")).strftime("%Y-%m-%d %I:%M %p EST")

def format_ts(unix_ts: int, market: str) -> str:
    return to_ist(unix_ts) if market.startswith("IN") else to_est(unix_ts)

def simple_sentiment(text: str) -> str:
    t = text.lower()
    if any(w in t for w in ["rise","profit","gain","up","strong","surge","rally","growth"]): 
        return "positive"
    if any(w in t for w in ["fall","loss","drop","down","crash","decline","slip","weak"]):  
        return "negative"
    return "neutral"

# ── POPULAR INDIAN STOCKS ─────────────────────────────────────────────
INDIAN_POPULAR = [
    {"ticker": "RELIANCE.NS",   "name": "Reliance Industries",        "exchange": "NSE"},
    {"ticker": "TCS.NS",        "name": "Tata Consultancy Services",  "exchange": "NSE"},
    {"ticker": "INFY.NS",       "name": "Infosys",                    "exchange": "NSE"},
    {"ticker": "HDFCBANK.NS",   "name": "HDFC Bank",                  "exchange": "NSE"},
    {"ticker": "ICICIBANK.NS",  "name": "ICICI Bank",                 "exchange": "NSE"},
    {"ticker": "HINDUNILVR.NS", "name": "Hindustan Unilever",         "exchange": "NSE"},
    {"ticker": "SBIN.NS",       "name": "State Bank of India",        "exchange": "NSE"},
    {"ticker": "BHARTIARTL.NS", "name": "Bharti Airtel",              "exchange": "NSE"},
    {"ticker": "KOTAKBANK.NS",  "name": "Kotak Mahindra Bank",        "exchange": "NSE"},
    {"ticker": "LT.NS",         "name": "Larsen & Toubro",            "exchange": "NSE"},
    {"ticker": "WIPRO.NS",      "name": "Wipro",                      "exchange": "NSE"},
    {"ticker": "ONGC.NS",       "name": "Oil and Natural Gas Corp",   "exchange": "NSE"},
    {"ticker": "AXISBANK.NS",   "name": "Axis Bank",                  "exchange": "NSE"},
    {"ticker": "MARUTI.NS",     "name": "Maruti Suzuki",              "exchange": "NSE"},
    {"ticker": "SUNPHARMA.NS",  "name": "Sun Pharmaceutical",         "exchange": "NSE"},
    {"ticker": "TITAN.NS",      "name": "Titan Company",              "exchange": "NSE"},
    {"ticker": "BAJFINANCE.NS", "name": "Bajaj Finance",              "exchange": "NSE"},
    {"ticker": "ADANIENT.NS",   "name": "Adani Enterprises",          "exchange": "NSE"},
    {"ticker": "ULTRACEMCO.NS", "name": "UltraTech Cement",           "exchange": "NSE"},
    {"ticker": "NESTLEIND.NS",  "name": "Nestle India",               "exchange": "NSE"},
    {"ticker": "HCLTECH.NS",    "name": "HCL Technologies",           "exchange": "NSE"},
    {"ticker": "ITC.NS",        "name": "ITC Limited",                "exchange": "NSE"},
    {"ticker": "POWERGRID.NS",  "name": "Power Grid Corporation",     "exchange": "NSE"},
    {"ticker": "NTPC.NS",       "name": "NTPC Limited",               "exchange": "NSE"},
    {"ticker": "DRREDDY.NS",    "name": "Dr. Reddy's Laboratories",   "exchange": "NSE"},
    {"ticker": "ZOMATO.NS",     "name": "Zomato",                     "exchange": "NSE"},
    {"ticker": "BAJAJFINSV.NS", "name": "Bajaj Finserv",              "exchange": "NSE"},
    {"ticker": "TECHM.NS",      "name": "Tech Mahindra",              "exchange": "NSE"},
    {"ticker": "ASIANPAINT.NS", "name": "Asian Paints",               "exchange": "NSE"},
    {"ticker": "M&M.NS",        "name": "Mahindra & Mahindra",        "exchange": "NSE"},
]

# ─────────────────────────────────────────────────────────────────────
#  HEALTH
# ─────────────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "time": datetime.utcnow().isoformat(),
        "version": "3.1",
        "providers": {
            "finnhub":    bool(FINNHUB_KEY),
            "twelvedata": bool(TWELVEDATA_KEY),
            "fmp":        bool(FMP_KEY),
            "ai":         bool(CLAUDE_KEY),
        },
    }

# ─────────────────────────────────────────────────────────────────────
#  INDIAN STOCK SEARCH / POPULAR
# ─────────────────────────────────────────────────────────────────────
@app.get("/api/india/search")
async def india_search(q: str = Query(..., min_length=1)):
    q_upper, q_lower = q.upper(), q.lower()
    matches = [
        s for s in INDIAN_POPULAR
        if q_upper in s["ticker"] or q_lower in s["name"].lower()
    ]
    try:
        async with httpx.AsyncClient(timeout=6) as client:
            r = await client.get(f"{BASE_FH}/search", params={"q": q, "token": FINNHUB_KEY})
        for item in (r.json().get("result") or [])[:8]:
            sym = item.get("symbol", "")
            if (sym.endswith(".NS") or sym.endswith(".BO")) and not any(m["ticker"] == sym for m in matches):
                matches.append({
                    "ticker":   sym,
                    "name":     item.get("description", sym),
                    "exchange": "NSE" if sym.endswith(".NS") else "BSE",
                })
    except Exception:
        pass
    return matches[:12]

@app.get("/api/india/popular")
async def india_popular():
    return INDIAN_POPULAR[:20]

# ─────────────────────────────────────────────────────────────────────
#  FINNHUB — Quotes · Candles · News · Profile · Peers
# ─────────────────────────────────────────────────────────────────────
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
    return {
        "ticker":     symbol,
        "price":      price,
        "open":       data.get("o"),
        "high":       data.get("h"),
        "low":        data.get("l"),
        "prev_close": prev,
        "change":     round(change, 4),
        "signal":     "BUY" if change > 2 else ("SELL" if change < -2 else "HOLD"),
        "market":     market,
        "currency":   get_currency(market),
    }

# ── Batch quotes ─────────────────────────────────────────────────────
@app.get("/api/quotes")
async def get_quotes(symbols: str = Query(...)):
    tickers = [s.strip().upper() for s in symbols.split(",")][:10]
    results = []
    async with httpx.AsyncClient(timeout=12) as client:
        for sym in tickers:
            try:
                r = await client.get(f"{BASE_FH}/quote", params={"symbol": sym, "token": FINNHUB_KEY})
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
                        "currency": get_currency(mkt),
                    })
            except Exception:
                pass
    return results

@app.get("/api/news/{symbol}")
async def get_news(symbol: str):
    symbol = symbol.upper().strip()
    market = detect_market(symbol)
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(
            f"{BASE_FH}/company-news",
            params={"symbol": symbol, "from": "2025-01-01", "to": "2026-12-31", "token": FINNHUB_KEY}
        )
    items = r.json()
    if not isinstance(items, list): return []
    return [
        {
            "headline":  n.get("headline", ""),
            "url":       n.get("url", "#"),
            "source":    n.get("source", ""),
            "datetime":  format_ts(n.get("datetime"), market),
            "sentiment": simple_sentiment(n.get("headline", "")),
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
            f"{BASE_FH}/stock/candle",
            params={"symbol": symbol, "resolution": resolution, "from": start, "to": now, "token": FINNHUB_KEY}
        )
    d = r.json()
    if not isinstance(d, dict) or d.get("s") != "ok" or not d.get("t"):
        raise HTTPException(404, "No candle data — try Daily resolution or verify symbol")
    return [
        {"time": t, "open": o, "high": h, "low": l, "close": c, "volume": v}
        for t, o, h, l, c, v in zip(d["t"], d["o"], d["h"], d["l"], d["c"], d["v"])
    ]

@app.get("/api/profile/{symbol}")
async def get_profile(symbol: str):
    symbol = symbol.upper().strip()
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(f"{BASE_FH}/stock/profile2", params={"symbol": symbol, "token": FINNHUB_KEY})
    return r.json()

@app.get("/api/peers/{symbol}")
async def get_peers(symbol: str):
    symbol = symbol.upper().strip()
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(f"{BASE_FH}/stock/peers", params={"symbol": symbol, "token": FINNHUB_KEY})
    peers = r.json()
    return peers[:6] if isinstance(peers, list) else []

# ─────────────────────────────────────────────────────────────────────
#  TWELVE DATA — Technical Indicators
# ─────────────────────────────────────────────────────────────────────
SUPPORTED_INDICATORS = {
    "rsi", "macd", "ema", "sma", "bbands",
    "stoch", "adx", "cci", "atr", "willr",
}

@app.get("/api/indicators/{symbol}")
async def get_indicator(
    symbol:     str,
    indicator:  str = Query("rsi", description="rsi | macd | ema | sma | bbands | stoch | adx | cci | atr | willr"),
    interval:   str = Query("1day", description="1min | 5min | 15min | 1h | 4h | 1day | 1week"),
    outputsize: int = Query(60, ge=1, le=500),
):
    """
    Fetch a single technical indicator from Twelve Data.
    Returns the most recent `outputsize` values.
    """
    if not TWELVEDATA_KEY:
        raise HTTPException(503, "TWELVEDATA_KEY not configured")

    indicator = indicator.lower()
    if indicator not in SUPPORTED_INDICATORS:
        raise HTTPException(400, f"Unsupported indicator '{indicator}'. Choose from: {', '.join(sorted(SUPPORTED_INDICATORS))}")

    symbol = symbol.upper().strip()
    params = {
        "symbol":     symbol,
        "interval":   interval,
        "outputsize": outputsize,
        "apikey":     TWELVEDATA_KEY,
    }

    async with httpx.AsyncClient(timeout=12) as client:
        r = await client.get(f"{BASE_TD}/{indicator}", params=params)

    data = r.json()

    if data.get("status") == "error":
        raise HTTPException(404, data.get("message", f"No data for {symbol}/{indicator}"))
    if "values" not in data:
        raise HTTPException(404, f"No indicator data returned for {symbol}")

    return {
        "symbol":    symbol,
        "indicator": indicator,
        "interval":  interval,
        "meta":      data.get("meta", {}),
        "values":    data["values"],
    }

@app.get("/api/indicators/{symbol}/snapshot")
async def get_indicator_snapshot(
    symbol:   str,
    interval: str = Query("1day"),
):
    """
    Fetch RSI, MACD, EMA(20), SMA(50) and BB in one call (parallel).
    Returns a compact snapshot useful for AI context.
    """
    if not TWELVEDATA_KEY:
        raise HTTPException(503, "TWELVEDATA_KEY not configured")

    symbol = symbol.upper().strip()
    wanted = ["rsi", "macd", "ema", "sma", "bbands"]

    async def fetch(ind: str, extra: dict = {}):
        params = {
            "symbol":     symbol,
            "interval":   interval,
            "outputsize": 1,
            "apikey":     TWELVEDATA_KEY,
            **extra,
        }
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(f"{BASE_TD}/{ind}", params=params)
        d = r.json()
        if d.get("status") == "error" or "values" not in d:
            return None
        return d["values"][0] if d["values"] else None

    import asyncio
    results = await asyncio.gather(
        fetch("rsi"),
        fetch("macd"),
        fetch("ema", {"time_period": 20}),
        fetch("sma", {"time_period": 50}),
        fetch("bbands"),
        return_exceptions=True,
    )

    keys = ["rsi", "macd", "ema_20", "sma_50", "bbands"]
    snapshot = {}
    for k, v in zip(keys, results):
        snapshot[k] = v if not isinstance(v, Exception) else None

    return {"symbol": symbol, "interval": interval, "snapshot": snapshot}


# ─────────────────────────────────────────────────────────────────────
#  FMP — Fundamentals · Earnings · Financials · Ratios
# ─────────────────────────────────────────────────────────────────────
def _fmp_params(extra: dict = {}) -> dict:
    return {"apikey": FMP_KEY, **extra}

def _require_fmp():
    if not FMP_KEY:
        raise HTTPException(503, "FMP_KEY not configured")

@app.get("/api/fmp/profile/{symbol}")
async def fmp_profile(symbol: str):
    """
    Rich company profile: market cap, sector, industry, beta, description,
    CEO, employees, IPO date, dividend yield.
    """
    _require_fmp()
    symbol = symbol.upper().strip()
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(f"{BASE_FMP}/profile/{symbol}", params=_fmp_params())
    data = r.json()
    if not isinstance(data, list) or not data:
        raise HTTPException(404, f"No FMP profile for '{symbol}'")
    return data[0]

@app.get("/api/fmp/earnings/{symbol}")
async def fmp_earnings(symbol: str, limit: int = Query(8, ge=1, le=20)):
    """
    Historical earnings: EPS actual vs estimate, revenue actual vs estimate,
    surprise %, date. Most recent first.
    """
    _require_fmp()
    symbol = symbol.upper().strip()
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(
            f"{BASE_FMP}/historical/earning_calendar/{symbol}",
            params=_fmp_params({"limit": limit}),
        )
    data = r.json()
    if not isinstance(data, list) or not data:
        raise HTTPException(404, f"No earnings data for '{symbol}'")
    return data[:limit]

@app.get("/api/fmp/earnings/upcoming")
async def fmp_earnings_upcoming(from_date: str = "", to_date: str = ""):
    """
    Upcoming earnings calendar (all stocks).
    Defaults to the next 7 days if no dates supplied.
    """
    _require_fmp()
    from datetime import timedelta
    today = datetime.utcnow().date()
    f = from_date or str(today)
    t = to_date   or str(today + timedelta(days=7))
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(
            f"{BASE_FMP}/earning_calendar",
            params=_fmp_params({"from": f, "to": t}),
        )
    data = r.json()
    return data if isinstance(data, list) else []

@app.get("/api/fmp/income/{symbol}")
async def fmp_income(symbol: str, period: str = Query("annual", description="annual | quarter"), limit: int = 4):
    """
    Income statement: revenue, gross profit, EBITDA, net income, EPS.
    """
    _require_fmp()
    symbol = symbol.upper().strip()
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(
            f"{BASE_FMP}/income-statement/{symbol}",
            params=_fmp_params({"period": period, "limit": limit}),
        )
    data = r.json()
    if not isinstance(data, list) or not data:
        raise HTTPException(404, f"No income statement for '{symbol}'")
    return data

@app.get("/api/fmp/balance/{symbol}")
async def fmp_balance(symbol: str, period: str = Query("annual"), limit: int = 4):
    """Balance sheet: assets, liabilities, equity, cash, debt."""
    _require_fmp()
    symbol = symbol.upper().strip()
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(
            f"{BASE_FMP}/balance-sheet-statement/{symbol}",
            params=_fmp_params({"period": period, "limit": limit}),
        )
    data = r.json()
    if not isinstance(data, list) or not data:
        raise HTTPException(404, f"No balance sheet for '{symbol}'")
    return data

@app.get("/api/fmp/cashflow/{symbol}")
async def fmp_cashflow(symbol: str, period: str = Query("annual"), limit: int = 4):
    """Cash flow statement: operating, investing, financing, free cash flow."""
    _require_fmp()
    symbol = symbol.upper().strip()
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(
            f"{BASE_FMP}/cash-flow-statement/{symbol}",
            params=_fmp_params({"period": period, "limit": limit}),
        )
    data = r.json()
    if not isinstance(data, list) or not data:
        raise HTTPException(404, f"No cash flow data for '{symbol}'")
    return data

@app.get("/api/fmp/ratios/{symbol}")
async def fmp_ratios(symbol: str, period: str = Query("annual"), limit: int = 4):
    """
    Key ratios: P/E, P/B, P/S, ROE, ROA, debt-to-equity, current ratio,
    dividend yield, profit margin.
    """
    _require_fmp()
    symbol = symbol.upper().strip()
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(
            f"{BASE_FMP}/ratios/{symbol}",
            params=_fmp_params({"period": period, "limit": limit}),
        )
    data = r.json()
    if not isinstance(data, list) or not data:
        raise HTTPException(404, f"No ratios for '{symbol}'")
    return data

@app.get("/api/fmp/dcf/{symbol}")
async def fmp_dcf(symbol: str):
    """Discounted Cash Flow (DCF) valuation vs current price."""
    _require_fmp()
    symbol = symbol.upper().strip()
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(f"{BASE_FMP}/discounted-cash-flow/{symbol}", params=_fmp_params())
    data = r.json()
    # FMP returns a dict here, not a list
    if not data or (isinstance(data, dict) and not data.get("dcf")):
        raise HTTPException(404, f"No DCF data for '{symbol}'")
    return data

# ─────────────────────────────────────────────────────────────────────
#  FX RATES
# ─────────────────────────────────────────────────────────────────────
@app.get("/api/fx/rates")
async def get_fx_rates():
    """Return USD → CAD and USD → INR rates."""
    defaults = {"usd_to_cad": 1.35, "usd_to_inr": 83.5}
    try:
        async with httpx.AsyncClient(timeout=6) as client:
            r = await client.get(
                "https://api.exchangerate.host/latest",
                params={"base": "USD", "symbols": "CAD,INR"},
            )
        rates = r.json().get("rates", {})
        return {"usd_to_cad": rates.get("CAD", 1.35), "usd_to_inr": rates.get("INR", 83.5)}
    except Exception:
        return defaults

@app.get("/api/fx/usd-cad")
async def get_fx_legacy():
    r = await get_fx_rates()
    return {"usd_to_cad": r["usd_to_cad"]}

# ─────────────────────────────────────────────────────────────────────
#  AI CHAT — Enriched with indicators + fundamentals context
# ─────────────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    question:   str
    stock_info: dict

@app.post("/api/chat")
async def chat(req: ChatRequest):
    if not claude_client:
        raise HTTPException(503, "AI assistant not configured — set ANTHROPIC_API_KEY")

    symbol   = req.stock_info.get("ticker", "")
    market   = req.stock_info.get("market", "US")
    currency = req.stock_info.get("currency", "USD")
    exchange = get_exchange_label(market)

    # ── Silently fetch enrichment data in parallel ────────────────────
    import asyncio

    async def safe(coro):
        try:    return await coro
        except: return None

    indicator_task = safe(
        get_indicator_snapshot(symbol, interval="1day")
    ) if symbol and TWELVEDATA_KEY else asyncio.sleep(0, result=None)

    fmp_ratios_task = safe(
        fmp_ratios(symbol, period="annual", limit=1)
    ) if symbol and FMP_KEY else asyncio.sleep(0, result=None)

    fmp_earnings_task = safe(
        fmp_earnings(symbol, limit=2)
    ) if symbol and FMP_KEY else asyncio.sleep(0, result=None)

    indicators, ratios, earnings = await asyncio.gather(
        indicator_task, fmp_ratios_task, fmp_earnings_task
    )

    # ── Build enrichment context block ───────────────────────────────
    enrichment = ""

    if indicators and indicators.get("snapshot"):
        snap = indicators["snapshot"]
        rsi_val  = (snap.get("rsi") or {}).get("rsi", "N/A")
        macd_val = (snap.get("macd") or {}).get("macd", "N/A")
        sig_val  = (snap.get("macd") or {}).get("macd_signal", "N/A")
        ema_val  = (snap.get("ema_20") or {}).get("ema", "N/A")
        sma_val  = (snap.get("sma_50") or {}).get("sma", "N/A")
        enrichment += f"""
Technical Indicators (daily):
  RSI(14):   {rsi_val}
  MACD:      {macd_val}  Signal: {sig_val}
  EMA(20):   {ema_val}
  SMA(50):   {sma_val}
"""

    if ratios and isinstance(ratios, list) and ratios[0]:
        r0 = ratios[0]
        enrichment += f"""
Key Fundamentals (latest annual):
  P/E Ratio:       {r0.get('priceEarningsRatio', 'N/A')}
  P/B Ratio:       {r0.get('priceToBookRatio', 'N/A')}
  ROE:             {r0.get('returnOnEquity', 'N/A')}
  Debt/Equity:     {r0.get('debtEquityRatio', 'N/A')}
  Net Margin:      {r0.get('netProfitMargin', 'N/A')}
  Dividend Yield:  {r0.get('dividendYield', 'N/A')}
"""

    if earnings and isinstance(earnings, list) and earnings[0]:
        e0 = earnings[0]
        enrichment += f"""
Latest Earnings:
  Date:     {e0.get('date', 'N/A')}
  EPS Est:  {e0.get('epsEstimated', 'N/A')}
  EPS Act:  {e0.get('eps', 'N/A')}
  Revenue:  {e0.get('revenue', 'N/A')}
"""

    # ── Prompt ────────────────────────────────────────────────────────
    prompt = f"""You are a professional stock analyst specialising in {exchange} markets.

=== STOCK DATA ===
{req.stock_info}

=== ENRICHED CONTEXT ===
{enrichment if enrichment else "No additional data available."}

Exchange:  {exchange}
Currency:  {currency}

=== USER QUESTION ===
{req.question}

Provide a structured response:
1. BUY / SELL / HOLD recommendation with a confidence level (e.g. 72%)
2. Reasoning in 3–4 sentences referencing the technical and/or fundamental data above
3. Key risk factor specific to this stock and market
4. Market-specific context (SEBI/RBI for India, BoC for Canada, Fed/SEC for US)
"""

    response = claude_client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=700,
        messages=[{"role": "user", "content": prompt}],
    )
    return {"answer": response.content[0].text}
