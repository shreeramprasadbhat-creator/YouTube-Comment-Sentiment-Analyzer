const analyzeBtn = document.getElementById("analyzeBtn");
const status = document.getElementById("status");

const total = document.getElementById("total");
const positiveCount = document.getElementById("positiveCount");
const neutralCount = document.getElementById("neutralCount");
const negativeCount = document.getElementById("negativeCount");

const searchBox = document.getElementById("searchBox");
const searchResults = document.getElementById("searchResults");

const commentType = document.getElementById("commentType");
const showCommentsBtn = document.getElementById("showCommentsBtn");
const topCommentsList = document.getElementById("topCommentsList");

let topPositiveComments = [];
let topNeutralComments = [];
let topNegativeComments = [];

let allComments = [];
let currentFilter = "";

function normalizeLabel(label) {
    label = String(label || "").toLowerCase();

    if (label.includes("positive")) return "positive";
    if (label.includes("negative")) return "negative";
    if (label.includes("neutral")) return "neutral";

    if (label === "label_2") return "positive";
    if (label === "label_1") return "neutral";
    if (label === "label_0") return "negative";

    return "neutral";
}

function displayLabel(label) {
    switch (normalizeLabel(label)) {
        case "positive":
            return "Positive 😊";
        case "negative":
            return "Negative 😞";
        default:
            return "Neutral 😐";
    }
}

function renderComments() {

    searchResults.innerHTML = "";

    const searchText = searchBox.value.trim().toLowerCase();

    const filtered = allComments.filter(item => {

        const text = String(item.text || item.comment || "").toLowerCase();

        const label = normalizeLabel(item.label || item.sentiment);

        const searchMatch = text.includes(searchText);

       const filterMatch =
    currentFilter === "" ||
    label === currentFilter;

        return searchMatch && filterMatch;
    });

    if (filtered.length === 0) {
        searchResults.innerHTML = "<p style='text-align:center;'>No comments found.</p>";
        return;
    }

    filtered.forEach(item => {

        const text = item.text || item.comment || "";

        const label = normalizeLabel(item.label || item.sentiment);

        const confidence = Number(item.confidence || 0);

        const div = document.createElement("div");

        div.className = `comment ${label}`;

        div.innerHTML = `
            <strong>${displayLabel(label)}</strong>
            <small> (${confidence.toFixed(1)}%)</small>
            <br><br>
            <div style="white-space:pre-wrap;">${text}</div>
        `;

        searchResults.appendChild(div);
    });
}

analyzeBtn.addEventListener("click", async () => {

    try {

        status.textContent = "⏳ Analyzing comments...";

        searchResults.innerHTML = "";

        total.textContent = "0";
        positiveCount.textContent = "0";
        neutralCount.textContent = "0";
        negativeCount.textContent = "0";

        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        if (!tab || !tab.url.includes("youtube.com/watch")) {
            status.textContent = "❌ Open a YouTube video first.";
            return;
        }

        const videoId = new URL(tab.url).searchParams.get("v");

        if (!videoId) {
            status.textContent = "❌ Invalid video.";
            return;
        }

        const response = await fetch(`http://127.0.0.1:8000/comments/${videoId}`);

        if (!response.ok) {
            throw new Error("Backend Error");
        }

        const data = await response.json();

        allComments = Array.isArray(data.comments) ? data.comments : [];

        topPositiveComments = data.positive_comments || [];
        topNeutralComments = data.neutral_comments || [];
        topNegativeComments = data.negative_comments || [];
        
        total.textContent = data.total_comments || 0;
        positiveCount.textContent = data.positive || 0;
        neutralCount.textContent = data.neutral || 0;
        negativeCount.textContent = data.negative || 0;

        // Update Progress Bars
        const totalComments = data.total_comments || 1;

        document.getElementById("positiveBar").value =
        (data.positive / totalComments) * 100;

        document.getElementById("neutralBar").value =
        (data.neutral / totalComments) * 100;

        document.getElementById("negativeBar").value =
        (data.negative / totalComments) * 100;

        const positivePercentage = ((data.positive / totalComments) * 100).toFixed(1);
        const neutralPercentage = ((data.neutral / totalComments) * 100).toFixed(1);
        const negativePercentage = ((data.negative / totalComments) * 100).toFixed(1);

        document.getElementById("positivePercent").textContent = positivePercentage + "%";
        document.getElementById("neutralPercent").textContent = neutralPercentage + "%";
        document.getElementById("negativePercent").textContent = negativePercentage + "%";

// Overall Sentiment
        const overall = document.getElementById("overallSentiment");

        if (data.positive > data.neutral && data.positive > data.negative) {
            overall.textContent = "😊 Positive";
        } else if (data.negative > data.positive && data.negative > data.neutral) {
            overall.textContent = "😞 Negative";
        } else {
            overall.textContent = "😐 Neutral";
        }

      currentFilter = "";

document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.remove("active");
});

        renderComments();

        status.textContent = "✅ Analysis Complete";

    } catch (err) {

        console.error(err);

        status.textContent = "❌ " + err.message;

    }

});

searchBox.addEventListener("input", renderComments);

document.querySelectorAll(".filter-btn").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".filter-btn")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        currentFilter = button.dataset.filter;

        renderComments();

    });

});

showCommentsBtn.addEventListener("click", () => {

    topCommentsList.innerHTML = "";

    let comments = [];

    if (commentType.value === "positive") {
        comments = topPositiveComments;
    } else if (commentType.value === "neutral") {
        comments = topNeutralComments;
    } else {
        comments = topNegativeComments;
    }

    if (comments.length === 0) {
        topCommentsList.innerHTML = "<li>No comments available.</li>";
        return;
    }

    comments.forEach(comment => {
        const li = document.createElement("li");
        li.textContent = comment;
        li.style.marginBottom = "8px";
        topCommentsList.appendChild(li);
    });

});