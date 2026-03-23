import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ReviewSection.css";
const ReviewSection = ({ gigId }) => {
  const [open, setOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");

  // fetch reviews
  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/gigs/${gigId}/reviews/`);
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
    if (!rating) return alert("Give rating");

    try {
      const res = await fetch(`/api/gigs/${gigId}/review/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating: Number(rating), comment }),
      });

      if (res.ok) {
        setRating("");
        setComment("");
        fetchReviews(); // refresh after submit
      } else {
        console.log("Failed to submit");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
  <div>

    {/* ⭐ BUTTON */}
    <button onClick={() => setOpen(true)} className="review-btn">
      ⭐ {avgRating.toFixed(1)} ({totalReviews} Reviews)
    </button>

    {/* MODAL */}
    {open && (
      <div className="modal-overlay" onClick={() => setOpen(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>

          <button className="close-btn" onClick={() => setOpen(false)}>✕</button>

          <h3>Reviews</h3>
          <p>⭐ {avgRating.toFixed(1)} ({totalReviews})</p>

          {/* FORM */}
          <div className="review-form">
            <input
              type="number"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="Rating (1-5)"
            />

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write comment..."
            />

            <button onClick={handleSubmit}>Submit</button>
          </div>

          {/* LIST */}
          <div className="review-list">
            {reviews.length === 0 ? (
              <p>No reviews yet</p>
            ) : (
              reviews.map((r, i) => (
                <div key={i} className="review-item">
                  <strong>{r.user}</strong>
                  <p>⭐ {r.rating}</p>
                  <p>{r.comment}</p>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    )}

  </div>
  );
};
export default ReviewSection;