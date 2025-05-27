import pandas as pd
from sklearn.cluster import KMeans
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import euclidean_distances

class MusicRecommender:
    def __init__(self, data_path):
        self.df = pd.read_csv(data_path)
        self.feature_cols = ['danceability', 'energy', 'loudness', 'speechiness',
                             'acousticness', 'instrumentalness', 'liveness', 'valence', 'tempo']
        
        self.genre_encoded = pd.get_dummies(self.df['track_genre'])
        self.features = self.df[self.feature_cols]
        self.features_with_genre = pd.concat([self.features, self.genre_encoded], axis=1)

        # Normalize and cluster
        self.scaler = StandardScaler()
        self.scaled_features = self.scaler.fit_transform(self.features_with_genre)

        self.kmeans = KMeans(n_clusters=23, random_state=42, n_init=10)
        self.df['cluster'] = self.kmeans.fit_predict(self.scaled_features)

        # Song index mapping
        self.song_to_index = {row['track_name']: idx for idx, row in self.df.iterrows()}

    def recommend(self, input_songs):
        indices = []
        for song in input_songs:
            if song in self.song_to_index:
                indices.append(self.song_to_index[song])
            else:
                return None, f"Song '{song}' not found."

        input_clusters = self.df.loc[indices, 'cluster']
        target_cluster = input_clusters.value_counts().idxmax()

        cluster_songs = self.df[(self.df['cluster'] == target_cluster) & (~self.df.index.isin(indices))]
        cluster_indices = cluster_songs.index

        input_vec = self.features_with_genre.loc[indices].mean().values.reshape(1, -1)
        cluster_vecs = self.features_with_genre.loc[cluster_indices]

        dists = euclidean_distances(cluster_vecs, input_vec).flatten()
        cluster_songs = cluster_songs.copy()
        cluster_songs['distance'] = dists

        top_recommendations = cluster_songs.sort_values('distance').head(5)
        print(top_recommendations)
        return top_recommendations[['track_name', 'track_id', 'artists', 'track_genre']].to_dict(orient='records'), None
    
    def get_cluster_means_and_closest(self, n_closest=10):
        cluster_info = {}

        for cluster_id in range(23):
            cluster_indices = self.df[self.df['cluster'] == cluster_id].index
            if len(cluster_indices) == 0:
                continue

            cluster_vectors = self.scaled_features[cluster_indices]
            mean_vector = cluster_vectors.mean(axis=0)
            distances = euclidean_distances(cluster_vectors, mean_vector.reshape(1, -1)).flatten()
            sorted_indices = cluster_indices[distances.argsort()[:n_closest]]

            cluster_info[cluster_id] = {
                'mean': mean_vector.tolist(),
                'closest_songs': self.df.loc[sorted_indices, ['track_name', 'track_id', 'artists', 'track_genre']].to_dict(orient='records')
            }

        return cluster_info

        # # Convert input songs to indices
        # indices = []
        # for s in input_songs:
        #     if s in self.song_to_index:
        #         indices.append(self.song_to_index[s])
        #     else:
        #         return None, f"Song '{s}' not found."
        
        # # Nearest Neighbors model
        # knn = NearestNeighbors(n_neighbors=50, metric='euclidean')  # Get 10 nearest neighbors
        # knn.fit(self.scaled_features)  # Assuming scaled_features are available from earlier
        
        # # Initialize a dictionary to hold the weighted recommendations
        # recommendations_dict = {}

        # # For each song, get its nearest neighbors and weight based on distance
        # for idx in indices:
        #     distances, neighbors = knn.kneighbors([self.scaled_features[idx]])

        #     for i, neighbor_idx in enumerate(neighbors[0]):
        #         if neighbor_idx == idx:
        #             continue  # Skip the song itself

        #         # Get the distance-based weight (inverse distance)
        #         weight = 1 / (distances[0][i] + 1e-5)  # Add small epsilon to avoid division by zero
                
        #         song_name = self.df.iloc[neighbor_idx]['track_name']
        #         song_genre = self.df.iloc[neighbor_idx]['track_genre']
        #         song_artists = self.df.iloc[neighbor_idx]['artists']
                
        #         # Add the weighted song recommendation
        #         if song_name not in recommendations_dict:
        #             recommendations_dict[song_name] = {'weight': 0, 'genre': song_genre, 'artists': song_artists}
                
        #         recommendations_dict[song_name]['weight'] += weight

        # # Sort recommendations by their total weighted score (highest first)
        # sorted_recommendations = sorted(recommendations_dict.items(), key=lambda x: x[1]['weight'], reverse=True)

        # # Select the top N recommendations
        # top_n = 5
        # top_recommendations = sorted_recommendations[:top_n]

        # # Format the output
        # recommendations = [{
        #     'track_name': rec[0],
        #     'artists': rec[1]['artists'],
        #     'track_genre': rec[1]['genre'],
        #     'weight': rec[1]['weight']
        # } for rec in top_recommendations]
        
        # return recommendations, None