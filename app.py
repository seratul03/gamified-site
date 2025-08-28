import os
import json
import re
import uuid
import google.generativeai as genai
from googleapiclient.discovery import build
from flask import Flask, request, jsonify, render_template, url_for
from dotenv import load_dotenv

# --- Initialization ---
load_dotenv()
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'a-fallback-secret-key')

# --- API Keys & Clients ---
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GOOGLE_SEARCH_API_KEY = os.getenv("GOOGLE_SEARCH_API_KEY")
GOOGLE_SEARCH_ENGINE_ID = os.getenv("GOOGLE_SEARCH_ENGINE_ID")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

# --- In-memory Stores ---
saved_articles = []
saved_videos = []
app.QUIZ_STORE = {}

# --- API Client Setup ---
youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)
customsearch = build("customsearch", "v1", developerKey=GOOGLE_SEARCH_API_KEY)
genai.configure(api_key=GEMINI_API_KEY)
search_model = genai.GenerativeModel('gemini-1.5-flash')
quiz_model = genai.GenerativeModel(GEMINI_MODEL)


# ======================================================
# ========= ROUTES FOR GAMIFIED LEARNING SITE ==========
# ======================================================

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
    return render_template(
        'profile.html',
        saved_articles=saved_articles,
        saved_videos=saved_videos
    )

@app.route('/api/search', methods=['POST', 'GET'])
def search():
    try:
        if request.method == "POST":
            data = request.get_json()
            topic = data.get('topic')
            lang_code = data.get('language', 'en')
        else:
            topic = request.args.get("q")
            lang_code = request.args.get("lang", "en")

        if not topic:
            return jsonify({"error": "Topic is required"}), 400

        full_language_name = language_name_map.get(lang_code, "English")

        short_prompt = (f'Provide a concise, 2-3 sentence summary for the topic: "{topic}". The explanation MUST be in {full_language_name}.')
        short_explanation_res = search_model.generate_content(short_prompt)
        short_explanation = short_explanation_res.text

        long_prompt = (f'Provide a long, polished explanation for the topic: "{topic}". Act as a professional. The explanation MUST be in {full_language_name}. Format it into multiple paragraphs separated by a blank line.')
        long_explanation_res = search_model.generate_content(long_prompt)
        long_explanation = long_explanation_res.text
        
        key_concepts_prompt = (
            f'From the following text, extract the 5 most important keywords or concepts. For each concept, provide a one-sentence definition. '
            f'Return the result as a valid JSON object with a single key "concepts" which is an array of objects, where each object has "term" and "definition" keys. '
            f'The entire response must be only the JSON object, with no other text or formatting. Text: "{long_explanation}"'
        )
        key_concepts_res = search_model.generate_content(key_concepts_prompt)
        
        key_concepts = []
        try:
            json_text_match = re.search(r'```json\s*([\s\S]*?)\s*```', key_concepts_res.text)
            if json_text_match:
                cleaned_json = json.loads(json_text_match.group(1))
                if 'concepts' in cleaned_json:
                    key_concepts = cleaned_json['concepts']
        except (json.JSONDecodeError, AttributeError) as e:
            print(f"Error parsing key concepts JSON: {e}")

        search_res = customsearch.cse().list(cx=GOOGLE_SEARCH_ENGINE_ID, q=topic, num=10, lr=f"lang_{lang_code}").execute()
        articles = [{"title": item.get("title"), "link": item.get("link"), "snippet": item.get("snippet")} for item in search_res.get("items", [])]

        youtube_res = youtube.search().list(part="snippet", q=topic, type="video", maxResults=10, relevanceLanguage=lang_code).execute()
        youtube_videos = [{"id": item["id"]["videoId"], "title": item["snippet"]["title"], "thumbnail": item["snippet"]["thumbnails"]["high"]["url"]} for item in youtube_res.get("items", [])]

        return jsonify({
            "message": "Success", "aiExplanationShort": short_explanation, "aiExplanationLong": long_explanation,
            "keyConcepts": key_concepts, "youtubeVideos": youtube_videos, "articles": articles,
        })
    except Exception as e:
        print(f"API Route Error: {e}")
        return jsonify({"error": "Failed to fetch data from APIs"}), 500

