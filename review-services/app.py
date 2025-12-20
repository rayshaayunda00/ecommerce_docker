from flask import Flask, jsonify, request
from flask_cors import CORS
app = Flask(__name__)
CORS(app)  # izinkan semua origin
# Dummy data for reviews
reviews = [
    {"id": 1, "product_id": 101, "review": "Great product!", "rating": 5},
    {"id": 2, "product_id": 101, "review": "Good quality for the price", "rating": 4},
    {"id": 3, "product_id": 102, "review": "Not what I expected", "rating": 2},
    {"id": 4, "product_id": 103, "review": "Excellent! Will buy again", "rating": 5},
    {"id": 5, "product_id": 101, "review": "Fast delivery & nice packaging", "rating": 5},
    {"id": 6, "product_id": 104, "review": "Item arrived damaged", "rating": 1},
]


# ------------------------------------------
# HOME
# ------------------------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Welcome to the Review Service API!"})


# ------------------------------------------
# GET ALL REVIEWS
# ------------------------------------------
@app.route('/reviews', methods=['GET'])
def get_reviews():
    return jsonify(reviews)


# ------------------------------------------
# GET REVIEW BY ID
# ------------------------------------------
@app.route('/reviews/<int:review_id>', methods=['GET'])
def get_reviews_by_review_id(review_id):
    review = next((r for r in reviews if r["id"] == review_id), None)
    if review is None:
        return jsonify({"message": "Review not found"}), 404
    return jsonify(review)


# ------------------------------------------
# GET REVIEWS BY PRODUCT ID
# ------------------------------------------
@app.route('/reviews/product/<int:product_id>', methods=['GET'])
def get_review_product_by_id(product_id):
    filtered_reviews = [r for r in reviews if r["product_id"] == product_id]
    return jsonify(filtered_reviews)


# ------------------------------------------
# GET AVERAGE RATING PER PRODUCT
# ------------------------------------------
@app.route('/reviews/product/<int:product_id>/average', methods=['GET'])
def get_average_rating(product_id):
    product_reviews = [r for r in reviews if r["product_id"] == product_id]
    if not product_reviews:
        return jsonify({"message": "Product has no reviews"}), 404

    avg = sum(r["rating"] for r in product_reviews) / len(product_reviews)
    return jsonify({
        "product_id": product_id,
        "average_rating": round(avg, 2),
        "total_reviews": len(product_reviews)
    })


# ------------------------------------------
# SEARCH REVIEW BY KEYWORD
# ------------------------------------------
@app.route('/reviews/search', methods=['GET'])
def search_reviews():
    keyword = request.args.get("q", "").lower()

    result = [r for r in reviews if keyword in r["review"].lower()]
    return jsonify(result)


# ------------------------------------------
# FILTER BY RATING
# ------------------------------------------
@app.route('/reviews/filter', methods=['GET'])
def filter_reviews():
    rating = request.args.get("rating", type=int)
    if rating is None:
        return jsonify({"message": "Please provide ?rating=VALUE"}), 400

    result = [r for r in reviews if r["rating"] == rating]
    return jsonify(result)


# ------------------------------------------
# SORT REVIEWS BY RATING ASC/DESC
# ------------------------------------------
@app.route('/reviews/sort', methods=['GET'])
def sort_reviews():
    order = request.args.get("order", "asc")

    sorted_data = sorted(reviews, key=lambda r: r["rating"], reverse=(order == "desc"))
    return jsonify(sorted_data)


# ------------------------------------------
# GET RECENT (LIMITED) REVIEWS
# ------------------------------------------
@app.route('/reviews/recent', methods=['GET'])
def recent_reviews():
    limit = request.args.get("limit", 3, type=int)
    return jsonify(reviews[-limit:])


# ------------------------------------------
# POST NEW REVIEW
# ------------------------------------------
@app.route('/reviews', methods=['POST'])
def create_review():

    data = request.get_json() or {}
    required_fields = ["product_id", "review", "rating"]

    missing = [f for f in required_fields if f not in data]
    if missing:
        return jsonify({"message": f"Missing fields: {', '.join(missing)}"}), 400

    new_review = {
        "id": len(reviews) + 1,
        "product_id": data["product_id"],
        "review": data["review"],
        "rating": data["rating"]
    }

    reviews.append(new_review)
    return jsonify({"message": "Review added", "data": new_review}), 201


# ------------------------------------------
# UPDATE REVIEW
# ------------------------------------------
@app.route('/reviews/<int:id>', methods=['PUT'])
def update_review(id):
    data = request.json
    for r in reviews:
        if r["id"] == id:
            r.update(data)
            return jsonify({"message": "Review updated", "data": r})
    return jsonify({"message": "Review not found"}), 404


# ------------------------------------------
# DELETE REVIEW
# ------------------------------------------
@app.route('/reviews/<int:id>', methods=['DELETE'])
def delete_review(id):
    global reviews
    reviews = [r for r in reviews if r["id"] != id]
    return jsonify({"message": "Review deleted"})


# ------------------------------------------
# RUN APP
# ------------------------------------------
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5002, debug=True)

