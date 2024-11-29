from transformers import pipeline, AutoTokenizer
import torch
from typing import List, Dict, Any


def create_tokenizer() -> AutoTokenizer:
    return AutoTokenizer.from_pretrained(
        "mrm8488/distilroberta-finetuned-financial-news-sentiment-analysis"
    )


def create_pipeline() -> pipeline:
    device = 0 if torch.cuda.is_available() else -1
    return pipeline(
        "text-classification",
        model="mrm8488/distilroberta-finetuned-financial-news-sentiment-analysis",
        device=device,
    )


def split_into_chunks(
    text: str, tokenizer: AutoTokenizer, max_length: int = 512
) -> List[str]:
    inputs = tokenizer(text, return_tensors="pt", truncation=True)
    input_ids = inputs["input_ids"][0]

    return [
        tokenizer.decode(input_ids[i : i + max_length], skip_special_tokens=True)
        for i in range(0, len(input_ids), max_length)
    ]


def analyze_sentiment(texts: List[str]) -> List[Dict[str, Any]]:
    """Analyze sentiment for a list of texts."""
    tokenizer = create_tokenizer()
    sentiment_pipeline = create_pipeline()
    max_token_length = tokenizer.model_max_length

    return [
        result
        for text in texts
        for chunk in split_into_chunks(text, tokenizer, max_token_length)
        for result in sentiment_pipeline(chunk)
    ]


if __name__ == "__main__":
    sample_texts = ["This stock is awesome!", "Good Morning"]
    results = analyze_sentiment(sample_texts)
    print(results)
