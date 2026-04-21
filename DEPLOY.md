# Quantum Trade Intelligence — Deployment Guide

## Architecture

```
┌─────────────────────┐        HTTPS/JSON        ┌──────────────────────┐
│   Vercel (Frontend) │ ◄──────────────────────► │  Render (Backend)    │
│   Next.js 14        │                           │  FastAPI + Uvicorn   │
│   React + Recharts  │                           │  Finnhub + Claude AI │
└─────────────────────┘                           └──────────────────────┘
```

---

## 1 — Backend → Render

### One-time setup

1. Push the **`backend/`** folder to a GitHub repo (or the whole monorepo).
2. Go to [render.com](https://render.com) → **New Web Service**.
3. Connect your GitHub repo, set **Root Directory** to `backend`.
4. Render auto-detects Python. Set:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. In **Environment → Add Environment Variable**:

   | Key                  | Value                          |
   |----------------------|--------------------------------|
   | `FINNHUB_KEY`        | your Finnhub API key           |
   | `ANTHROPIC_API_KEY`  | your Anthropic API key         |
   | `ALLOWED_ORIGINS`    | https://tradingview360-project-kiruthika008s-projects.vercel.app    |

6. Click **Deploy**. Note the public URL (e.g. `https://qti-backend.onrender.com`).

> **Free-tier note:** Render free services spin down after 15 min of inactivity.  
> Upgrade to the Starter plan ($7/mo) for always-on uptime.

---

## 2 — Frontend → Vercel

### One-time setup

1. Go to [vercel.com](https://vercel.com) → **New Project**.
2. Import your GitHub repo; set **Root Directory** to `frontend`.
3. Framework is auto-detected as **Next.js**.
4. Add environment variable:

   | Key                    | Value                              |
   |------------------------|------------------------------------|
   | `NEXT_PUBLIC_API_URL`  | https://qti-backend.onrender.com   |

5. Click **Deploy**. Vercel gives you `https://tradingview360-project-kiruthika008s-projects.vercel.app`.

6. Go back to **Render → your service → Environment** and update  
   `ALLOWED_ORIGINS` to your real Vercel URL.

---

## 3 — AdSense

Your publisher ID (`ca-pub-9965583211535412`) is already wired in.

Replace the placeholder slot IDs in `src/components/AdBanner.tsx`:

```tsx
// Left sidebar
<AdBanner slot="YOUR_LEFT_SLOT_ID" />

// Right sidebar
<AdBanner slot="YOUR_RIGHT_SLOT_ID" />
```

Get slot IDs from **Google AdSense → Ads → By ad unit → Display ads**.

---

## 4 — Local Development

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
export FINNHUB_KEY=your_key
export ANTHROPIC_API_KEY=your_key
uvicorn main:app --reload --port 8000
# API docs → http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local → NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
# → http://localhost:3000
```

---

## 5 — Project Structure

```
qti-app/
├── backend/
│   ├── main.py            ← FastAPI app (all API routes)
│   ├── requirements.txt
│   └── render.yaml        ← Render IaC config
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx     ← Root layout + AdSense script
    │   │   ├── page.tsx       ← Main dashboard page
    │   │   └── globals.css    ← Design tokens + utility classes
    │   ├── components/
    │   │   ├── Navbar.tsx
    │   │   ├── AdBanner.tsx
    │   │   ├── MetricCard.tsx
    │   │   ├── PriceChart.tsx
    │   │   ├── TechnicalIndicators.tsx
    │   │   ├── NewsPanel.tsx
    │   │   ├── AIChat.tsx
    │   │   ├── Watchlist.tsx
    │   │   ├── PortfolioTracker.tsx
    │   │   ├── PriceAlerts.tsx
    │   │   └── SectorPeers.tsx
    │   └── lib/
    │       └── api.ts         ← Typed API client
    ├── next.config.js
    ├── tailwind.config.js
    ├── vercel.json
    └── .env.example
```

---

## 6 — API Endpoints

| Method | Path                       | Description                    |
|--------|----------------------------|--------------------------------|
| GET    | `/health`                  | Health check                   |
| GET    | `/api/quote/{symbol}`      | Live quote + signal            |
| GET    | `/api/quotes?symbols=`     | Batch quotes for watchlist     |
| GET    | `/api/news/{symbol}`       | Top 5 news with sentiment      |
| GET    | `/api/candles/{symbol}`    | OHLCV candles (resolution, bars)|
| GET    | `/api/profile/{symbol}`    | Company profile                |
| GET    | `/api/peers/{symbol}`      | Peer tickers                   |
| GET    | `/api/fx/usd-cad`          | USD→CAD exchange rate          |
| POST   | `/api/chat`                | Claude AI chat                 |

Interactive docs available at `https://your-backend.onrender.com/docs`
