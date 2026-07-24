from textblob import TextBlob


def analyze_sentiment(text):
    polarity = TextBlob(text).sentiment.polarity

    if polarity > 0.1:
        sentiment = "Positive"
    elif polarity < -0.1:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"

    confidence = round(min(abs(polarity) * 100, 100), 2)

    return {
        "label": sentiment,
        "confidence": confidence
    }