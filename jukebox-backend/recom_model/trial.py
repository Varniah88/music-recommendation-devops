from recom_by_songs import MusicRecommender
from pymongo import MongoClient
from datetime import timedelta

uri = "mongodb+srv://dhanushsoma17:dhanushsoma17@jukeboxdb.v158hmf.mongodb.net/"
client = MongoClient(uri)
db = client['JUKEBOXDB']
songs_collection = db['songs']
playlists_collection = db['playlists']

def format_duration(ms):
    minutes = ms // 60000
    seconds = (ms % 60000) // 1000
    return f"{minutes}:{str(seconds).zfill(2)}"


recommender = MusicRecommender('jukebox-backend/recom_model/filtered_data.csv')
cluster_data = recommender.get_cluster_means_and_closest()

# for cluster_id, data in cluster_data.items():
#     print(f"\nCluster {cluster_id} Mean (truncated): {data['mean'][:5]} ...")  # First 5 features for brevity
#     print("Closest Songs:")
#     for song in data['closest_songs']:
#         print(f"{song['track_id']}  - {song['track_name']} by {song['artists']} ({song['track_genre']})")

for cluster_id, data in cluster_data.items():
    track_ids = [song['track_id'] for song in data['closest_songs']]
    print(f"\nCluster {cluster_id} Track IDs:\n", track_ids)

    try:
        songs_cursor = songs_collection.find(
            {"songId": {"$in": track_ids}},
            {"release_date": 0, "added_at": 0}  # exclude bad datetime fields
        )
    except Exception as e:
        print(f"Error fetching songs for Cluster {cluster_id}: {e}")
        continue

    playlist_songs = []
    for song in songs_cursor:
        try:
            playlist_songs.append({
                "track_id": song.get("track_id") or song.get("songId"),  # fallback
                "title": song.get("name", "Unknown Title"),
                "artist": ", ".join([a['name'] for a in song.get("artists", [])]),
                "album": song.get("album", {}).get("name", "Unknown Album"),
                "duration": format_duration(song.get("duration_ms", 0)),
                "image": song.get("album", {}).get("images", [{}])[0].get("url", ""),
            })
        except Exception as song_error:
            print(f"Skipping song due to error: {song_error}")
            continue

    playlist_doc = {
        "playlist_name": f"Cluster Playlist {cluster_id}",
        "songs": playlist_songs
    }

    print(f"Playlist Document for Cluster {cluster_id}:\n", playlist_doc)
    # playlists_collection.insert_one(playlist_doc)