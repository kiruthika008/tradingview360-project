import requests

"""API_KEY = "DFH73KHBFQ103CED"

def get_price(symbol):
url = f"https://www.alphavantage.co/query"

params = {
"function": "TIME_SERIES_DAILY",
"symbol": symbol,
"apikey": API_KEY
}

res = requests.get(url, params=params).json()

data = res.get("Time Series (Daily)", {})

if not data:
return None

return data
for k,v in get_price('AAPL').items():
print(k,v)"""


import requests

API_KEY = "d7ht4s9r01qu8vfmhv1gd7ht4s9r01qu8vfmhv20"

url = "https://finnhub.io/api/v1/quote"
params = {
    "symbol": "AAPL",
    "token": API_KEY
}

res = requests.get(url, params=params)
data = res.json()

print(data)