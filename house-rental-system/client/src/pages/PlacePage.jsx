import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import BookingWidget from "../BookingWidget";
import PlaceGallery from "../PlaceGallery";
import AddressLink from "../AddressLink";
import StarRating from "../StarRating";
// import PropertyMap from "../PropertyMap";

export default function PlacePage() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [rating, setRating] = useState({ averageRating: 0, count: 0 });
  const [loading, setLoading] = useState(true);

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
    <div className="mt-4 bg-gray-100 px-8 pt-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{place.title}</h1>
          <div className="flex items-center gap-2">
            <AddressLink className="text-sm text-gray-400">
              {place.address}
            </AddressLink>
            {rating.averageRating > 0 && (
              <div className="flex items-center gap-1">
                <StarRating rating={Math.round(rating.averageRating)} />
                <span className="text-sm font-medium">
                  {rating.averageRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <PlaceGallery place={place} />
      <div className="mt-8 mb-8 grid gap-8 grid-cols-1 md:grid-cols-[2fr_1fr] lg:grid-cols-[3fr_1fr]">
        <div>
          <div className="my-4">
            <h2 className="font-semibold text-2xl">Description</h2>
            {place.description}
          </div>
          Check-in: {place.checkIn}
          <br />
          Check-out: {place.checkOut}
          <br />
          Max number of guests: {place.maxGuests}
        </div>
        <div>
          <BookingWidget place={place} />
        </div>
      </div>
      <div className="bg-white px-8 py-8 border-t">
        <div>
          <h2 className="font-semibold text-2xl">Extra info</h2>
        </div>
        <div className="mb-4 mt-2 text-sm text-gray-700 leading-5">
          {place.extraInfo}
        </div>
      </div>
      <div className="bg-white px-8 py-8 border-t">
        <div>
          <h2 className="font-semibold text-2xl mb-4">Location</h2>
        </div>
        {/* <PropertyMap address={place.address} /> */}
      </div>
    </div>
  );
}
