import csv
import os
import queue
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import random
import time
import json
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
# from langchain_google_genai import GoogleGenerativeAI

csv.field_size_limit(10 * 1024 * 1024)
load_dotenv()

# GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


class NewsScrapper:
    def __init__(self, site, ticker) -> None:
        self.site = site
        self.ticker = ticker
        self.url = self.site + self.ticker
        self.queue = queue.Queue(maxsize=3)

        options = Options()
        # options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--enable-unsafe-swiftshader")

        self.driver = webdriver.Chrome(options=options)

    def scrape_links(self) -> None:
        self.driver.get(self.url)
        print("Got the website")
        soup = BeautifulSoup(self.driver.page_source, "html.parser")
        print("Finding links")
        links = soup.find_all("a", class_="tab-link-news", limit=5)

        for link in links:
            self.queue.put(link.get("href"))
        print("Scraped Links: ", self.queue)

    def scrape_website(self, url):
        print("Connecting to Scraping Browser...")
        print("Scraping for: ", url)
        self.driver.get(url)
        return self.driver.page_source

    def extract_body_content(self, html_content):
        soup = BeautifulSoup(html_content, "html.parser")
        body_content = soup.find_all("p")
        if body_content:
            return "".join(p.get_text() for p in body_content)
        return ""

    def clean_body_content(self, body_content):
        soup = BeautifulSoup(body_content, "html.parser")

        for script_or_style in soup(["script", "style"]):
            script_or_style.extract()

        cleaned_content = soup.get_text(separator="\n")
        cleaned_content = " ".join(
            line.strip() for line in cleaned_content.splitlines() if line.strip()
        )

        return cleaned_content

    def split_dom_content(self, dom_content, max_length=6000):
        return [
            dom_content[i : i + max_length]
            for i in range(0, len(dom_content), max_length)
        ]

    def parse_with_model(self, dom_chunks):
        template = (
            "Please follow these instructions carefully: \n\n"
            "Here is a text passage containing important information. Please analyze it, identify the main ideas, and summarize key details in a clear, organized format. Use bullet points for clarity and include any notable entities, dates, numbers, or themes mentioned. Finally, provide a brief explanation of the overall purpose or intent of the text.:{dom_content}"
        )

        print("Using Ollama for parsing...")

        # model = GoogleGenerativeAI(model="gemini-1.5-flash", api_key=GEMINI_API_KEY)
        model = OllamaLLM(model="llama3.2:3b")
        prompt = ChatPromptTemplate.from_template(template)
        chain = prompt | model

        parsed_results = []

        response = chain.invoke({"dom_content": dom_chunks})
        print("Parsed")
        parsed_results.append(response)

        return " ".join(parsed_results)

    def run_scrapper(self):
        results = []

        self.scrape_links()

        with open("scraped_text.csv", "w", encoding="utf-8") as file:
            writer = csv.writer(file, delimiter="|")
            writer.writerow(["link", "content"])
            while not self.queue.empty():
                link = self.queue.get()
                dom_content = self.scrape_website(link)
                body_content = self.extract_body_content(dom_content)
                cleaned_content = self.clean_body_content(body_content)
                split_dom_content = self.split_dom_content(cleaned_content)
                writer.writerow([link, split_dom_content])
                time.sleep(random.uniform(1, 2))

        self.driver.close()

        with open("scraped_text.csv", "r", encoding="utf-8") as file:
            reader = csv.DictReader(file, delimiter="|")
            for row in reader:
                parsed_result = self.parse_with_model(
                    row["content"],
                )
                results.append({"link": row["link"], "parsed_result": parsed_result})

        with open(
            r"backend\data\scraped_results.json", "w", encoding="utf-8"
        ) as json_file:
            json.dump(results, json_file, indent=4)

        return results


if __name__ == "__main__":
    n = NewsScrapper("https://finviz.com/quote.ashx?t=", "TSLA")
    n.run_scrapper()
