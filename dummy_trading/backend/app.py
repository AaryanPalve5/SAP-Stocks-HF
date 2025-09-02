from flask import Flask, jsonify
import yfinance as yf
from flask_cors import CORS
from sentiment_analysis import SentimentAnalysis
from newsapi import NewsApiClient
import os

app = Flask(__name__)
CORS(app)

# Fetch news & sentiment for only 5 stocks to prevent rate limits
TOP_5_US_STOCKS = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"]

newsapi = NewsApiClient(api_key=os.getenv("NEWS_API_KEY"))
sentiment_model = SentimentAnalysis([])

@app.route("/stocks", methods=["GET"])
def get_stocks():
    stocks_data = []
    news_texts = {}

    for symbol in TOP_5_US_STOCKS:  # Only fetch data for 5 tickers
        stock = yf.Ticker(symbol)
        stock_info = stock.history(period="1d")

        if not stock_info.empty:
            last_close_price = stock_info["Close"].iloc[-1]

            # Fetch news for sentiment analysis (Handle API failures)
            try:
                articles = newsapi.get_everything(q=symbol, language="en", sort_by="publishedAt", page_size=1)
                news_texts[symbol] = [
                    f"{article['title']} {article.get('description', '')}"
                    for article in articles.get("articles", [])
                ]
            except Exception as e:
                print(f"NewsAPI Error for {symbol}: {e}")  # Log error
                news_texts[symbol] = []  # No news available

            stocks_data.append({
                "symbol": symbol,
                "name": stock.info.get("longName", symbol),
                "price": last_close_price
            })

    # Perform Sentiment Analysis (5 stocks max)
    sentiment_results = {}
    for symbol, texts in news_texts.items():
        print(f"News for {symbol}: {texts}")
        if texts:
            sentiment_model.text = texts
            sentiment_result = sentiment_model.sentiment_analysis()
            sentiment_results[symbol] = sentiment_result[0]['label'] if sentiment_result else "loda"
        else:
            sentiment_results[symbol] = "loda"

    # Merge sentiment into stock data
    for stock in stocks_data:
        stock["sentiment"] = sentiment_results.get(stock["symbol"], "loda")

    return jsonify(stocks_data)

if __name__ == "__main__":
    app.run(debug=True)
