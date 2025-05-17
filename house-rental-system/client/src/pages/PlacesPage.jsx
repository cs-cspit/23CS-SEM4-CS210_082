import { Link } from "react-router-dom";
import AccountNav from "../AccountNav";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import PlaceImg from "../PlaceImg";
import { useToast } from "../ToastContext";
import { ThemeContext } from "../ThemeContext";
import PerkIcons from "../PerkIcons";

export default function PlacesPage() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const { isDarkMode } = useContext(ThemeContext);

  async function fetchPlaces() {
    try {
      const { data } = await axios.get("/api/user-places");
      setPlaces(data);
    } catch (error) {
      console.error("Error fetching places:", error);
      addToast("Failed to load your listings", "error");
    }
  }

  useEffect(() => {
    fetchPlaces();
  }, []);

  async function handleDeletePlace(id, e) {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation(); // Prevent event bubbling

    if (!window.confirm("Are you sure you want to delete this listing?")) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`/api/places/${id}`);
      // Remove deleted place from state
      setPlaces(places.filter((place) => place._id !== id));
      addToast("Listing deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting place:", error);
      addToast("Failed to delete listing. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-full px-4">
      <AccountNav />
      <div className="text-center mb-4">
        <Link
          className="inline-flex gap-1 bg-primary text-white py-2 px-6 rounded-full"
          to={"/account/places/new"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path
              fillRule="evenodd"
              d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
              clipRule="evenodd"
            />
          </svg>
          Add new place
        </Link>
      </div>
      <div className="mt-8 grid gap-x-6 gap-y-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {places.length > 0 &&
          places.map((place) => (
            <div key={place._id} className="relative">
              <Link
                to={"/account/places/" + place._id}
                className={`p-4 rounded-2xl flex flex-col h-full ${
                  isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100"
                }`}
              >
                <div
                  className={`rounded-2xl flex mb-2 h-48 ${
                    isDarkMode ? "bg-gray-800" : "bg-gray-300"
                  }`}
                >
                  <PlaceImg place={place} />
                </div>
                <div>
                  <h2
                    className={`text-xl font-bold ${
                      isDarkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {place.title}
                  </h2>
                  <p
                    className={`text-sm mt-2 line-clamp-3 ${
                      isDarkMode ? "text-gray-300" : "text-gray-400"
                    }`}
                  >
                    {place.description}
                  </p>

                  {/* Display perks */}
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
                </div>
                <div className="mt-auto pt-2">
                  <div className="text-primary text-right font-bold">
                    ₹{place.price} / night
                  </div>
                </div>
              </Link>
              <button
                onClick={(e) => handleDeletePlace(place._id, e)}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-700 focus:outline-none"
                disabled={loading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
              </button>
            </div>
          ))}
      </div>
      {places.length === 0 && (
        <div
          className={`text-center mt-8 ${
            isDarkMode ? "text-gray-300" : "text-gray-500"
          }`}
        >
          You have no listings yet. Click "Add new place" to create one.
        </div>
      )}
    </div>
  );
}
