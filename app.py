import os
import google.generativeai as genai
from googleapiclient.discovery import build
from flask import Flask, request, jsonify, render_template
from flask import redirect, url_for
from dotenv import load_dotenv
import json
import re

load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GOOGLE_SEARCH_API_KEY = os.getenv("GOOGLE_SEARCH_API_KEY")
GOOGLE_SEARCH_ENGINE_ID = os.getenv("GOOGLE_SEARCH_ENGINE_ID")

if not all([YOUTUBE_API_KEY, GEMINI_API_KEY, GOOGLE_SEARCH_API_KEY, GOOGLE_SEARCH_ENGINE_ID]):
    raise ValueError("One or more API keys are not set in the environment variables.")

youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)
customsearch = build("customsearch", "v1", developerKey=GOOGLE_SEARCH_API_KEY)
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

app = Flask(__name__)

language_name_map = {
    "en": "English", "es": "Spanish", "hi": "Hindi",
    "fr": "French", "de": "German",
}

@app.route("/")
def index():
    query = request.args.get("search")
    results = None
    return render_template("index.html", query=query, results=results)

@app.route('/recommendations')
def recommendations():
    return render_template('recommendations.html')

@app.route('/profile')
def profile():
    # Passing empty lists as the database functionality has been removed.
    return render_template(
        'profile.html',
        saved_articles=[],
        saved_videos=[],
        search_history=[]
    )


@app.route('/api/search', methods=['POST', 'GET'])
def search():
    try:
        if request.method == "POST":
            data = request.get_json()
            topic = data.get('topic')
            lang_code = data.get('language', 'en')
        else:  # GET
            topic = request.args.get("q")
            lang_code = request.args.get("lang", "en")

        if not topic:
            return jsonify({"error": "Topic is required"}), 400

        full_language_name = language_name_map.get(lang_code, "English")

        short_prompt = (f'Provide a concise, 2-3 sentence summary for the topic: "{topic}". The explanation MUST be in {full_language_name}.')
        short_explanation_res = model.generate_content(short_prompt)
        short_explanation = short_explanation_res.text

        long_prompt = (f'Provide a long, polished explanation for the topic: "{topic}". Act as a professional. The explanation MUST be in {full_language_name}. Format it into multiple paragraphs separated by a blank line.')
        long_explanation_res = model.generate_content(long_prompt)
        long_explanation = long_explanation_res.text
        
        key_concepts = []
        if long_explanation:
            key_concepts_prompt = (
                f'From the following text, extract the 5 most important keywords or concepts. For each concept, provide a one-sentence definition. '
                f'Return the result as a valid JSON object with a single key "concepts" which is an array of objects, where each object has "term" and "definition" keys. '
                f'The entire response must be only the JSON object, with no other text or formatting. Text: "{long_explanation}"'
            )
            key_concepts_res = model.generate_content(key_concepts_prompt)
            
            try:
                json_text_match = re.search(r'```json\s*([\s\S]*?)\s*```', key_concepts_res.text)
                if json_text_match:
                    cleaned_json = json.loads(json_text_match.group(1))
                    if 'concepts' in cleaned_json:
                        key_concepts = cleaned_json['concepts']
            except (json.JSONDecodeError, AttributeError) as e:
                print(f"Error parsing key concepts JSON: {e}")
                key_concepts = []

        search_res = customsearch.cse().list(cx=GOOGLE_SEARCH_ENGINE_ID, q=topic, num=10, lr=f"lang_{lang_code}").execute()
        articles = [{"title": item.get("title"), "link": item.get("link"), "snippet": item.get("snippet")} for item in search_res.get("items", [])]

        youtube_res = youtube.search().list(part="snippet", q=topic, type="video", maxResults=10, relevanceLanguage=lang_code).execute()
        youtube_videos = [{"id": item["id"]["videoId"], "title": item["snippet"]["title"], "thumbnail": item["snippet"]["thumbnails"]["high"]["url"]} for item in youtube_res.get("items", [])]

        return jsonify({
            "message": "Success",
            "aiExplanationShort": short_explanation,
            "aiExplanationLong": long_explanation,
            "keyConcepts": key_concepts,
            "youtubeVideos": youtube_videos,
            "articles": articles,
        })

    except Exception as e:
        print(f"API Route Error: {e}")
        return jsonify({"error": "Failed to fetch data from APIs"}), 500


@app.route("/articles/<int:article_id>")
def show_article(article_id):
    # Later you can fetch from DB. For now, just dummy.
    dummy_articles = {
        1: {"title": "Intro to AI", "content": "This is an article about AI basics."},
        2: {"title": "Deep Learning Advances", "content": "Exploring the latest deep learning breakthroughs."}
    }
    article = dummy_articles.get(article_id)
    if not article:
        return "Article not found", 404
    return render_template("article.html", article=article)


@app.route("/videos/<int:video_id>")
def show_video(video_id):
    # Dummy videos
    dummy_videos = {
        5: {"title": "Neural Networks Explained", "url": "https://www.youtube.com/embed/dQw4w9WgXcQ"}
    }
    video = dummy_videos.get(video_id)
    if not video:
        return "Video not found", 404
    return render_template("video.html", video=video)

if __name__ == '__main__':
    app.run(debug=True, port=5001)