from flask import Flask, request, render_template
from recom_by_songs import MusicRecommender
from recom_by_playlist import PlaylistRecommender  # Different logic, same dataset
from flask import jsonify
from flask_cors import CORS
from pymongo import MongoClient
import re

app = Flask(__name__)
CORS(app)
# Initialize recommenders with SAME dataset
song_recommender = MusicRecommender('jukebox-backend/recom_model/filtered_data.csv')
playlist_recommender = PlaylistRecommender('jukebox-backend/recom_model/filtered_data.csv')

client = MongoClient("mongodb+srv://dhanushsoma17:dhanushsoma17@jukeboxdb.v158hmf.mongodb.net/")
db = client['JUKEBOXDB']
collection = db['songs']

def clean_song(song):
    if 'artists' in song:
        for artist in song['artists']:
            artist.pop('_id', None)
    if 'album' in song:
        album = song['album']
        album.pop('_id', None)
        if 'images' in album and album['images']:
            album['images'][0].pop('_id', None)  # only remove from first image
    return song

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        model_type = request.form.get('model_type')
        songs = [request.form.get(f'song{i}') for i in range(1, 4)]
        songs = [s for s in songs if s]

        # Validate and call appropriate recommender
        if model_type == 'song':
            recommendations, error = song_recommender.recommend(songs)
        elif model_type == 'playlist':
            recommendations, error = playlist_recommender.recommend(songs)
        else:
            recommendations, error = None, "Invalid model type selected."

        # Render page with recommendations or error
        return render_template('index.html', recommendations=recommendations, error=error)

    # For GET request
    return render_template('index.html')

@app.route('/api/recommend', methods=['POST'])
def api_recommend():
    data = request.get_json()
    songs = data.get('songs', [])
    model_type = data.get('model_type', 'song')

    if not songs:
        return jsonify({'error': 'No songs provided'}), 400

    if model_type == 'song':
        recommendations, error = song_recommender.recommend(songs)
    elif model_type == 'playlist':
        recommendations, error = playlist_recommender.recommend(songs)
    else:
        return jsonify({'error': 'Invalid model type'}), 400

    if error:
        return jsonify({'error': error}), 500

    return jsonify({'recommendations': recommendations}), 200

@app.route('/api/song_details', methods=['POST'])
def get_song_details():
    data = request.get_json()
    track_ids = data.get('track_ids', [])

    if not track_ids:
        return jsonify({'error': 'No track_ids provided'}), 400

    # Query for those track_ids (songId in your doc)
    songs = collection.find({'songId': {'$in': track_ids}})

    results = []
    for song in songs:
        results.append({
            'track_id': song.get('songId', 'Unknown'),
            'title': song.get('name', 'Unknown'),
            'artist': ', '.join(artist['name'] for artist in song.get('artists', [])),
            'album': song.get('album', {}).get('name', 'Unknown'),
            'duration': f"{song['duration_ms'] // 60000}:{str((song['duration_ms'] % 60000) // 1000).zfill(2)}" if 'duration_ms' in song else '3:30',
            'image': song.get('album', {}).get('images', [{}])[0].get('url', '')  # largest image
        })
    print("Results:", results)
    return jsonify(results)

@app.route('/api/search_songs')
def search_songs():
    query = request.args.get('q', '')
    if not query:
        return jsonify([])

    regex = re.compile(f"^{re.escape(query)}", re.IGNORECASE)
    matches = collection.find(
    {"$or": [{"name": regex}, {"artists.name": regex}]},
    {"_id": 0, "name": 1, "artists.name": 1, "album.name": 1, "album.images": {"$slice": 1}, "duration_ms": 1, 'songId': 1}
    ).sort("popularity", -1
    ).limit(10)
    
    results = [clean_song(song) for song in matches]

    return jsonify(results)
    
if __name__ == '__main__':
    app.run(debug=True)
