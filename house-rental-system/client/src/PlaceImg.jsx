import Image from "./Image.jsx";

export default function PlaceImg({ place, index = 0, className = null }) {
  if (!place) {
    // If place is undefined or null, return a random image
    return <Image className={className || "object-cover"} src={""} alt="" />;
  }

  if (!place.photos?.length) {
    // If no photos, return a random image
    return <Image className={className || "object-cover"} src={""} alt="" />;
  }

  if (!className) {
    className = "object-cover";
  }

  return <Image className={className} src={place.photos[index]} alt="" />;
}
