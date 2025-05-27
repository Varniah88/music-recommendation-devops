import pandas as pd
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler

class PlaylistRecommender:
    def __init__(self, data_path):
        self.df = pd.read_csv(data_path)
        # Define feature columns (audio features + genre encoding)
        self.feature_cols = ['danceability', 'energy', 'loudness', 'speechiness',
                             'acousticness', 'instrumentalness', 'liveness', 'valence', 'tempo']
        
        # One-hot encode genres
        self.genre_encoded = pd.get_dummies(self.df['track_genre'])
        
        # Combine audio features + genre encodings
        self.features = pd.concat([self.df[self.feature_cols], self.genre_encoded], axis=1)
        
        # Scale features
        self.scaler = StandardScaler()
        self.scaled_features = self.scaler.fit_transform(self.features)
        
        # Song index mapping
        self.song_to_index = {row['track_name']: idx for idx, row in self.df.iterrows()}
        
        # Train NearestNeighbors model
        self.knn = NearestNeighbors(n_neighbors=50, metric='euclidean')
        self.knn.fit(self.scaled_features)

    def recommend(self, input_songs, top_n=5):
        # Validate input songs
        indices = []
        for song in input_songs:
            if song in self.song_to_index:
                indices.append(self.song_to_index[song])
            else:
                return None, f"Song '{song}' not found in dataset."

        # Dictionary to store recommendations with weighted scores
        recommendations_dict = {}

        # For each input song, find neighbors and accumulate weights
        for idx in indices:
            distances, neighbors = self.knn.kneighbors([self.scaled_features[idx]])

            for i, neighbor_idx in enumerate(neighbors[0]):
                if neighbor_idx == idx:
                    continue  # Skip the input song itself

                weight = 1 / (distances[0][i] + 1e-5)  # Avoid division by zero

                song_name = self.df.iloc[neighbor_idx]['track_name']
                song_genre = self.df.iloc[neighbor_idx]['track_genre']
                song_artists = self.df.iloc[neighbor_idx]['artists']

                if song_name not in recommendations_dict:
                    recommendations_dict[song_name] = {'weight': 0, 'genre': song_genre, 'artists': song_artists}

                recommendations_dict[song_name]['weight'] += weight

        # Sort recommendations by weight
        sorted_recommendations = sorted(recommendations_dict.items(), key=lambda x: x[1]['weight'], reverse=True)

        # Select top N recommendations
        top_recommendations = sorted_recommendations[:top_n]

        # Format output
        recommendations = [{
            'track_name': rec[0],
            'artists': rec[1]['artists'],
            'track_genre': rec[1]['genre'],
            'weight': rec[1]['weight']
        } for rec in top_recommendations]

        return recommendations, None