@app.route('/api/save/article', methods=['POST'])
def save_article():
    data = request.json
    if not all(k in data for k in ['title', 'link', 'snippet']):
        return jsonify({"error": "Missing data"}), 400
    if not any(a['link'] == data['link'] for a in saved_articles):
        saved_articles.append(data)
    return jsonify({"message": "Article saved!"})

@app.route('/api/save/video', methods=['POST'])
def save_video():
    data = request.json
    if not all(k in data for k in ['id', 'title', 'thumbnail']):
        return jsonify({"error": "Missing data"}), 400
    if not any(v['id'] == data['id'] for v in saved_videos):
        saved_videos.append(data)
    return jsonify({"message": "Video saved!"})

@app.route("/videos/<string:video_id>")
def show_video(video_id):
    video_url = f"https://www.youtube.com/embed/{video_id}"
    video = {"title": "Video", "url": video_url}
    return render_template("video.html", video=video)


# ======================================================
# ================= ROUTES FOR QUIZ SITE ===============
# ======================================================

@app.route('/quiz')
def quiz_page():
    return render_template('quiz.html')

@app.route('/generate_quiz', methods=['POST'])
def generate_quiz():
    data = request.get_json() or {}
    topic = data.get('topic', '').strip()
    num_questions = int(data.get('num_questions', 5))

    if not topic:
        return jsonify({'error': 'Topic is required.'}), 400

    prompt = f"""
    Generate {num_questions} multiple-choice questions about the topic: "{topic}".
    Return output strictly as JSON in this format:
    {{
      "quiz": [
        {{
          "id": 1,
          "question": "...",
          "options": ["A option text","B option text","C option text","D option text"],
          "answer": "A option text"
        }}
      ]
    }}
    """
    try:
        response = quiz_model.generate_content(prompt)
        json_text_match = re.search(r'```json\s*([\s\S]*?)\s*```', response.text)
        json_text = json_text_match.group(1) if json_text_match else response.text
        quiz_obj = json.loads(json_text)

        client_quiz = []
        server_answer_key = {}
        for item in quiz_obj.get('quiz', []):
            q = {'id': item['id'], 'question': item['question'], 'options': item['options']}
            client_quiz.append(q)
            server_answer_key[str(item['id'])] = item['answer']

        quiz_token = str(uuid.uuid4())
        app.QUIZ_STORE[quiz_token] = server_answer_key

        return jsonify({'quiz_token': quiz_token, 'quiz': client_quiz})
    except Exception as e:
        return jsonify({'error': 'Failed to generate quiz: ' + str(e)}), 500


@app.route('/grade_quiz', methods=['POST'])
def grade_quiz():
    data = request.get_json() or {}
    quiz_token = data.get('quiz_token')
    answers = data.get('answers', {})

    if not quiz_token or not answers:
        return jsonify({'error': 'quiz_token and answers are required.'}), 400

    key = app.QUIZ_STORE.get(quiz_token)
    if not key:
        return jsonify({'error': 'Invalid or expired quiz token.'}), 400

    total, correct = len(key), 0
    details = []
    for qid, correct_ans in key.items():
        is_correct = (answers.get(qid) == correct_ans)
        if is_correct:
            correct += 1
        details.append({'id': qid, 'chosen': answers.get(qid), 'correct': correct_ans, 'is_correct': is_correct})

    score = int((correct / total) * 100) if total > 0 else 0
    remark = 'Excellent!' if score >= 80 else 'Good job — keep practicing.' if score >= 50 else 'Needs improvement — try again.'
    
    app.QUIZ_STORE.pop(quiz_token, None) # Remove used quiz key

    return jsonify({'score': score, 'correct': correct, 'total': total, 'details': details, 'remark': remark})


# ======================================================
# =================== RUN APPLICATION ==================
# ======================================================

if __name__ == '__main__':
    app.run(debug=True, port=5001)