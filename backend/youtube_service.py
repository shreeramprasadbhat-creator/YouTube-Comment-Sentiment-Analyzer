from googleapiclient.discovery import build
from config import YOUTUBE_API_KEY
from sentiment import analyze_sentiment

youtube = build(
    "youtube",
    "v3",
    developerKey=YOUTUBE_API_KEY
)


def get_comments(video_id):

    comments = []

    positive = 0
    neutral = 0
    negative = 0

    positive_comments = []
    neutral_comments = []
    negative_comments = []

    request = youtube.commentThreads().list(
        part="snippet",
        videoId=video_id,
        maxResults=100,
        textFormat="plainText"
    )

    while True:

        response = request.execute()

        for item in response["items"]:

            comment = item["snippet"]["topLevelComment"]["snippet"]["textDisplay"]

            sentiment = analyze_sentiment(comment)

            label = sentiment["label"]
            confidence = sentiment["confidence"]

            # Normalize labels
            if "positive" in label.lower():
                label = "Positive"
            elif "negative" in label.lower():
                label = "Negative"
            else:
                label = "Neutral"

            comments.append({
                "text": comment,
                "label": label,
                "confidence": confidence
            })

            if label == "Positive":
                positive += 1
                if len(positive_comments) < 3:
                    positive_comments.append(comment)

            elif label == "Negative":
                negative += 1
                if len(negative_comments) < 3:
                    negative_comments.append(comment)

            else:
                neutral += 1
                if len(neutral_comments) < 3:
                    neutral_comments.append(comment)

        
        next_page_token = response.get("nextPageToken")
        

        if not next_page_token:
            break

        request = youtube.commentThreads().list(
            part="snippet",
            videoId=video_id,
            maxResults=100,
            textFormat="plainText",
            pageToken=next_page_token
        )

    return {
        "total_comments": len(comments),
        "positive": positive,
        "neutral": neutral,
        "negative": negative,
        "positive_comments": positive_comments,
        "neutral_comments": neutral_comments,
        "negative_comments": negative_comments,
        "comments": comments
    }