import requests

def scan_market(API_KEY):

    tickers = [
        "RY.TO","TD.TO","BNS.TO","ENB.TO","SU.TO",
        "CNQ.TO","SHOP.TO","CP.TO","BAM.TO","TRP.TO"
    ]

    results = []

    for symbol in tickers:

        url = "https://finnhub.io/api/v1/quote"
        params = {"symbol": symbol, "token": API_KEY}

        res = requests.get(url).json()

        if not res or "c" not in res:
            continue

        price = res["c"]
        prev = res["pc"]

        change = ((price - prev) / prev) * 100

        signal = "BUY" if change > 2 else "HOLD"
        if change < -2:
            signal = "SELL"

        results.append({
            "ticker": symbol,
            "price": price,
            "change": change,
            "signal": signal
        })

    return results