import { useContext, useEffect, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext.jsx";
import PaymentForm from "./PaymentForm.jsx";
import { ThemeContext } from "./ThemeContext.jsx";

export default function BookingWidget({ place }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [redirect, setRedirect] = useState("");
  const [error, setError] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const { user } = useContext(UserContext);
  const { isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  let numberOfNights = 0;
  if (checkIn && checkOut) {
    numberOfNights = differenceInCalendarDays(
      new Date(checkOut),
      new Date(checkIn)
    );
  }

  async function validateAndProceedToPayment() {
    if (!checkIn || !checkOut) {
      setError("Please select check-in and check-out dates");
      return;
    }

    if (!phone) {
      setError("Please provide a phone number");
      return;
    }

    if (!user) {
      setError("Please login to book a place");
      return;
    }

    setError("");

    // Save booking data for later submission
    setBookingData({
      checkIn: new Date(checkIn).toISOString(),
      checkOut: new Date(checkOut).toISOString(),
      numberOfGuests,
      name,
      phone,
      place: place._id,
      price: numberOfNights * place.price,
    });

    // Show payment form
    setShowPaymentForm(true);
  }

  async function bookThisPlace() {
    try {
      const response = await axios.post("/api/bookings", bookingData);
      const bookingId = response.data._id;

      // Store success message in localStorage to be displayed on the booking page
      localStorage.setItem(
        "paymentSuccess",
        JSON.stringify({
          show: true,
          bookingId: bookingId,
          timestamp: new Date().getTime(),
        })
      );

      setRedirect(`/account/bookings/${bookingId}`);
    } catch (err) {
      console.error("Booking error:", err);
      setError(
        err.response?.data?.error ||
          "Failed to create booking. Please try again."
      );
      setShowPaymentForm(false);
    }
  }

  function handlePaymentCancel() {
    setShowPaymentForm(false);
  }

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  if (showPaymentForm) {
    return (
      <PaymentForm
        amount={bookingData.price}
        onPaymentComplete={bookThisPlace}
        onCancel={handlePaymentCancel}
      />
    );
  }

  return (
    <div
      className={`shadow p-4 rounded-2xl ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-white"
      }`}
    >
      <div className="text-2xl text-center">
        Price: <span className="text-primary font-bold">₹{place.price}</span> /
        per night
      </div>
      <div
        className={`border rounded-2xl mt-4 ${
          isDarkMode ? "border-gray-700" : ""
        }`}
      >
        <div className="flex">
          <div className="py-3 px-4">
            <label>Check in:</label>
            <input
              type="date"
              value={checkIn}
              onChange={(ev) => setCheckIn(ev.target.value)}
              className={
                isDarkMode ? "bg-black text-white border-gray-700" : ""
              }
            />
          </div>
          <div
            className={`py-3 px-4 border-l ${
              isDarkMode ? "border-gray-700" : ""
            }`}
          >
            <label>Check out:</label>
            <input
              type="date"
              value={checkOut}
              onChange={(ev) => setCheckOut(ev.target.value)}
              className={
                isDarkMode ? "bg-black text-white border-gray-700" : ""
              }
            />
          </div>
        </div>
        <div
          className={`py-3 px-4 border-t ${
            isDarkMode ? "border-gray-700" : ""
          }`}
        >
          <label>Number of guests:</label>
          <input
            type="number"
            value={numberOfGuests}
            onChange={(ev) => setNumberOfGuests(ev.target.value)}
            className={isDarkMode ? "bg-black text-white border-gray-700" : ""}
          />
        </div>
        {numberOfNights > 0 && (
          <div
            className={`py-3 px-4 border-t ${
              isDarkMode ? "border-gray-700" : ""
            }`}
          >
            <label>Your full name:</label>
            <input
              type="text"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              className={
                isDarkMode ? "bg-black text-white border-gray-700" : ""
              }
            />
            <label>Phone number:</label>
            <input
              type="tel"
              value={phone}
              onChange={(ev) => setPhone(ev.target.value)}
              required
              className={
                isDarkMode ? "bg-black text-white border-gray-700" : ""
              }
            />
          </div>
        )}
      </div>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      <button onClick={validateAndProceedToPayment} className="primary mt-4">
        {numberOfNights > 0
          ? `Book for ₹${numberOfNights * place.price}`
          : "Select dates to see price"}
      </button>
    </div>
  );
}
