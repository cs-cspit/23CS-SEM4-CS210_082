import { useEffect, useState } from "react";
import axios from "axios";
import StarRating from "./StarRating";

export default function Ratings({ place }) {
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (place._id) {
      loadRatingData();
    }
  }, [place._id]);

  async function loadRatingData() {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/places/${place._id}/rating`);
      setAverageRating(data.averageRating);
      setReviewCount(data.count);

      // If no reviews exist, create a default review
      if (data.count === 0) {
        await createDefaultReview();
      }
    } catch (error) {
      console.error("Error loading rating data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createDefaultReview() {
    try {
      await axios.post("/api/places/default-review", {
        placeId: place._id,
      });
      // Reload the rating data
      const { data } = await axios.get(`/api/places/${place._id}/rating`);
      setAverageRating(data.averageRating);
      setReviewCount(data.count);
    } catch (error) {
      console.error("Error creating default review:", error);
    }
  }

  if (loading) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 mt-1">
      {averageRating > 0 && (
        <>
          <StarRating rating={Math.round(averageRating)} />
          <span className="text-sm font-medium text-gray-500">
            {averageRating.toFixed(1)}
          </span>
        </>
      )}
    </div>
  );
}
