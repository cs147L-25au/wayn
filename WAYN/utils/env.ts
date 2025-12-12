const GOOGLE_MAPS_API_KEY = "AIzaSyC6e7gLqYaWvwClHLYc_KoUJz3M92hCj_M";

const ENV = {
  GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_API: {
    BASE_URL: "https://maps.googleapis.com/maps/api",
    REVERSE_GEOCODE: (lat: number, lon: number) =>
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${GOOGLE_MAPS_API_KEY}`,
  },
};

const getEnv = () => ENV;
export default getEnv;
