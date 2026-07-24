from transformers import pipeline

# Load model once
classifier = pipeline(
    "sentiment-analysis",
    model="cardiffnlp/twitter-roberta-base-sentiment-latest"
)


def analyze_sentiment(text):
    """
    Returns:
    {
        "label": "Positive",
        "confidence": 98.5
    }
    """

    result = classifier(
        text,
        truncation=True,
        max_length=512
    )[0]

    label = result["label"].lower()
    confidence = round(result["score"] * 100, 2)

    if "positive" in label:
        sentiment = "Positive"

    elif "negative" in label:
        sentiment = "Negative"

    else:
        sentiment = "Neutral"

    return {
        "label": sentiment,
        "confidence": confidence
    }