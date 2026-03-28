import { useEffect, useState } from "react";
import "./ReviewSection.css";
import { showToast } from "../utils/toast";
const ReviewSection = ({ gigId }) => {
  const [open, setOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const base_url = "https://Linkx1.pythonanywhere.com";
  const token = localStorage.getItem("accessToken")
  // fetch reviews
  const fetchReviews = async () => {
    try {
      const res = await fetch(`${base_url}/api/gigs/gigs/${gigId}/reviews/`);
      const data = await res.json();

      setReviews(data.reviews || []);
      setAvgRating(data.avg_rating || 0);
      setTotalReviews(data.total_reviews || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (gigId) fetchReviews();
  }, [gigId]);

  // submit review
  const handleSubmit = async () => {
    if (!rating) return showToast("Select rating");

    try {
      const res = await fetch(`${base_url}/api/gigs/gigs/${gigId}/review/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
          },
        //},
        body: JSON.stringify({ rating, comment }),
      });

      if (res.ok) {
        setRating(0);
        setComment("");
        fetchReviews();
      } else {
        console.log("Failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* BUTTON */}
      <button onClick={() => setOpen(true)} className="review-btn">
        ⭐ {avgRating.toFixed(1)} · {totalReviews}
      </button>

      {/* MODAL */}
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>

            <button className="close-btn" onClick={() => setOpen(false)}>✕</button>

            {/* HEADER */}
            <div className="review-summary">
              <h3>Reviews</h3>
              <div className="rating-overview">
                <span className="big-rating">⭐ {avgRating.toFixed(1)}</span>
                <span className="total-reviews">{totalReviews} reviews</span>
              </div>
            </div>

            {/* REVIEW LIST */}
            <div className="review-list">
              {reviews.length === 0 ? (
                <p className="no-reviews">No reviews yet</p>
              ) : (
                reviews.map((r, i) => (
                  <div key={i} className="review-card">
                    <div className="review-header">
                      <div className="avatar">
                        {r.user ? r.user[0].toUpperCase() : "U"}
                      </div>
                      <div>
                        <strong>{r.user}</strong>
                        <div className="stars">⭐ {r.rating}</div>
                      </div>
                    </div>
                    <p className="review-text">{r.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* GIVE REVIEW */}
            <div className="give-review">
              <p>Give review</p>

              <div className="star-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setRating(star)}
                    className={star <= rating ? "active" : ""}
                  >
                    ⭐
                  </span>
                ))}
              </div>

              {rating > 0 && (
                <div className="review-input-area">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Why did you give this rating?"
                  />
                  <button onClick={handleSubmit} className="submit-btn">
                    Submit Review
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;