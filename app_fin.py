import streamlit as st
import pandas as pd
import plotly.express as px
import requests
from anthropic import Anthropic
from datetime import datetime
import pytz
# ================= CONFIG =================
st.set_page_config(page_title="AI Trading Pro", layout="wide")

st.title("📈 Quantum Trade Intelligence Terminal")
st.caption("Stock Scanner + News + Claude AI Assistant")

# ================= KEYS =================
FINNHUB_KEY = "d7ht4s9r01qu8vfmhv1gd7ht4s9r01qu8vfmhv20"
CLAUDE_KEY = "YOUR_CLAUDE_API_KEY"

claude = Anthropic(api_key=CLAUDE_KEY)

# ================= STYLE =================
st.markdown("""
<style>
    .stApp {
        background-color: #ffffff;
        color: #111111;
    }
</style>
""", unsafe_allow_html=True)

st.markdown("""
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

<style>

/* ================= BOOTSTRAP DARK DASHBOARD THEME ================= */

.stApp {
    background: #0b1220;
    color: #e2e8f0;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}

/* Main container (Bootstrap card feel) */
.block-container {
    max-width: 1200px;
    margin: auto;
    padding: 2rem;
}

/* ================= HEADINGS ================= */
h1 {
    font-size: 2.4rem;
    font-weight: 700;
    text-align: center;
    color: #f8fafc;
    margin-bottom: 0.5rem;
}

h2, h3 {
    font-weight: 600;
    color: #cbd5e1;
    text-align: center;
}

/* ================= BOOTSTRAP CARD STYLE ================= */
div[data-testid="stMetric"] {
    background: #111827;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

/* Metric labels */
div[data-testid="stMetricLabel"] {
    color: #94a3b8;
    font-size: 0.85rem;
}

/* Metric values */
div[data-testid="stMetricValue"] {
    color: #f8fafc;
    font-size: 1.3rem;
    font-weight: 700;
}

/* ================= INPUTS (Bootstrap form style) ================= */
input {
    background-color: #0f172a !important;
    color: #f8fafc !important;
    border: 1px solid #334155 !important;
    border-radius: 10px !important;
    padding: 10px !important;
}

/* ================= BUTTON (Bootstrap primary feel) ================= */
button {
    background-color: #2563eb !important;
    color: white !important;
    border-radius: 10px !important;
    border: none !important;
    padding: 0.5rem 1rem !important;
}

button:hover {
    background-color: #1d4ed8 !important;
}

/* ================= TABLE ================= */
table {
    background: #0f172a !important;
    color: #e2e8f0 !important;
}

/* ================= CHART CONTAINER ================= */
.js-plotly-plot {
    background: #111827 !important;
    border-radius: 12px;
    padding: 10px;
}

/* ================= LINKS (Bootstrap style) ================= */
a {
    color: #60a5fa !important;
}

/* ================= CLEAN SIDEBAR ================= */
section[data-testid="stSidebar"] {
    background-color: #0a0f1c;
    border-right: 1px solid rgba(255,255,255,0.05);
}

</style>
""", unsafe_allow_html=True)

# ================= TOP MODE (CAD / USD) =================
st.subheader("🌍 Market Display Mode")

currency_mode = st.radio(
    "Select View",
    ["USD 🇺🇸", "CAD 🇨🇦"],
    horizontal=True
)

def get_usd_to_cad():
    try:
        url = "https://api.exchangerate.host/latest?base=USD&symbols=CAD"
        res = requests.get(url, timeout=5).json()

        if "rates" in res and "CAD" in res["rates"]:
            return res["rates"]["CAD"]

        return 1.35
    except:
        return 1.35

@st.cache_data(ttl=3600)
def cached_fx():
    return get_usd_to_cad()

usd_to_cad = cached_fx()

def format_price(value):
    if currency_mode.startswith("CAD"):
        converted = value * usd_to_cad
        return f"C${converted:,.2f}"
    return f"${value:,.2f}"

# ================= INPUT =================
st.subheader("📥 Enter Ticker")

ticker = st.text_input("Example: AAPL / BNS.TO", "AAPL").upper().strip()

# ================= WATCHLIST (NEW) =================
st.subheader("📌 Watchlist (Up to 10 tickers)")

watchlist_input = st.text_input(
    "Enter tickers separated by comma",
    "AAPL,MSFT,GOOGL"
)

watchlist = [t.strip().upper() for t in watchlist_input.split(",")][:10]

# ================= EMAIL SUBSCRIPTION (NEW) =================
if "subscribers" not in st.session_state:
    st.session_state.subscribers = []

st.subheader("📧 Email Alerts")

email = st.text_input("Enter email to subscribe")

if st.button("Subscribe"):
    if email and email not in st.session_state.subscribers:
        st.session_state.subscribers.append(email)
        st.success("Subscribed successfully ✔️")

