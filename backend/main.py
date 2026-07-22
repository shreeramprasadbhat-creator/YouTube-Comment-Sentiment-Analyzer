from youtube_service import get_comments
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Welcome to YouTube Comment Sentiment Analyzer API"}

@app.get("/comments/{video_id}")
def get_video_comments(video_id: str):
    response = get_comments(video_id)
    return response