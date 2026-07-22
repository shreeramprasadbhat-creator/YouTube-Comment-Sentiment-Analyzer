from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Welcome to YouTube Comment Sentiment Analyzer API"}