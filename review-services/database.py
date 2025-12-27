from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os
import time

# Mengambil config dari Environment Variable (Docker)
MONGO_URI = os.getenv("MONGO_URI", "mongodb://admin:admin123@review-db:27017/reviewdb?authSource=admin")

def connect_with_retry():
    retries = 5
    delay = 5
    
    while retries > 0:
        try:
            print(f"Connecting to MongoDB... (Attempts left: {retries})")
            client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
            client.admin.command('ping')
            print("✅ Connected to MongoDB successfully!")
            return client
        except ConnectionFailure as e:
            print(f"⚠️ MongoDB connection failed: {e}")
            retries -= 1
            time.sleep(delay)
            
    raise Exception("❌ Could not connect to MongoDB after several attempts")

client = connect_with_retry()

try:
    # Otomatis pilih database dari URI
    db = client.get_default_database()
except Exception:
    db = client["reviewdb"]

reviews_collection = db["reviews"]