from flask import Flask, render_template
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import time

app = Flask(__name__)

def scrape_ipo_data():
    # Configure Selenium
    chrome_options = Options()
    chrome_options.add_argument("--headless")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)

    def extract_table_data(url):
        """Extracts table data from a given URL."""
        driver.get(url)
        time.sleep(5)  # Wait for page to load

        data = []
        try:
            table = driver.find_element(By.CLASS_NAME, "table-bordered")  # Find the table
            rows = table.find_elements(By.TAG_NAME, "tr")

            # Extract headers
            headers = [header.text.strip() for header in rows[0].find_elements(By.TAG_NAME, "th")]

            # Extract table data
            for row in rows[1:]:
                columns = row.find_elements(By.TAG_NAME, "td")
                row_data = [col.text.strip() for col in columns]
                data.append(row_data)

            return headers, data
        except Exception as e:
            print(f"Error extracting table data from {url}:", e)
            return [], []

    # Scrape Current IPO GMP Data
    current_url = "https://www.investorgain.com/report/live-ipo-gmp/331/current/"
    current_headers, current_data = extract_table_data(current_url)

    # Scrape Previous IPO GMP Data
    previous_url = "https://www.investorgain.com/report/live-ipo-gmp/331/ipo/"
    previous_headers, previous_data = extract_table_data(previous_url)

    driver.quit()
    return current_headers, current_data, previous_headers, previous_data

@app.route("/")
def home():
    current_headers, current_data, previous_headers, previous_data = scrape_ipo_data()
    return render_template(
        "index.html",
        current_headers=current_headers,
        current_data=current_data,
        previous_headers=previous_headers,
        previous_data=previous_data,
    )

if __name__ == "__main__":
    app.run(debug=True)
