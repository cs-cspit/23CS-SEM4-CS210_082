import { Link, useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import BookingWidget from "../BookingWidget";
import PlaceGallery from "../PlaceGallery";
import AddressLink from "../AddressLink";
import StarRating from "../StarRating";
import { ThemeContext } from "../ThemeContext";
import PerkIcons from "../PerkIcons";
// import PropertyMap from "../PropertyMap";

export default function PlacePage() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [rating, setRating] = useState({ averageRating: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    if (!id) {
      return;
    }

    // Fetch place details
    axios.get(`/api/places/${id}`).then((response) => {
      setPlace(response.data);

      // Fetch place rating
      axios
        .get(`/api/places/${id}/rating`)
        .then((ratingResponse) => {
          setRating(ratingResponse.data);

          // If no reviews, create a default one
          if (ratingResponse.data.count === 0) {
            createDefaultReview(response.data._id);
          } else {
            setLoading(false);
          }
        })
        .catch(() => {
          setLoading(false);
        });
    });
  }, [id]);

  async function createDefaultReview(placeId) {
    try {
      await axios.post("/api/places/default-review", { placeId });
      // Reload the rating data
      const { data } = await axios.get(`/api/places/${placeId}/rating`);
      setRating(data);
    } catch (error) {
      console.error("Error creating default review:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!place) return "";

  return (
    <div
      className={`mt-4 px-8 pt-8 ${
        isDarkMode ? "bg-black text-white" : "bg-gray-100"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1
            className={`text-3xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            {place.title}
          </h1>
          <div className="flex items-center gap-2">
            <AddressLink
              className={`text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-400"
              }`}
            >
              {place.address}
            </AddressLink>
            {rating.averageRating > 0 && (
              <div className="flex items-center gap-1">
                <StarRating rating={Math.round(rating.averageRating)} />
                <span
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-white" : ""
                  }`}
                >
                  {rating.averageRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <PlaceGallery place={place} />
      <div className="mt-8 mb-8 grid gap-8 grid-cols-1 md:grid-cols-[2fr_1fr] lg:grid-cols-[3fr_1fr]">
        <div className={isDarkMode ? "text-gray-200" : ""}>
          <div className="my-4">
            <h2
              className={`font-semibold text-2xl ${
                isDarkMode ? "text-white" : ""
              }`}
            >
              Description
            </h2>
            {place.description}
          </div>

          {/* Property Perks */}
          {place.perks && place.perks.length > 0 && (
            <div className="my-4">
              <h2
                className={`font-semibold text-2xl mb-2 ${
                  isDarkMode ? "text-white" : ""
                }`}
              >
                What this place offers
              </h2>
              <PerkIcons
                perks={place.perks}
                className={`${
                  isDarkMode
                    ? "border-gray-700 text-gray-300"
                    : "border-gray-300 text-gray-600"
                }`}
              />
            </div>
          )}

          <div className="my-4">
            <h2
              className={`font-semibold text-2xl mb-2 ${
                isDarkMode ? "text-white" : ""
              }`}
            >
              Check-in Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div
                className={`p-4 rounded-2xl ${
                  isDarkMode ? "bg-gray-900" : "bg-white"
                }`}
              >
                <div className="text-sm text-gray-500">Check-in</div>
                <div className="text-lg">{place.checkIn}</div>
              </div>
              <div
                className={`p-4 rounded-2xl ${
                  isDarkMode ? "bg-gray-900" : "bg-white"
                }`}
              >
                <div className="text-sm text-gray-500">Check-out</div>
                <div className="text-lg">{place.checkOut}</div>
              </div>
              <div
                className={`p-4 rounded-2xl ${
                  isDarkMode ? "bg-gray-900" : "bg-white"
                }`}
              >
                <div className="text-sm text-gray-500">Max guests</div>
                <div className="text-lg">{place.maxGuests}</div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <BookingWidget place={place} />
        </div>
      </div>
      <div
        className={`px-8 py-8 border-t ${
          isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white"
        }`}
      >
        <div>
          <h2
            className={`font-semibold text-2xl ${
              isDarkMode ? "text-white" : ""
            }`}
          >
            Extra info
          </h2>
        </div>
        <div
          className={`mb-4 mt-2 text-sm leading-5 ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {place.extraInfo}
        </div>
      </div>
      <div
        className={`px-8 py-8 border-t ${
          isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white"
        }`}
      >
        <div>
          <h2
            className={`font-semibold text-2xl mb-4 ${
              isDarkMode ? "text-white" : ""
            }`}
          >
            Location
          </h2>
        </div>
        <iframe
          src="https://www.google.co.in/maps/d/u/0/embed?mid=1WFPTf9ikwkvHXD71YzHUDd_-eTq-JT4&ehbc=2E312F&noprof=1"
          width="1100"
          height="480"
        ></iframe>
      </div>
    </div>
  );
}
