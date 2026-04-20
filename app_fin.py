import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import requests
from anthropic import Anthropic
from datetime import datetime, timezone
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
<style>

/* ================= ROOT ================= */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.stApp {
    background: radial-gradient(circle at top, #050505 0%, #000000 100%);
    color: #00ff88;
    font-family: 'Inter', sans-serif;
}

/* ================= MAIN CONTAINER ================= */
.block-container {
    max-width: 1200px;
    margin: auto;
    padding: 2rem;
    background: rgba(10, 10, 10, 0.85);
    border-radius: 16px;
    border: 1px solid rgba(0, 255, 136, 0.15);
    box-shadow: 0 0 30px rgba(0, 255, 136, 0.08);
}

/* ================= HEADINGS ================= */
h1 {
    font-size: 2.4rem;
    font-weight: 800;
    color: #00ff88;
    text-align: center;
    letter-spacing: 1px;
    text-shadow: 0 0 10px rgba(0,255,136,0.3);
}

h2, h3 {
    color: #b6ffda;
    text-align: center;
    font-weight: 600;
}

/* ================= TEXT ================= */
p, div, span {
    color: #c9ffe5;
    font-size: 0.95rem;
}

/* ================= METRICS ================= */
div[data-testid="stMetric"] {
    background: rgba(0, 255, 136, 0.05);
    border: 1px solid rgba(0, 255, 136, 0.2);
    padding: 14px;
    border-radius: 12px;
    box-shadow: 0 0 10px rgba(0,255,136,0.08);
}

div[data-testid="stMetricLabel"] {
    color: #7ef9b6;
    font-size: 0.85rem;
}

div[data-testid="stMetricValue"] {
    color: #00ff88;
    font-size: 1.3rem;
    font-weight: 700;
}

/* ================= INPUT BOX ================= */
input {
    background-color: #000 !important;
    color: #00ff88 !important;
    border: 1px solid rgba(0,255,136,0.3) !important;
    border-radius: 10px !important;
    padding: 10px !important;
}

/* ================= BUTTON ================= */
button {
    background: linear-gradient(90deg, #00ff88, #00cc66) !important;
    color: #000 !important;
    font-weight: 700 !important;
    border-radius: 10px !important;
    border: none !important;
    transition: 0.2s ease-in-out;
}

button:hover {
    transform: scale(1.02);
    box-shadow: 0 0 15px rgba(0,255,136,0.4);
}

/* ================= DATA TABLE ================= */
table {
    background: #000 !important;
    color: #00ff88 !important;
    border: 1px solid rgba(0,255,136,0.2);
}

/* ================= SIDEBAR / ADS ================= */
.css-1d391kg {
    background-color: #000 !important;
}

/* ================= CHART ================= */
.js-plotly-plot {
    background: #000 !important;
    border-radius: 12px;
    box-shadow: 0 0 15px rgba(0,255,136,0.08);
}

/* ================= LINKS ================= */
a {
    color: #00ff88 !important;
}

a:hover {
    color: #7CFFB2 !important;
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

# ================= WATCHLIST =================
st.subheader("📌 Watchlist (Up to 10 tickers)")

watchlist_input = st.text_input(
    "Enter tickers separated by comma",
    "AAPL,MSFT,GOOGL"
)

watchlist = [t.strip().upper() for t in watchlist_input.split(",")][:10]

# ================= EMAIL SUBSCRIPTION =================
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

# ================= SENTIMENT =================
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

# ================= WATCHLIST TABLE =================
def scan_watchlist(tickers):
    data = []
    for t in tickers:
        d = get_stock_data(t)
        if d:
            data.append(d)
    return pd.DataFrame(data)

watch_df = scan_watchlist(watchlist)

# ======================== EST TIME ========================
def to_est(unix_ts):
    if not unix_ts:
        return "N/A"
    if unix_ts > 10**12:
        unix_ts = unix_ts / 1000
    utc_time = datetime.fromtimestamp(unix_ts, tz=timezone.utc)
    est = pytz.timezone("America/New_York")
    est_time = utc_time.astimezone(est)
    return est_time.strftime("%Y-%m-%d %I:%M:%S %p")


# =================================================================
# ==================== NEW FEATURE HELPERS ========================
# =================================================================

# -------- 1. PORTFOLIO TRACKER --------
def init_portfolio():
    if "portfolio" not in st.session_state:
        st.session_state.portfolio = {}   # { ticker: {"shares": x, "avg_cost": y} }

def add_to_portfolio(sym, shares, avg_cost):
    st.session_state.portfolio[sym] = {"shares": shares, "avg_cost": avg_cost}

def get_portfolio_df():
    rows = []
    for sym, data in st.session_state.portfolio.items():
        live = get_stock_data(sym)
        if not live:
            continue
        current_price = live["price"]
        shares        = data["shares"]
        avg_cost      = data["avg_cost"]
        market_value  = current_price * shares
        cost_basis    = avg_cost * shares
        pnl           = market_value - cost_basis
        pnl_pct       = (pnl / cost_basis * 100) if cost_basis else 0
        rows.append({
            "Ticker":        sym,
            "Shares":        shares,
            "Avg Cost":      avg_cost,
            "Current Price": round(current_price, 2),
            "Market Value":  round(market_value, 2),
            "P&L ($)":       round(pnl, 2),
            "P&L (%)":       round(pnl_pct, 2),
        })
    return pd.DataFrame(rows)

# -------- 2. PRICE ALERTS --------
def init_alerts():
    if "price_alerts" not in st.session_state:
        st.session_state.price_alerts = []   # list of { ticker, target, direction }

def check_alerts(current_ticker, current_price):
    triggered = []
    for alert in st.session_state.price_alerts:
        if alert["ticker"] != current_ticker:
            continue
        if alert["direction"] == "above" and current_price >= alert["target"]:
            triggered.append(alert)
        elif alert["direction"] == "below" and current_price <= alert["target"]:
            triggered.append(alert)
    return triggered

# -------- 3. TECHNICAL INDICATORS --------
def get_candle_data(symbol, resolution="60", bars=100):
    """Fetch recent OHLCV candles from Finnhub."""
    import time
    now   = int(time.time())
    start = now - bars * 3600  # rough lookback
    url   = "https://finnhub.io/api/v1/stock/candle"
    params = {
        "symbol":     symbol,
        "resolution": resolution,
        "from":       start,
        "to":         now,
        "token":      FINNHUB_KEY,
    }
    try:
        res = requests.get(url, params=params).json()
    except:
        return None
    if res.get("s") != "ok":
        return None
    df = pd.DataFrame({
        "time":   pd.to_datetime(res["t"], unit="s"),
        "open":   res["o"],
        "high":   res["h"],
        "low":    res["l"],
        "close":  res["c"],
        "volume": res["v"],
    })
    return df

def compute_rsi(series, period=14):
    delta = series.diff()
    gain  = delta.clip(lower=0).rolling(period).mean()
    loss  = (-delta.clip(upper=0)).rolling(period).mean()
    rs    = gain / loss
    return 100 - (100 / (1 + rs))

def compute_macd(series, fast=12, slow=26, signal=9):
    ema_fast   = series.ewm(span=fast, adjust=False).mean()
    ema_slow   = series.ewm(span=slow, adjust=False).mean()
    macd_line  = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    histogram  = macd_line - signal_line
    return macd_line, signal_line, histogram

def compute_bollinger(series, period=20, std_dev=2):
    sma   = series.rolling(period).mean()
    std   = series.rolling(period).std()
    upper = sma + std_dev * std
    lower = sma - std_dev * std
    return upper, sma, lower

# -------- 4. SECTOR / PEER INFO --------
def get_company_profile(symbol):
    url    = "https://finnhub.io/api/v1/stock/profile2"
    params = {"symbol": symbol, "token": FINNHUB_KEY}
    try:
        return requests.get(url, params=params).json()
    except:
        return {}

def get_peers(symbol):
    url    = "https://finnhub.io/api/v1/stock/peers"
    params = {"symbol": symbol, "token": FINNHUB_KEY}
    try:
        res = requests.get(url, params=params).json()
        return res[:6] if isinstance(res, list) else []
    except:
        return []

# =================================================================
# ========================= LAYOUT ================================
# =================================================================
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

    # ================= SIGNAL BADGE =================
    if stock["signal"] == "BUY":
        st.success("🟢 BUY SIGNAL")
    elif stock["signal"] == "SELL":
        st.error("🔴 SELL SIGNAL")
    else:
        st.info("🟡 HOLD SIGNAL")

    st.divider()

    # ================= LINE CHART =================
    st.subheader("📈 Price Movement (5D)")

    hist_url = "https://finnhub.io/api/v1/stock/candle"
    params = {
        "symbol":     ticker,
        "resolution": "60",
        "from":       1700000000,
        "to":         1700500000,
        "token":      FINNHUB_KEY
    }
    hist = requests.get(hist_url, params=params).json()

    if hist.get("s") == "ok":
        chart_df = pd.DataFrame({
            "time":  pd.to_datetime(hist["t"], unit="s"),
            "close": hist["c"]
        })
        fig = px.line(chart_df, x="time", y="close")
        st.plotly_chart(fig, width='stretch')

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
        st.dataframe(watch_df, width='stretch')

        fig2 = px.line(
            watch_df,
            x="ticker",
            y="price",
            title="Watchlist Price Comparison"
        )
        st.plotly_chart(fig2, width='stretch')

    # =================================================================
    # ==================== NEW FEATURE SECTIONS =======================
    # =================================================================

    st.divider()

    # ===================== 1. PORTFOLIO TRACKER =====================
    st.subheader("💼 Portfolio Tracker")

    init_portfolio()

    with st.expander("➕ Add / Update Position"):
        p_col1, p_col2, p_col3 = st.columns(3)
        p_sym   = p_col1.text_input("Ticker", value=ticker, key="port_sym").upper().strip()
        p_shares = p_col2.number_input("Shares", min_value=0.01, value=1.0, step=0.01, key="port_shares")
        p_cost   = p_col3.number_input("Avg Cost (USD)", min_value=0.01, value=100.0, step=0.01, key="port_cost")

        if st.button("Add to Portfolio"):
            if p_sym:
                add_to_portfolio(p_sym, p_shares, p_cost)
                st.success(f"✅ {p_sym} added/updated in portfolio")

    port_df = get_portfolio_df()

    if port_df.empty:
        st.info("No positions yet. Add a ticker above.")
    else:
        # colour P&L column
        def colour_pnl(val):
            colour = "green" if val >= 0 else "red"
            return f"color: {colour}"

        styled = port_df.style.map(colour_pnl, subset=["P&L ($)", "P&L (%)"])
        st.dataframe(styled, width='stretch')

        total_value = port_df["Market Value"].sum()
        total_pnl   = port_df["P&L ($)"].sum()
        pnl_colour  = "🟢" if total_pnl >= 0 else "🔴"

        m1, m2 = st.columns(2)
        m1.metric("Total Portfolio Value", format_price(total_value))
        m2.metric("Total P&L", f"{pnl_colour} {format_price(abs(total_pnl))}")

        # Remove a position
        remove_sym = st.selectbox("Remove position", ["-- select --"] + list(st.session_state.portfolio.keys()))
        if st.button("Remove") and remove_sym != "-- select --":
            del st.session_state.portfolio[remove_sym]
            st.success(f"Removed {remove_sym}")
            st.rerun()

    st.divider()

    # ===================== 2. PRICE ALERTS =====================
    st.subheader("🔔 Price Alerts")

    init_alerts()

    with st.expander("➕ Set New Alert"):
        a_col1, a_col2, a_col3 = st.columns(3)
        a_sym       = a_col1.text_input("Ticker", value=ticker, key="alert_sym").upper().strip()
        a_direction = a_col2.selectbox("Trigger when price is", ["above", "below"])
        a_target    = a_col3.number_input("Target Price (USD)", min_value=0.01, value=float(stock["price"]), step=0.01)

        if st.button("Set Alert"):
            st.session_state.price_alerts.append({
                "ticker":    a_sym,
                "target":    a_target,
                "direction": a_direction
            })
            st.success(f"🔔 Alert set: {a_sym} {a_direction} ${a_target:.2f}")

    # Display active alerts
    if st.session_state.price_alerts:
        alerts_df = pd.DataFrame(st.session_state.price_alerts)
        st.dataframe(alerts_df, width='stretch')

        # Check alerts for current ticker
        triggered = check_alerts(ticker, stock["price"])
        for alert in triggered:
            st.error(f"🚨 ALERT TRIGGERED: {alert['ticker']} is {alert['direction']} ${alert['target']:.2f}! Current: {format_price(stock['price'])}")

        if st.button("Clear All Alerts"):
            st.session_state.price_alerts = []
            st.success("All alerts cleared")
            st.rerun()
    else:
        st.info("No alerts set. Add one above.")

    st.divider()

    # ===================== 3. TECHNICAL INDICATORS =====================
    st.subheader("📐 Technical Indicators")

    ti_resolution = st.selectbox("Candle Resolution", ["15", "30", "60", "D"], index=2, key="ti_res")
    candle_df = get_candle_data(ticker, resolution=ti_resolution, bars=120)

    if candle_df is None or candle_df.empty:
        st.warning("Not enough candle data for indicators.")
    else:
        close = candle_df["close"]

        # --- RSI ---
        candle_df["RSI"] = compute_rsi(close)

        # --- MACD ---
        candle_df["MACD"], candle_df["Signal"], candle_df["Histogram"] = compute_macd(close)

        # --- Bollinger Bands ---
        candle_df["BB_Upper"], candle_df["BB_Mid"], candle_df["BB_Lower"] = compute_bollinger(close)

        # ---- Price + Bollinger chart ----
        fig_bb = go.Figure()
        fig_bb.add_trace(go.Scatter(x=candle_df["time"], y=close,          name="Close",    line=dict(color="#00ff88")))
        fig_bb.add_trace(go.Scatter(x=candle_df["time"], y=candle_df["BB_Upper"], name="Upper BB", line=dict(color="#ff4444", dash="dash")))
        fig_bb.add_trace(go.Scatter(x=candle_df["time"], y=candle_df["BB_Mid"],   name="SMA 20",   line=dict(color="#ffdd00", dash="dot")))
        fig_bb.add_trace(go.Scatter(x=candle_df["time"], y=candle_df["BB_Lower"], name="Lower BB", line=dict(color="#ff4444", dash="dash"),
                                     fill="tonexty", fillcolor="rgba(255,68,68,0.07)"))
        fig_bb.update_layout(title="Bollinger Bands", paper_bgcolor="#000", plot_bgcolor="#000", font_color="#00ff88")
        st.plotly_chart(fig_bb, width='stretch')

        # ---- RSI chart ----
        fig_rsi = go.Figure()
        fig_rsi.add_trace(go.Scatter(x=candle_df["time"], y=candle_df["RSI"], name="RSI", line=dict(color="#00ff88")))
        fig_rsi.add_hline(y=70, line_dash="dash", line_color="red",    annotation_text="Overbought (70)")
        fig_rsi.add_hline(y=30, line_dash="dash", line_color="#00aaff", annotation_text="Oversold (30)")
        fig_rsi.update_layout(title="RSI (14)", paper_bgcolor="#000", plot_bgcolor="#000", font_color="#00ff88", yaxis=dict(range=[0, 100]))
        st.plotly_chart(fig_rsi, width='stretch')

        # ---- MACD chart ----
        fig_macd = go.Figure()
        fig_macd.add_trace(go.Scatter(x=candle_df["time"], y=candle_df["MACD"],   name="MACD",   line=dict(color="#00ff88")))
        fig_macd.add_trace(go.Scatter(x=candle_df["time"], y=candle_df["Signal"], name="Signal", line=dict(color="#ffdd00")))
        fig_macd.add_trace(go.Bar(    x=candle_df["time"], y=candle_df["Histogram"], name="Histogram",
                                       marker_color=["#00ff88" if v >= 0 else "#ff4444" for v in candle_df["Histogram"].fillna(0)]))
        fig_macd.update_layout(title="MACD (12/26/9)", paper_bgcolor="#000", plot_bgcolor="#000", font_color="#00ff88")
        st.plotly_chart(fig_macd, width='stretch')

        # ---- Quick signal summary ----
        last_rsi  = candle_df["RSI"].dropna().iloc[-1]  if not candle_df["RSI"].dropna().empty  else None
        last_macd = candle_df["MACD"].dropna().iloc[-1] if not candle_df["MACD"].dropna().empty else None
        last_sig  = candle_df["Signal"].dropna().iloc[-1] if not candle_df["Signal"].dropna().empty else None

        ti_col1, ti_col2, ti_col3 = st.columns(3)

        if last_rsi is not None:
            rsi_label = "Overbought 🔴" if last_rsi > 70 else ("Oversold 🟢" if last_rsi < 30 else "Neutral 🟡")
            ti_col1.metric("RSI (14)", f"{last_rsi:.1f}", rsi_label)

        if last_macd is not None and last_sig is not None:
            macd_label = "Bullish 🟢" if last_macd > last_sig else "Bearish 🔴"
            ti_col2.metric("MACD Signal", macd_label)

        last_close = close.iloc[-1]
        last_upper = candle_df["BB_Upper"].dropna().iloc[-1]
        last_lower = candle_df["BB_Lower"].dropna().iloc[-1]
        bb_label   = "Near Upper 🔴" if last_close >= last_upper * 0.98 else ("Near Lower 🟢" if last_close <= last_lower * 1.02 else "Inside Band 🟡")
        ti_col3.metric("Bollinger", bb_label)

    st.divider()

    # ===================== 4. SECTOR / INDUSTRY + PEER COMPARISON =====================
    st.subheader("🏢 Sector, Industry & Peer Comparison")

    profile = get_company_profile(ticker)

    if profile:
        s_col1, s_col2, s_col3 = st.columns(3)
        s_col1.metric("Company",  profile.get("name", "N/A"))
        s_col2.metric("Sector",   profile.get("finnhubIndustry", "N/A"))
        s_col3.metric("Exchange", profile.get("exchange", "N/A"))

        detail_col1, detail_col2 = st.columns(2)
        detail_col1.metric("Country",      profile.get("country", "N/A"))
        detail_col2.metric("Market Cap",   f"${profile.get('marketCapitalization', 0):,.0f}M")

        website = profile.get("weburl", "")
        if website:
            st.markdown(f"🌐 [Company Website]({website})")
    else:
        st.warning("Could not load company profile.")

    # ---- Peers ----
    peers = get_peers(ticker)

    if peers:
        st.markdown("#### 🤝 Peer Companies")
        peer_data = []
        for p in peers:
            if p == ticker:
                continue
            d = get_stock_data(p)
            if d:
                peer_data.append(d)

        if peer_data:
            peer_df = pd.DataFrame(peer_data)

            # Colour change column
            def colour_change(val):
                return "color: green" if val >= 0 else "color: red"

            styled_peer = peer_df.style.map(colour_change, subset=["change"])
            st.dataframe(styled_peer, width='stretch')

            # Bar chart comparison
            fig_peer = go.Figure()
            all_tickers = [ticker] + peer_df["ticker"].tolist()
            all_prices  = [stock["price"]] + peer_df["price"].tolist()
            all_changes = [stock["change"]] + peer_df["change"].tolist()
            bar_colours = ["#00ff88" if c >= 0 else "#ff4444" for c in all_changes]

            fig_peer.add_trace(go.Bar(
                x=all_tickers,
                y=all_prices,
                marker_color=bar_colours,
                text=[f"{c:+.2f}%" for c in all_changes],
                textposition="outside"
            ))
            fig_peer.update_layout(
                title="Peer Price Comparison",
                paper_bgcolor="#000",
                plot_bgcolor="#000",
                font_color="#00ff88",
                yaxis_title="Price (USD)"
            )
            st.plotly_chart(fig_peer, width='stretch')
        else:
            st.info("No live peer data available.")
    else:
        st.info("No peers found for this ticker.")

# ================= RIGHT ADS =================
with right:
    st.markdown("### 📢 Ads")
    st.info("Your Ad Here")