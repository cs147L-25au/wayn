const GOOGLE_MAPS_API_KEY = "AIzaSyC6e7gLqYaWvwClHLYc_KoUJz3M92hCj_M";
const EXPO_PUBLIC_GEMINI_API_KEY = "AIzaSyCOJmwpj5fnqy_SVZK3laND-uNaBOeIjt0";

const ENV = {
  EXPO_PUBLIC_GEMINI_API_KEY,
  GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_API: {
    BASE_URL: "https://maps.googleapis.com/maps/api",
    REVERSE_GEOCODE: (lat: number, lon: number) =>
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${GOOGLE_MAPS_API_KEY}`,
  },
};

const getEnv = () => ENV;
export default getEnv;
