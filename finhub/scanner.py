# scanner.py
import yfinance as yf
import pandas as pd
from tsx_list import get_tsx_tickers
from indicators import add_indicators
from strategy import generate_signal
import requests
import pandas as pd
import time
def scan_market(API_KEY):
    #tickers = ["AAPL", "MSFT", "GOOGL"]   # ⚠️ keep small (API limit)
    tickers= [
        "AAPL", "MSFT", "GOOGL"
    ]
    results = []

    for symbol in tickers:
        df = get_price_df(symbol,API_KEY)

        if df is None or len(df) < 2:
            continue

        latest = df.iloc[-1]
        prev = df.iloc[-2]

        change = ((latest["Close"] - prev["Close"]) / prev["Close"]) * 100

        # Simple signal logic (you can plug RSI later)
        signal = "BUY" if change > 2 else "HOLD"

        results.append({
            "ticker": symbol,
            "price": latest["Close"],
            "change": change,
            "signal": signal
        })

        # 🚨 REQUIRED (avoid rate limit)
        time.sleep(12)

    return results

def get_price_df(symbol,API_KEY):
    url = "https://www.alphavantage.co/query"

    params = {
        "function": "TIME_SERIES_DAILY",
        "symbol": symbol,
        "apikey": API_KEY
    }

    res = requests.get(url, params=params).json()

    # 🚨 Handle API errors / limits
    if "Time Series (Daily)" not in res:
        print(f"Error for {symbol}: {res}")
        return None

    data = res["Time Series (Daily)"]

    # Convert to DataFrame
    df = pd.DataFrame.from_dict(data, orient="index")
    df = df.astype(float)
    df.index = pd.to_datetime(df.index)
    df = df.sort_index()

    df.rename(columns={
        "1. open": "Open",
        "2. high": "High",
        "3. low": "Low",
        "4. close": "Close",
        "5. volume": "Volume"
    }, inplace=True)

    return df