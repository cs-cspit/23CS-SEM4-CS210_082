import axios from "axios";
import { useState, useEffect } from "react";

// Set a constant image to use for all placeholders
const DEFAULT_IMAGE = "1743235223322-0.avif";

export default function Image({ src, ...rest }) {
  const [imageError, setImageError] = useState(false);

  // Get the API base URL from axios defaults or use environment variable directly
  const baseApiUrl =
    axios.defaults.baseURL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:4000";

  useEffect(() => {
    // Reset error state when source changes
    setImageError(false);
  }, [src]);

  if (!src) {
    // If no source provided, use default image directly
    return (
      <img
        {...rest}
        src={`${baseApiUrl}/uploads/${DEFAULT_IMAGE}`}
        alt=""
        onError={(e) => {
          console.error("Default image failed to load");
          e.target.onerror = null;
          e.target.src = "";
          e.target.style.backgroundColor = "#f0f0f0";
        }}
      />
    );
  }

  // Construct the image URL properly
  const imageUrl = !imageError
    ? src && src.includes("https://")
      ? src
      : `${baseApiUrl}/uploads/${src}`
    : `${baseApiUrl}/uploads/${DEFAULT_IMAGE}`;

  return (
    <img
      {...rest}
      src={imageUrl}
      alt={""}
      onError={(e) => {
        console.error("Image failed to load:", imageUrl);

        if (!imageError) {
          // Only set error once to prevent infinite loop if the fallback also fails
          setImageError(true);
        } else {
          // If even the fallback fails, show a colored background
          e.target.onerror = null;
          e.target.src = "";
          e.target.style.backgroundColor = "#f0f0f0";
        }
      }}
    />
  );
}
