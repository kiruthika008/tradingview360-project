# strategy.py
def generate_signal(df):
    latest = df.iloc[-1]

    score = 0

    # RSI
    if latest["rsi"] < 30:
        score += 1
    elif latest["rsi"] > 70:
        score -= 1

    # MACD
    if latest["macd"] > latest["macd_signal"]:
        score += 1
    else:
        score -= 1

    # Breakout
    recent_high = df["High"].rolling(20).max().iloc[-2]
    if latest["Close"] > recent_high:
        score += 2

    if score >= 2:
        return "BUY"
    elif score <= -2:
        return "SELL"
    else:
        return "HOLD"