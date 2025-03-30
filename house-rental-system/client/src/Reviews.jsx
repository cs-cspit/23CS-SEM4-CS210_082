import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "./UserContext";
import StarRating from "./StarRating";

export default function Ratings({ place }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (place._id) {
      loadReviews();
    }
  }, [place._id]);

  async function loadReviews() {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/places/${place._id}/reviews`);
      setReviews(data);

      // Calculate average rating
      if (data.length > 0) {
        const sum = data.reduce((total, review) => total + review.rating, 0);
        setAverageRating(sum / data.length);
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitRating(selectedRating) {
    if (!user) {
      alert("You must be logged in to rate this place");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await axios.post("/api/reviews", {
        place: place._id,
        rating: selectedRating,
      });

      // Add the new review to the reviews array
      setReviews([data, ...reviews]);

      // Recalculate average
      const sum =
        reviews.reduce((total, review) => total + review.rating, 0) +
        selectedRating;
      setAverageRating(sum / (reviews.length + 1));

      // Reset form
      setRating(5);
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Failed to submit rating. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white px-8 py-8 border-t">
      <h2 className="font-semibold text-2xl mb-4">Ratings</h2>

      {averageRating > 0 && (
        <div className="flex items-center gap-1 mb-4">
          <span className="font-medium">Average Rating: </span>
          <StarRating rating={Math.round(averageRating)} />
          <span className="text-gray-500 ml-2">
            {averageRating.toFixed(1)} ({reviews.length} ratings)
          </span>
        </div>
      )}

      {/* Rating submission */}
      {user && user._id !== place.owner && (
        <div className="mb-8 bg-gray-100 p-4 rounded-2xl">
          <h3 className="font-semibold mb-2">Rate this place</h3>

          <div className="flex mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  setRating(star);
                  handleSubmitRating(star);
                }}
                className="focus:outline-none"
                disabled={isSubmitting}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={star <= rating ? "#F5385D" : "none"}
                  stroke={star <= rating ? "none" : "currentColor"}
                  className={`w-6 h-6 ${
                    star <= rating ? "text-primary" : "text-gray-300"
                  }`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                  />
                </svg>
              </button>
            ))}
            {isSubmitting && (
              <span className="ml-2 text-gray-500">Submitting...</span>
            )}
          </div>
        </div>
      )}

      {/* Display ratings summary */}
      {loading ? (
        <p>Loading ratings...</p>
      ) : reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[5, 4, 3, 2, 1].map((starValue) => {
            const count = reviews.filter(
              (review) => review.rating === starValue
            ).length;
            const percentage = Math.round((count / reviews.length) * 100);
            return (
              <div key={starValue} className="flex items-center gap-2">
                <StarRating rating={starValue} />
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-gray-500 text-sm">{percentage}%</span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500">No ratings yet.</p>
      )}
    </div>
  );
}
