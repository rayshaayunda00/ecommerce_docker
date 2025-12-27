from fastapi import FastAPI, HTTPException, Form
from pydantic import BaseModel
from typing import List, Optional
from database import reviews_collection
import pymongo # Kita butuh ini untuk sorting

app = FastAPI()

# --- ROUTES ---

@app.get("/")
def read_root():
    return {"message": "Review Service is Running (FastAPI + MongoDB) 🚀"}

# 1. CREATE REVIEW (AUTO ID)
# Perhatikan: Parameter 'id' SUDAH DIHAPUS dari sini
@app.post("/reviews", status_code=201)
def create_review(
    product_id: int = Form(...),
    review: str = Form(...),
    rating: int = Form(...)
):
    # --- LOGIKA AUTO INCREMENT ID ---
    # 1. Cari 1 data terakhir berdasarkan id terbesar (sort descending -1)
    last_review = reviews_collection.find_one(sort=[("id", pymongo.DESCENDING)])
    
    # 2. Jika ada data, ambil id terakhir + 1. Jika kosong, mulai dari 1.
    new_id = (last_review["id"] + 1) if last_review else 1
    # -------------------------------

    review_dict = {
        "id": new_id,  # ID pakai yang otomatis kita buat tadi
        "product_id": product_id,
        "review": review,
        "rating": rating
    }
    
    try:
        reviews_collection.insert_one(review_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    if "_id" in review_dict:
        del review_dict["_id"]

    return {
        "success": True,
        "message": "Review created successfully",
        "data": review_dict
    }

# 2. GET ALL REVIEWS
@app.get("/reviews")
def get_reviews():
    reviews = list(reviews_collection.find({}, {"_id": 0}))
    return {
        "success": True,
        "total": len(reviews),
        "data": reviews
    }

# 3. GET REVIEWS BY PRODUCT ID
@app.get("/reviews/product/{product_id}")
def get_reviews_by_product(product_id: int):
    reviews = list(reviews_collection.find({"product_id": product_id}, {"_id": 0}))
    return {
        "success": True,
        "data": reviews
    }

# 4. GET SINGLE REVIEW BY ID
@app.get("/reviews/{review_id}")
def get_single_review(review_id: int):
    review = reviews_collection.find_one({"id": review_id}, {"_id": 0})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return {
        "success": True,
        "data": review
    }