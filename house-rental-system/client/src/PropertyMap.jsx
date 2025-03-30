import React, { useState } from "react";

export default function PropertyMap({ address }) {
  const [mapError, setMapError] = useState(false);

  if (!address) return null;

  // URL encode the address for the Google Maps embed URL
  const encodedAddress = encodeURIComponent(address);

  // Fallback to OpenStreetMap if Google Maps fails
  if (mapError) {
    const osmAddress = encodeURIComponent(address);
    return (
      <div className="h-[500px] w-full rounded-md overflow-hidden shadow-md">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=-10%2C-10%2C10%2C10&layer=mapnik&marker=${osmAddress}`}
          allowFullScreen
          title="Property location map (OpenStreetMap)"
        ></iframe>
        <div className="p-2 bg-gray-100 text-sm text-center">
          <a
            href={`https://www.openstreetmap.org/search?query=${osmAddress}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-500 hover:underline"
          >
            View larger map
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[500px] w-full rounded-md overflow-hidden shadow-md">
      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBV2LlcKmVaRI6s5NlXHc6outbvdQ8qIv0&q=${encodedAddress}`}
        allowFullScreen
        title="Property location map"
        onError={() => setMapError(true)}
      ></iframe>
    </div>
  );
}
