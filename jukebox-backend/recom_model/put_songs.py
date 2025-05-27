import pandas as pd
from pymongo import MongoClient
# Replace with your actual file path
df = pd.read_csv("jukebox-backend/recom_model/filtered_data.csv")

# Replace this with your actual connection URI
client = MongoClient("mongodb+srv://username:password@jukeboxdb.v158hmf.mongodb.net/")

# Run the connectionStatus command to get your privileges
status = client.admin.command("connectionStatus")

# Extract the roles and privileges
auth_info = status.get("authInfo", {})
authenticated_user_roles = auth_info.get("authenticatedUserRoles", [])
authenticated_user_privileges = auth_info.get("authenticatedUserPrivileges", [])

print("Roles:")
for role in authenticated_user_roles:
    print(f" - {role}")

print("\nPrivileges:")
for priv in authenticated_user_privileges:
    print(f" - {priv}")

# db.runCommand({ "connectionStatus": 1 })
db = client["JUKEBOXDB"]
collection = db["songs_dataset"]
print(collection.find_one())

# collection.delete_many({})
# # Convert DataFrame to dictionary records
# records = df.to_dict(orient="records")

# # Insert into MongoDB
# result = collection.insert_many(records)
# print(f"Inserted {len(result.inserted_ids)} documents.")