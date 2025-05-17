import AccountNav from "../AccountNav";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import PlaceImg from "../PlaceImg";
import { differenceInCalendarDays, format } from "date-fns";
import { Link } from "react-router-dom";
import BookingDates from "../BookingDates";
import { ThemeContext } from "../ThemeContext";
import { useToast } from "../ToastContext";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useContext(ThemeContext);
  const { addToast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  function fetchBookings() {
    setLoading(true);
    axios
      .get("/api/bookings")
      .then((response) => {
        setBookings(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching bookings:", error);
        setLoading(false);
      });
  }

  async function cancelBooking(bookingId, e) {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation(); // Prevent event bubbling

    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`/api/bookings/${bookingId}`);
      // Remove cancelled booking from state
      setBookings(bookings.filter((booking) => booking._id !== bookingId));
      addToast("Booking cancelled successfully", "success");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      addToast("Failed to cancel booking. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-full px-4">
      <AccountNav />
      {loading && (
        <div className={`text-center py-4 ${isDarkMode ? "text-white" : ""}`}>
          Loading bookings...
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <div className="text-center py-10">
          <h2
            className={`text-2xl mb-4 ${
              isDarkMode ? "text-white" : "text-gray-600"
            }`}
          >
            You have no bookings yet.
          </h2>
          <p
            className={`mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}
          >
            Book a place to stay to see your bookings here!
          </p>
          <Link to="/" className="bg-primary text-white py-2 px-6 rounded-full">
            Explore places to stay
          </Link>
        </div>
      )}

      <div className="grid gap-4">
        {bookings?.length > 0 &&
          bookings.map((booking) => (
            <div key={booking._id} className="relative">
              <Link
                to={`/account/bookings/${booking._id}`}
                className={`flex gap-4 rounded-2xl overflow-hidden ${
                  isDarkMode ? "bg-gray-900 text-white" : "bg-gray-200"
                }`}
              >
                <div className="w-48">
                  <PlaceImg place={booking.place} />
                </div>
                <div className="py-3 pr-3 grow">
                  <h2 className="text-xl">{booking.place.title}</h2>
                  <div className="text-xl">
                    <BookingDates
                      booking={booking}
                      className={`mb-2 mt-4 ${
                        isDarkMode ? "text-gray-300" : "text-gray-500"
                      }`}
                    />
                    <div className="flex gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-8 h-8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                        />
                      </svg>
                      <span className="text-2xl">
                        Total price: ₹{booking.price}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
              <button
                onClick={(e) => cancelBooking(booking._id, e)}
                className={`absolute bottom-2 right-2 bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center gap-1 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
                title="Cancel booking"
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
                Cancel booking
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
