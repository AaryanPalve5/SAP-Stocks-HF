from urllib.request import urlopen, Request
from bs4 import BeautifulSoup
import os
import schedule
import time

finviz_url = 'https://finviz.com/quote.ashx?t='
tickers = ['AMZN', 'GOOG', 'DRUG', 'AAPL']
output_directory = "news"
data_retention_minutes = 2  

if not os.path.exists(output_directory):
    os.makedirs(output_directory)


def scrape_stock_news():
    """
    Scrapes stock news from Finviz for the given tickers and saves it to text files.
    """
    print("Starting news scraping...")

    for ticker in tickers:
        url = finviz_url + ticker

        req = Request(url=url, headers={'user-agent': 'my-app'})
        response = urlopen(req)

        html = BeautifulSoup(response, features='html.parser')
        news_table = html.find(id='news-table')

        file_path = f"{output_directory}/{ticker}_news.txt"

        if news_table:
            with open(file_path, 'a') as file: 
                for row in news_table.findAll('tr'):
                    title = row.a.text
                    date_data = row.td.text.split(' ')

                    if len(date_data) == 1:
                        time = date_data[0]
                        date = None  
                    else:
                        date = date_data[0]
                        time = date_data[1]

                    news_entry = f"Date: {date}, Time: {time}, Headline: {title}\n"

                    if news_entry not in open(file_path).read():
                        file.write(news_entry)

    print("News data scraped and saved.")


def remove_old_files():
    """
    Periodically removes text files after a certain interval, independent of their modification or creation time.
    """
    print(f"Deleting all files in the '{output_directory}' folder...")

    for ticker in tickers:
        file_path = f"{output_directory}/{ticker}_news.txt"

        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"Deleted: {file_path}")
        else:
            print(f"File {file_path} does not exist.")

    print("Old files cleaned up.")


def run_periodic_scraping():
    """
    Schedule the scraping and cleanup jobs to run at regular intervals.
    """
    schedule.every(1).minutes.do(scrape_stock_news)

    schedule.every(2).minutes.do(remove_old_files)

    while True:
        schedule.run_pending()
        time.sleep(1)  


if __name__ == "__main__":
    scrape_stock_news()

    run_periodic_scraping()
