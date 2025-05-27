from pymongo import MongoClient
import pandas as pd

# Connect to MongoDB Atlas
client = MongoClient("mongodb+srv://username:password@jukeboxdb.v158hmf.mongodb.net/")
db = client["JukeBoxDB"]  # Replace with your DB name

# Dictionary to hold DataFrames
dfs = {}

collection = db["JUKEBOXDB"]

# Fetch all documents and load into DataFrame
data = list(collection.find())  # fetch all
df = pd.DataFrame(data)

# Optional: Drop the MongoDB-generated _id field
df = df.drop(columns=["_id"], errors="ignore")

print(df.head())