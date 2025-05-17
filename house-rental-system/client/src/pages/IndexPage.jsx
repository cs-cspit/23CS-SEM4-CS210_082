import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Image from "../Image.jsx";
import StarRating from "../StarRating.jsx";
import { ThemeContext } from "../ThemeContext.jsx";
import PerkIcons from "../PerkIcons.jsx";

export default function IndexPage() {
  const [places, setPlaces] = useState([]);
  const [placeRatings, setPlaceRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useContext(ThemeContext);

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
              className={`flex flex-col rounded-2xl overflow-hidden ${
                isDarkMode ? "bg-gray-900" : "bg-white"
              } shadow-lg p-3`}
            >
              <div className="mb-2 rounded-2xl flex h-48">
                <Image
                  className="rounded-2xl object-cover aspect-square w-full"
                  src={place.photos?.[0] || ""}
                  alt=""
                />
              </div>
              <h2
                className={`font-bold text-lg ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {place.title}
              </h2>
              <h3
                className={`text-sm ${
                  isDarkMode ? "text-gray-300" : "text-gray-400"
                } truncate`}
              >
                {place.address}
              </h3>

              {/* Perks */}
              {place.perks && place.perks.length > 0 && (
                <PerkIcons
                  perks={place.perks}
                  className={`mt-2 ${
                    isDarkMode
                      ? "border-gray-700 text-gray-300"
                      : "border-gray-300 text-gray-600"
                  }`}
                />
              )}

              <div className="mt-auto pt-3 flex items-center justify-between">
                <div className={isDarkMode ? "text-white" : ""}>
                  <span className="font-bold text-primary">₹{place.price}</span>{" "}
                  per night
                </div>
                {placeRatings[place._id]?.averageRating > 0 && (
                  <div className="flex items-center gap-1">
                    <StarRating
                      rating={Math.round(placeRatings[place._id].averageRating)}
                    />
                    <span
                      className={`text-sm font-medium ${
                        isDarkMode ? "text-white" : ""
                      }`}
                    >
                      {placeRatings[place._id].averageRating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
      </div>
      {places.length === 0 && !loading && (
        <div
          className={`text-center mt-8 ${
            isDarkMode ? "text-gray-300" : "text-gray-500"
          }`}
        >
          No accommodations available at the moment.
        </div>
      )}
    </div>
  );
}
