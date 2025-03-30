import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Image from "../Image.jsx";
import StarRating from "../StarRating.jsx";

export default function IndexPage() {
  const [places, setPlaces] = useState([]);
  const [placeRatings, setPlaceRatings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all places
    axios.get("/api/places").then((response) => {
      const placesData = response.data;
      setPlaces(placesData);

      // Create default ratings for places
      const promises = placesData.map((place) =>
        axios
          .post(`/api/places/default-review`, { placeId: place._id })
          .catch((err) => console.error("Error creating default review:", err))
      );

      Promise.all(promises).then(() => {
        // Now fetch all ratings after ensuring each place has at least one review
        const ratingPromises = placesData.map((place) =>
          axios
            .get(`/api/places/${place._id}/rating`)
            .then((res) => ({ placeId: place._id, rating: res.data }))
            .catch(() => ({
              placeId: place._id,
              rating: { averageRating: 0, count: 0 },
            }))
        );

        Promise.all(ratingPromises).then((ratingsData) => {
          const ratingsMap = {};
          ratingsData.forEach((item) => {
            ratingsMap[item.placeId] = item.rating;
          });
          setPlaceRatings(ratingsMap);
          setLoading(false);
        });
      });
    });
  }, []);

  return (
    <div className="max-w-full px-4 py-8">
      {loading && <div className="text-center">Loading...</div>}

      <div className="grid gap-x-6 gap-y-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {places.length > 0 &&
          places.map((place) => (
            <Link
              key={place._id}
              to={"/place/" + place._id}
              className="flex flex-col"
            >
              <div className="bg-gray-500 mb-2 rounded-2xl flex h-48">
                <Image
                  className="rounded-2xl object-cover aspect-square w-full"
                  src={place.photos?.[0] || ""}
                  alt=""
                />
              </div>
              <h2 className="font-bold text-gray-800 text-lg">{place.title}</h2>
              <h3 className="text-sm text-gray-400 truncate">
                {place.address}
              </h3>
              <div className="mt-1 flex items-center justify-between">
                <div>
                  <span className="font-bold text-primary">₹{place.price}</span>{" "}
                  per night
                </div>
                {placeRatings[place._id]?.averageRating > 0 && (
                  <div className="flex items-center gap-1">
                    <StarRating
                      rating={Math.round(placeRatings[place._id].averageRating)}
                    />
                    <span className="text-sm font-medium">
                      {placeRatings[place._id].averageRating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
      </div>
      {places.length === 0 && !loading && (
        <div className="text-center text-gray-500 mt-8">
          No accommodations available at the moment.
        </div>
      )}
    </div>
  );
}
