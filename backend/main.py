"""
Quantum Trade Intelligence — FastAPI Backend
Deploy to Render (render.com) as a Web Service
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
import time
from datetime import datetime, timezone
import pytz
from anthropic import Anthropic

# ─── CONFIG ──────────────────────────────────────────────────────────
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
    allow_origins=["*"],          # tighten to ALLOWED_ORIGINS in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

claude_client = Anthropic(api_key=CLAUDE_KEY) if CLAUDE_KEY else None

# ─── HELPERS ─────────────────────────────────────────────────────────
def to_est(unix_ts):
    if not unix_ts:
        return "N/A"
    if unix_ts > 10**12:
        unix_ts = unix_ts / 1000
    utc_time = datetime.fromtimestamp(unix_ts, tz=timezone.utc)
    est = pytz.timezone("America/New_York")
    return utc_time.astimezone(est).strftime("%Y-%m-%d %I:%M:%S %p")

def simple_sentiment(text: str) -> str:
    text = text.lower()
    if any(w in text for w in ["rise", "profit", "gain", "up", "strong"]):
        return "positive"
    elif any(w in text for w in ["fall", "loss", "drop", "down", "crash"]):
        return "negative"
    return "neutral"

# ─── ROUTES ──────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "time": datetime.utcnow().isoformat()}

# ---------- Quote ----------
@app.get("/api/quote/{symbol}")
async def get_quote(symbol: str):
    symbol = symbol.upper().strip()
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(
            "https://finnhub.io/api/v1/quote",
            params={"symbol": symbol, "token": FINNHUB_KEY}
        )
    data = r.json()
    if not data or "c" not in data or data["c"] == 0:
        raise HTTPException(404, "Symbol not found or no data")

    price  = data["c"]
    prev   = data["pc"]
    change = ((price - prev) / prev * 100) if prev else 0
    signal = "BUY" if change > 2 else ("SELL" if change < -2 else "HOLD")

    return {
        "ticker": symbol,
        "price":  price,
        "open":   data.get("o"),
        "high":   data.get("h"),
        "low":    data.get("l"),
        "prev_close": prev,
        "change": round(change, 4),
        "signal": signal,
    }

# ---------- Batch quotes for watchlist ----------
@app.get("/api/quotes")
async def get_quotes(symbols: str = Query(..., description="Comma-separated tickers")):
    tickers = [s.strip().upper() for s in symbols.split(",")][:10]
    results = []
    async with httpx.AsyncClient(timeout=10) as client:
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
                    results.append({
                        "ticker": sym,
                        "price":  round(price, 2),
                        "change": round(change, 2),
                        "signal": "BUY" if change > 2 else ("SELL" if change < -2 else "HOLD"),
                    })
            except Exception:
                pass
    return results

# ---------- News ----------
@app.get("/api/news/{symbol}")
async def get_news(symbol: str):
    symbol = symbol.upper().strip()
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(
            "https://finnhub.io/api/v1/company-news",
            params={
                "symbol": symbol,
                "from": "2025-01-01",
                "to": "2026-12-31",
                "token": FINNHUB_KEY,
            }
        )
    items = r.json()
    if not isinstance(items, list):
        return []
    return [
        {
            "headline":  n.get("headline", ""),
            "url":       n.get("url", "#"),
            "source":    n.get("source", ""),
            "datetime":  to_est(n.get("datetime")),
            "sentiment": simple_sentiment(n.get("headline", "")),
        }
        for n in items[:5]
    ]

# ---------- Candles ----------
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
            params={
                "symbol": symbol,
                "resolution": resolution,
                "from": start,
                "to": now,
                "token": FINNHUB_KEY,
            }
        )
    d = r.json()
    if not isinstance(d, dict) or d.get("s") != "ok" or not d.get("t"):
        raise HTTPException(404, "No candle data")

    return [
        {
            "time":   t,
            "open":   o,
            "high":   h,
            "low":    l,
            "close":  c,
            "volume": v,
        }
        for t, o, h, l, c, v in zip(d["t"], d["o"], d["h"], d["l"], d["c"], d["v"])
    ]

# ---------- Company profile ----------
@app.get("/api/profile/{symbol}")
async def get_profile(symbol: str):
    symbol = symbol.upper().strip()
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(
            "https://finnhub.io/api/v1/stock/profile2",
            params={"symbol": symbol, "token": FINNHUB_KEY}
        )
    return r.json()

# ---------- Peers ----------
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

# ---------- FX rate ----------
@app.get("/api/fx/usd-cad")
async def get_fx():
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(
                "https://api.exchangerate.host/latest",
                params={"base": "USD", "symbols": "CAD"}
            )
        data = r.json()
        rate = data.get("rates", {}).get("CAD", 1.35)
    except Exception:
        rate = 1.35
    return {"usd_to_cad": rate}

# ---------- AI Chat ----------
class ChatRequest(BaseModel):
    question: str
    stock_info: dict

@app.post("/api/chat")
async def chat(req: ChatRequest):
    if not claude_client:
        raise HTTPException(503, "AI assistant not configured")
    prompt = f"""
You are a professional stock trading assistant.

Stock Data:
{req.stock_info}

User Question:
{req.question}

Give:
- BUY / SELL / HOLD recommendation
- Short reasoning (2-3 sentences)
- Key risk factor
"""
    response = claude_client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}]
    )
    return {"answer": response.content[0].text}
