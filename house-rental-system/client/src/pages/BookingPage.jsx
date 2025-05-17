import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import AddressLink from "../AddressLink";
import PlaceGallery from "../PlaceGallery";
import BookingDates from "../BookingDates";
import { ThemeContext } from "../ThemeContext";

export default function BookingPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);
  const { isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    // Check for payment success message in localStorage
    const paymentSuccess = localStorage.getItem("paymentSuccess");
    if (paymentSuccess) {
      const successData = JSON.parse(paymentSuccess);
      // Only show the message if it's for this booking and less than 10 seconds old
      if (
        successData.bookingId === id &&
        new Date().getTime() - successData.timestamp < 10000
      ) {
        setSuccessMessage("Payment successful! Your booking is confirmed.");
        // Remove the message from localStorage after displaying it
        localStorage.removeItem("paymentSuccess");
      }
    }

    if (id) {
      axios
        .get("/api/bookings")
        .then((response) => {
          const foundBooking = response.data.find(({ _id }) => _id === id);
          if (foundBooking) {
            setBooking(foundBooking);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching booking:", error);
          setLoading(false);
        });
    }
  }, [id]);

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (loading) {
    return (
      <div className={`text-center my-8 ${isDarkMode ? "text-white" : ""}`}>
        Loading booking information...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className={`text-center my-8 ${isDarkMode ? "text-white" : ""}`}>
        Booking not found.
      </div>
    );
  }

  return (
    <div className="my-8 px-8">
      {successMessage && (
        <div className="bg-green-100 p-4 mb-4 rounded-2xl text-green-700 font-semibold text-center">
          {successMessage}
        </div>
      )}

      <h1 className={`text-3xl ${isDarkMode ? "text-white" : ""}`}>
        {booking.place.title}
      </h1>
      <AddressLink
        className={`my-2 block ${isDarkMode ? "text-gray-300" : ""}`}
      >
        {booking.place.address}
      </AddressLink>
      <div
        className={`p-6 my-6 rounded-2xl flex flex-col md:flex-row gap-6 ${
          isDarkMode ? "bg-gray-900 text-white" : "bg-gray-200"
        }`}
      >
        <div className="flex-grow">
          <h2 className="text-2xl mb-4">Your booking information:</h2>
          <BookingDates
            booking={booking}
            className={isDarkMode ? "text-gray-300" : "text-gray-700"}
          />

          <div
            className={`mt-4 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
          >
            <div>
              <strong>Name:</strong> {booking.name}
            </div>
            <div>
              <strong>Phone:</strong> {booking.phone}
            </div>
            <div>
              <strong>Number of guests:</strong> {booking.numberOfGuests}
            </div>
          </div>
        </div>
        <div>
          <div className="bg-primary p-6 text-white rounded-2xl flex flex-col">
            <div>Total price</div>
            <div className="text-3xl mb-2">₹{booking.price}</div>
            <div
              className={`text-sm px-2 py-1 rounded-md ${
                booking.paymentStatus === "completed"
                  ? "bg-green-700"
                  : booking.paymentStatus === "failed"
                  ? "bg-red-700"
                  : "bg-yellow-700"
              }`}
            >
              Payment status: {booking.paymentStatus}
            </div>
            {booking.paymentDate && (
              <div className="text-sm mt-2">
                Paid on: {new Date(booking.paymentDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>

      <h2 className={`text-2xl mt-8 mb-4 ${isDarkMode ? "text-white" : ""}`}>
        Property information
      </h2>
      <PlaceGallery place={booking.place} />

      <div className="mt-8 mb-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className={`text-xl mb-2 ${isDarkMode ? "text-white" : ""}`}>
            Description
          </h3>
          <div className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
            {booking.place.description}
          </div>
        </div>
        <div>
          <h3 className={`text-xl mb-2 ${isDarkMode ? "text-white" : ""}`}>
            Check-in & Check-out
          </h3>
          <div className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
            <div>
              <strong>Check-in:</strong> {booking.place.checkIn}
            </div>
            <div>
              <strong>Check-out:</strong> {booking.place.checkOut}
            </div>
            <div>
              <strong>Max guests:</strong> {booking.place.maxGuests}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
