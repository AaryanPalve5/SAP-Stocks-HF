import os
import logging
from langchain_chroma import Chroma
from langchain.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv

load_dotenv()


def query_rag(question: str) -> str:
    PROMPT_TEMPLATE = """
    You are an intelligent financial assistant providing real-time sentiment analysis, stock market insights, and actionable summaries.

    Context:
    - You analyze and summarize stock-related news, identifying key events, trends, and sentiment shifts.
    - You explain your responses clearly, referencing specific parts of the news context when necessary.

    Related News:
    {context}

    Based on the stock-related news context, answer the question with insights or suggestions. Where applicable, highlight market trends, risks, or opportunities.

    Question:
    {question}
    """

    try:
        news_file = "backend\\news_file.csv"
        news_context = ""

        with open(news_file, "r", encoding="utf-8") as f:
            news_context = f.read()

        db = Chroma(
            persist_directory="chroma_stock",
            embedding_function=GoogleGenerativeAIEmbeddings(
                model="models/embedding-001"
            ),
            collection_name="stock_news",
        )

        db.add_texts([news_context])

        results = db.similarity_search_with_score(question, k=len(db.get()["ids"]))

        context_text = " ".join([doc.page_content for doc, _score in results])

        prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
        prompt = prompt_template.format(context=context_text, question=question)

        model = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash", api_key=os.getenv("GOOGLE_API_KEY")
        )
        response = model.invoke(prompt)
        if hasattr(response, "content"):
            return response.content.strip()
        return str(response).strip()

    except Exception as e:
        logging.error(f"Error in query_rag: {e}")
        return "An error occurred while processing the query."


def main() -> None:
    question = (
        "What is the overall sentiment for the stock/company in the latest quarter?"
    )

    print(query_rag(question=question))


if __name__ == "__main__":
    main()
