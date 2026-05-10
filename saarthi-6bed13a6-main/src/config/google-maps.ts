// Google Maps API key. Restrict by HTTP referrer in Google Cloud Console.
// Enable: Maps JavaScript API, Places API, Directions API, Distance Matrix API, Geocoding API.
export const GOOGLE_MAPS_API_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) ??
  "f4ffe3c392c9484facc34c50d5bfa049";

export const isMapsKeyConfigured = () =>
  !!GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== "YOUR_GOOGLE_API_KEY_HERE";
