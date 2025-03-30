import React, { useState } from "react";

export default function PaymentForm({ amount, onPaymentComplete, onCancel }) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  // Format expiry date as MM/YY
  const formatExpiryDate = (value) => {
    const cleanValue = value.replace(/[^\d]/g, "");
    if (cleanValue.length <= 2) {
      return cleanValue;
    }
    return `${cleanValue.slice(0, 2)}/${cleanValue.slice(2, 4)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate card details
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      setError("Please enter a valid 16-digit card number");
      return;
    }

    if (expiryDate.length !== 5) {
      setError("Please enter a valid expiry date (MM/YY)");
      return;
    }

    if (cvv.length !== 3) {
      setError("Please enter a valid 3-digit CVV");
      return;
    }

    // Simulate payment processing
    setIsProcessing(true);
    try {
      // In a real app, you would integrate with a payment gateway like Stripe or PayPal here
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSuccess(true);

      // Show success message for 1.5 seconds before redirecting
      setTimeout(() => {
        onPaymentComplete();
      }, 1500);
    } catch (err) {
      setError("Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
        <div className="mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold mb-4 text-green-700">
          Payment Successful!
        </h2>
        <p className="text-lg mb-6">Your booking is being confirmed...</p>
        <div className="w-full max-w-xs mx-auto">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-green-500 h-2 rounded-full animate-pulse"
              style={{ width: "100%" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Payment Details
      </h2>
      <p className="text-center mb-6 text-lg">
        Total Amount: <span className="font-bold text-primary">₹{amount}</span>
      </p>

      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Card Number</label>
          <input
            type="text"
            className="w-full border p-2 rounded-lg"
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            maxLength={19}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Cardholder Name
          </label>
          <input
            type="text"
            className="w-full border p-2 rounded-lg"
            placeholder="jaimin"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            required
          />
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              Expiry Date
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded-lg"
              placeholder="MM/YY"
              value={expiryDate}
              onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
              maxLength={5}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">CVV</label>
            <input
              type="text"
              className="w-full border p-2 rounded-lg"
              placeholder="123"
              value={cvv}
              onChange={(e) =>
                setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))
              }
              maxLength={3}
              required
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Pay Now"}
          </button>
        </div>
      </form>

      <div className="mt-6 text-xs text-gray-500 text-center">
        <p>This is a demo payment form. No actual payment will be processed.</p>
        <p className="mt-1">For testing, use any valid-format card details.</p>
      </div>
    </div>
  );
}
