from flask import Flask , jsonify
from flask_cors import CORS
import yt_dlp

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return "<h1>This page is useless</h1>"

@app.route('/home')
def home():
    return "<h1>This page is also useless. But this is home(just to check)</h1>"

@app.route('/<url>' , methods=['GET'])
def findURL(url):
    # url = "https://www.youtube.com/watch?v=WquGhpG5o1Y"
    url = "https://www.youtube.com/watch?v=" + url

    ydl_opts = { 
        'cookiefile': '/etc/secrets/cookies.txt',
        # 'cookiefile': 'cookies.txt',
        'quiet': True,
        'skip_download': True,
        # 'proxy': 'http://100.20.92.101',
        # 'http_headers': {
        #     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
        # },
    }
    
    # ydl_opts = { 'quiet': True,'skip_download': True }

    ydl = yt_dlp.YoutubeDL(ydl_opts)
    info = ydl.extract_info(url, download=False)

    progressive_formats = [
        f for f in info['formats']
        if f.get('acodec') != 'none' and f.get('vcodec') != 'none'
    ]

    best_progressive = max(progressive_formats, key=lambda x: x.get('height', 0))


    return jsonify(message=best_progressive['url'])

if __name__ == '__main__':
    app.run(host='0.0.0.0')
