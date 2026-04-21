import streamlit as st
import pandas as pd
import plotly.express as px
import requests
from textblob import TextBlob
from openai import OpenAI

# ================= CONFIG =================
st.set_page_config(page_title="AI Trading Dashboard", layout="wide")

st.title("📊 AI Trading Dashboard")
st.caption("Stocks + GPT + Sentiment Analysis 🚀")

FINNHUB_API = "YOUR_FINNHUB_KEY"
OPENAI_API = "YOUR_OPENAI_KEY"

client = OpenAI(api_key=OPENAI_API)

# ================= STOCK DATA =================
def scan_market(API_KEY):

    tickers = ["AAPL", "MSFT", "GOOGL"]

    results = []

    for symbol in tickers:
        url = "https://finnhub.io/api/v1/quote"
        params = {"symbol": symbol, "token": API_KEY}

        try:
            res = requests.get(url, params=params).json()
        except:
            continue

        if not res or "c" not in res or res["c"] == 0:
            continue

        price = res["c"]
        prev = res["pc"]

        change = ((price - prev) / prev) * 100

        results.append({
            "ticker": symbol,
            "price": price,
            "change": change
        })

    return results


# ================= NEWS =================
def get_stock_news(symbol, API_KEY):
    url = "https://finnhub.io/api/v1/company-news"

    params = {
        "symbol": symbol,
        "from": "2024-01-01",
        "to": "2026-12-31",
        "token": API_KEY
    }

    try:
        res = requests.get(url, params=params).json()
    except:
        return []

    return res[:5] if isinstance(res, list) else []


# ================= SENTIMENT =================
def analyze_sentiment(news_list):

    scores = []

    for n in news_list:
        text = n["headline"]
        score = TextBlob(text).sentiment.polarity
        scores.append(score)

    if not scores:
        return 0, "NEUTRAL"

    avg = sum(scores) / len(scores)

    if avg > 0.2:
        return avg, "POSITIVE"
    elif avg < -0.2:
        return avg, "NEGATIVE"
    else:
        return avg, "NEUTRAL"


# ================= LOAD =================
@st.cache_data(ttl=300)
def load_data():
    return scan_market(FINNHUB_API)

df = pd.DataFrame(load_data())

if df.empty:
    st.warning("No data available")
    st.stop()

# ================= SENTIMENT + SIGNAL =================
sentiments = []
signals = []

for ticker in df["ticker"]:
    news = get_stock_news(ticker, FINNHUB_API)
    score, label = analyze_sentiment(news)

    sentiments.append(label)

    if label == "POSITIVE":
        signals.append("BUY")
    elif label == "NEGATIVE":
        signals.append("SELL")
    else:
        signals.append("HOLD")

df["sentiment"] = sentiments
df["signal"] = signals

# ================= DASHBOARD =================
col1, col2, col3 = st.columns(3)

col1.metric("Stocks", len(df))
col2.metric("BUY", len(df[df["signal"] == "BUY"]))
col3.metric("SELL", len(df[df["signal"] == "SELL"]))

st.divider()

# TABLE
st.subheader("📋 Market Data")

df_sorted = df.sort_values(by="change", ascending=False)
st.dataframe(df_sorted, use_container_width=True)

# CHART
st.subheader("📈 Top Movers")

fig = px.bar(
    df_sorted,
    x="ticker",
    y="change",
    color="signal",
    title="Market Movers"
)

st.plotly_chart(fig, use_container_width=True)

# ================= NEWS UI =================
st.subheader("📰 News + Sentiment")

selected = st.selectbox("Select Stock", df["ticker"])

news = get_stock_news(selected, FINNHUB_API)
score, label = analyze_sentiment(news)

st.write(f"Sentiment: **{label} ({score:.2f})**")

for n in news:
    st.markdown(f"**[{n['headline']}]({n['url']})**")

# ================= GPT CHAT =================
st.divider()
st.subheader("🤖 AI Chatbot (GPT)")

user_input = st.text_input("Ask about stocks, signals, or news...")

def ask_gpt(prompt, df):

    context = df.to_string()

    full_prompt = f"""
    You are a stock trading assistant.

    Data:
    {context}

    User question:
    {prompt}

    Answer clearly with insights.
    """

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": full_prompt}]
    )

    return response.choices[0].message.content


if user_input:
    answer = ask_gpt(user_input, df)
    st.write("🤖", answer)