# ================= STOCK API =================
def get_stock_data(symbol):
    url = "https://finnhub.io/api/v1/quote"
    params = {"symbol": symbol, "token": FINNHUB_KEY}

    try:
        res = requests.get(url, params=params).json()
    except:
        return None

    if not res or "c" not in res:
        return None

    price = res["c"]
    prev = res["pc"]

    if prev == 0:
        return None

    change = ((price - prev) / prev) * 100

    signal = "BUY" if change > 2 else "HOLD"
    if change < -2:
        signal = "SELL"

    return {
        "ticker": symbol,
        "price": price,
        "change": change,
        "signal": signal
    }

# ================= NEWS =================
def get_stock_news(symbol):
    url = "https://finnhub.io/api/v1/company-news"

    params = {
        "symbol": symbol,
        "from": "2025-01-01",
        "to": "2026-12-31",
        "token": FINNHUB_KEY
    }

    try:
        res = requests.get(url, params=params).json()
    except:
        return []

    return res[:5] if isinstance(res, list) else []

# ================= SENTIMENT (NEW) =================
def simple_sentiment(text):
    text = text.lower()
    if any(w in text for w in ["rise", "profit", "gain", "up", "strong"]):
        return "🟢 Positive"
    elif any(w in text for w in ["fall", "loss", "drop", "down", "crash"]):
        return "🔴 Negative"
    return "🟡 Neutral"

# ================= CLAUDE AI =================
def ask_claude(question, stock_info):

    prompt = f"""
You are a professional stock trading assistant.

Stock Data:
{stock_info}

User Question:
{question}

Give:
- BUY / SELL / HOLD
- short reasoning
"""

    response = claude.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}]
    )

    return response.content[0].text

# ================= LOAD DATA =================
stock = get_stock_data(ticker)

if not stock:
    st.warning("Invalid ticker or no data available")
    st.stop()

df = pd.DataFrame([stock])

# ================= WATCHLIST TABLE (NEW) =================
def scan_watchlist(tickers):
    data = []
    for t in tickers:
        d = get_stock_data(t)
        if d:
            data.append(d)
    return pd.DataFrame(data)

watch_df = scan_watchlist(watchlist)

#========================EST TIME========================

def to_est(unix_ts):
    if not unix_ts:
        return "N/A"

    # handle milliseconds if API returns ms
    if unix_ts > 10**12:
        unix_ts = unix_ts / 1000

    utc_time = datetime.utcfromtimestamp(unix_ts)

    est = pytz.timezone("America/New_York")
    est_time = utc_time.replace(tzinfo=pytz.utc).astimezone(est)

    return est_time.strftime("%Y-%m-%d %I:%M:%S %p")

# ================= LAYOUT =================
left, center, right = st.columns([1, 3, 1])

# ================= LEFT ADS =================
with left:
    st.markdown("### 📢 Ads")
    st.info("Your Ad Here")

# ================= CENTER =================
with center:

    st.subheader("📊 Stock Overview")

    col1, col2, col3 = st.columns(3)

    col1.metric("Ticker", stock["ticker"])
    col2.metric("Price", format_price(stock["price"]))
    col3.metric("Change %", f"{stock['change']:.2f}%")

    # ================= SIGNAL BADGE (NEW) =================
    if stock["signal"] == "BUY":
        st.success("🟢 BUY SIGNAL")
    elif stock["signal"] == "SELL":
        st.error("🔴 SELL SIGNAL")
    else:
        st.info("🟡 HOLD SIGNAL")

    st.divider()

    # ================= LINE CHART FIXED =================
    st.subheader("📈 Price Movement (5D)")

    hist_url = "https://finnhub.io/api/v1/stock/candle"
    params = {
        "symbol": ticker,
        "resolution": "60",
        "from": 1700000000,
        "to": 1700500000,
        "token": FINNHUB_KEY
    }

    hist = requests.get(hist_url, params=params).json()

    if hist.get("s") == "ok":
        chart_df = pd.DataFrame({
            "time": pd.to_datetime(hist["t"], unit="s"),
            "close": hist["c"]
        })

        fig = px.line(chart_df, x="time", y="close")
        st.plotly_chart(fig, use_container_width=True)

    # ================= NEWS =================
    st.subheader("📰 Top 5 News")

    news = get_stock_news(ticker)

    if not news:
        st.warning("No news found")
    else:
        for n in news:
            sentiment = simple_sentiment(n.get("headline", ""))

            st.markdown(f"""
            **[{n.get('headline','No title')}]({n.get('url','#')})**  
            🧠 Sentiment: {sentiment}  
            🕒 EST Time:{to_est(n.get('datetime',''))}
            """)

    # ================= CHATBOT =================
    st.subheader("🤖 Claude AI Assistant")

    user_input = st.text_input("Ask about this stock", key="chat")

    if user_input:
        answer = ask_claude(user_input, stock)
        st.success(answer)

    # ================= WATCHLIST =================
    st.subheader("📌 Watchlist Overview")

    if not watch_df.empty:
        st.dataframe(watch_df, use_container_width=True)

        fig2 = px.line(
            watch_df,
            x="ticker",
            y="price",
            title="Watchlist Price Comparison"
        )

        st.plotly_chart(fig2, use_container_width=True)

# ================= RIGHT ADS =================
with right:
    st.markdown("### 📢 Ads")
    st.info("Your Ad Here")