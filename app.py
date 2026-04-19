# app.py
import streamlit as st
import pandas as pd
from scanner import scan_market
#from scanner_fin import * 
import plotly.express as px
import yfinance as yf

st.set_page_config(
    page_title="TSX Trading Dashboard",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.title("📈 TSX Trading Dashboard")
st.caption("AI-powered stock scanner")

API_KEY = "DFH73KHBFQ103CED"
Fin_hub_key="d7ht4s9r01qu8vfmhv1gd7ht4s9r01qu8vfmhv20"

@st.cache_data(ttl=3600)  # cache for 1 hour
def get_data():
    return scan_market(API_KEY)
data = get_data()
print(data[:2])

#df = pd.DataFrame(data)
df = pd.DataFrame(data)
print(df.columns)

# Filters
signal_filter = st.selectbox("Filter by Signal", ["ALL", "BUY", "SELL", "HOLD"])
if signal_filter != "ALL":
    df = df[df["signal"] == signal_filter]

st.write(df.columns)
# Then show sorted data
st.subheader("📊 Sorted by Change")
st.dataframe(
    df.sort_values(by="change", ascending=False),
    use_container_width=True
)

col1, col2, col3 = st.columns(3)

total = len(df)
buy_count = len(df[df["signal"] == "BUY"])
avg_change = df["change"].mean()

col1.metric("Total Stocks", total)
col2.metric("BUY Signals", buy_count)
col3.metric("Avg Change %", f"{avg_change:.2f}%")

st.dataframe(df.sort_values(by="change", ascending=False))

import plotly.express as px
import yfinance as yf

ticker = st.selectbox("Select Stock", df["ticker"])

if ticker:
    hist = yf.download(ticker, period="6mo")

    fig = px.line(
        hist,
        x=hist.index,
        y="Close",
        title=f"{ticker} Price Trend"
    )

    st.plotly_chart(fig, use_container_width=True)


st.set_page_config(layout="wide")

# Custom CSS for centered container
st.markdown("""
<style>
/* Main block container */
.block-container {
    max-width: 1100px;
    margin-left: auto;
    margin-right: auto;
    padding-top: 2rem;
}

/* Optional: subtle card style */
.card {
    background-color: white;
    padding: 16px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
</style>
""", unsafe_allow_html=True)

def highlight_signal(val):
    if val == "BUY":
        return "color: green; font-weight: bold"
    elif val == "SELL":
        return "color: red; font-weight: bold"
    return ""

st.dataframe(df.style.applymap(highlight_signal, subset=["signal"]))


st.subheader("🚀 Top Movers")

top = df.sort_values(by="change", ascending=False).head(5)

for _, row in top.iterrows():
    st.write(f"{row['ticker']} → {row['change']:.2f}% ({row['signal']})")