import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA

# Load dataset
df = pd.read_csv('jukebox-backend/recom_model/filtered_data.csv')

# Features for clustering
feature_cols = ['danceability', 'energy', 'loudness', 'speechiness',
                'acousticness', 'instrumentalness', 'liveness', 'valence', 'tempo']
features = df[feature_cols]

# Optional: Encode genre (if you want to include it later)
genre_encoded = pd.get_dummies(df['track_genre'])
features = pd.concat([features, genre_encoded], axis=1)

# Normalize features
scaler = StandardScaler()
scaled_features = scaler.fit_transform(features)

# --- KMeans Model (can change n_clusters after elbow analysis) ---
k = 20
kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
df['cluster'] = kmeans.fit_predict(scaled_features)

# Map song names to index
song_to_index = {row['track_name']: idx for idx, row in df.iterrows()}

# --- Elbow Method to Find Optimal k ---
def plot_elbow_method():
    sse = []
    k_range = range(2, 51)
    for k in k_range:
        model = KMeans(n_clusters=k, random_state=42, n_init=10)
        model.fit(scaled_features)
        sse.append(model.inertia_)

    plt.figure(figsize=(8, 5))
    plt.plot(k_range, sse, marker='o')
    plt.title('Elbow Method for Optimal k')
    plt.xlabel('Number of Clusters (k)')
    plt.ylabel('SSE (Inertia)')
    plt.grid()
    plt.savefig('elbow_method.png')  # Save Elbow Method plot
    print("Elbow method plot saved as elbow_method.png")

def print_sse():
    sse = []
    k_range = range(2, 51)
    for k in k_range:
        model = KMeans(n_clusters=k, random_state=42, n_init=10)
        model.fit(scaled_features)
        sse.append(model.inertia_)
        
    for k, value in zip(k_range, sse):
        print(f'k={k}, SSE={value}')

print_sse()

# --- PCA Visualization ---
def plot_cluster_pca():
    pca = PCA(n_components=2)
    reduced = pca.fit_transform(scaled_features)

    plt.figure(figsize=(8, 6))
    plt.scatter(reduced[:, 0], reduced[:, 1], c=df['cluster'], cmap='tab10', alpha=0.7)
    plt.title('KMeans Clustering (PCA Projection)')
    plt.xlabel('PCA Component 1')
    plt.ylabel('PCA Component 2')
    plt.colorbar(label='Cluster')
    plt.grid()
    plt.savefig('kmeans_clusters.png')  # Save KMeans clustering plot
    print("KMeans clustering plot saved as kmeans_clusters.png")

# --- Recommendation Function ---
def get_recommendations(input_songs, top_n=5):
    indices = []
    for s in input_songs:
        if s in song_to_index:
            indices.append(song_to_index[s])
        else:
            return None, f"Song '{s}' not found."

    input_clusters = df.loc[indices, 'cluster']
    target_cluster = input_clusters.value_counts().idxmax()

    # Songs in target cluster excluding inputs
    cluster_songs = df[(df['cluster'] == target_cluster) & (~df.index.isin(indices))]
    recommendations = cluster_songs.sample(n=min(top_n, len(cluster_songs)))[['track_name', 'artists', 'track_genre']].to_dict(orient='records')
    return recommendations, None

# Call functions to generate and save plots
plot_elbow_method()
plot_cluster_pca()
