const GOOGLE_PLACES_API_KEY = "AIzaSyC6e7gLqYaWvwClHLYc_KoUJz3M92hCj_M";
const PLACES_API_BASE = "https://maps.googleapis.com/maps/api/place";

export interface PlaceMerchant {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  rating?: number;
  userRatingsTotal?: number;
  photoReference?: string;
}

// Map Google place types to our categories
const typeToCategory: Record<string, string> = {
  cafe: "cafe",
  restaurant: "restaurant",
  bar: "restaurant",
  food: "restaurant",
  meal_takeaway: "restaurant",
  meal_delivery: "restaurant",
  bakery: "cafe",
  store: "shopping",
  shopping_mall: "shopping",
  supermarket: "shopping",
  convenience_store: "shopping",
  clothing_store: "shopping",
  shoe_store: "shopping",
  jewelry_store: "shopping",
  department_store: "shopping",
  book_store: "shopping",
  electronics_store: "shopping",
  furniture_store: "shopping",
  home_goods_store: "shopping",
  hardware_store: "shopping",
  pet_store: "shopping",
};

const getCategoryFromTypes = (types: string[]): string => {
  for (const type of types) {
    if (typeToCategory[type]) {
      return typeToCategory[type];
    }
  }
  return "other";
};

export class PlacesService {
  /**
   * Get nearby merchants using Nearby Search
   */
  //   static async getNearbyMerchants(
  //     latitude: number,
  //     longitude: number,
  //     radius: number = 1000,
  //     types: string[] = ["cafe", "restaurant", "store", "shopping_mall"]
  //   ): Promise<{
  //     success: boolean;
  //     merchants?: PlaceMerchant[];
  //     error?: string;
  //   }> {
  //     try {
  //       if (!GOOGLE_PLACES_API_KEY) {
  //         console.error("Missing Google Places API key");
  //         return { success: false, error: "Missing Google Places API key" };
  //       }

  //       console.log("Fetching merchants near:", { latitude, longitude, radius });
  //       console.log(
  //         "Using API key:",
  //         GOOGLE_PLACES_API_KEY.substring(0, 10) + "..."
  //       );

  //       const typesParam = types.join("|"); // join all the types
  //       const url = `${PLACES_API_BASE}/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${typesParam}&key=${GOOGLE_PLACES_API_KEY}`;

  //       console.log(
  //         "Request URL:",
  //         url.replace(GOOGLE_PLACES_API_KEY, "API_KEY_HIDDEN")
  //       );

  //       const response = await fetch(url, {
  //         method: "GET",
  //         headers: {
  //           Accept: "application/json",
  //         },
  //       });

  //       const data = await response.json();
  //       console.log("Places API response status:", data.status);

  //       if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
  //         console.error("Places API error:", data.status, data.error_message);
  //         return {
  //           success: false,
  //           error: `${data.status}: ${data.error_message || "Unknown error"}`,
  //         };
  //       }

  //       if (data.status === "ZERO_RESULTS") {
  //         return { success: true, merchants: [] };
  //       }

  //       const merchants: PlaceMerchant[] = data.results
  //         .filter((place: any) => {
  //           const category = getCategoryFromTypes(place.types || []);
  //           return (
  //             category !== "other" && place.business_status === "OPERATIONAL"
  //           );
  //         })
  //         .map((place: any) => ({
  //           id: place.place_id,
  //           name: place.name,
  //           address: place.vicinity,
  //           latitude: place.geometry.location.lat,
  //           longitude: place.geometry.location.lng,
  //           category: getCategoryFromTypes(place.types || []),
  //           rating: place.rating,
  //           userRatingsTotal: place.user_ratings_total,
  //           photoReference: place.photos?.[0]?.photo_reference,
  //         }));
  //       // .sort((a: PlaceMerchant, b: PlaceMerchant) => {
  //       //   const scoreA =
  //       //     (a.rating || 0) * Math.log10((a.userRatingsTotal || 0) + 1);
  //       //   const scoreB =
  //       //     (b.rating || 0) * Math.log10((b.userRatingsTotal || 0) + 1);
  //       //   return scoreB - scoreA;
  //       // });

  //       console.log(`Found ${merchants.length} merchants`);
  //       return { success: true, merchants };
  //     } catch (error: any) {
  //       console.error("Error fetching nearby merchants:", error.message);
  //       return {
  //         success: false,
  //         error: error.message || "Failed to fetch nearby merchants",
  //       };
  //     }
  //   }

  static async getNearbyMerchants(
    latitude: number,
    longitude: number,
    radius: number = 2000,
    types: string[] = [],
    perTypeLimit: number = 4 // << limit top N merchants per category
  ): Promise<{
    success: boolean;
    merchants?: PlaceMerchant[];
    error?: string;
  }> {
    try {
      if (!GOOGLE_PLACES_API_KEY) {
        return { success: false, error: "Missing Google Places API key" };
      }

      const merchantResults: any[] = [];

      for (const type of types) {
        const url =
          `${PLACES_API_BASE}/nearbysearch/json?` +
          `location=${latitude},${longitude}` +
          `&radius=${radius}` +
          `&type=${type}` +
          `&key=${GOOGLE_PLACES_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "OK") {
          // Sort by rating or relevance, then limit
          const topForType = data.results
            .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
            .slice(0, perTypeLimit);

          merchantResults.push(...topForType);
        }
      }

      // Dedupe by place_id
      const deduped = Object.values(
        merchantResults.reduce((acc: any, item: any) => {
          acc[item.place_id] = item;
          return acc;
        }, {})
      );

      // Compute distance using Haversine
      const toRad = (deg: number) => (deg * Math.PI) / 180;

      const distance = (
        lat1: number,
        lng1: number,
        lat2: number,
        lng2: number
      ) => {
        const R = 6371e3; // meters
        const φ1 = toRad(lat1);
        const φ2 = toRad(lat2);
        const Δφ = toRad(lat2 - lat1);
        const Δλ = toRad(lng2 - lng1);

        const a =
          Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };

      // Final mapping + distance
      const mapped = deduped.map((place: any) => {
        const dist = distance(
          latitude,
          longitude,
          place.geometry.location.lat,
          place.geometry.location.lng
        );

        return {
          id: place.place_id,
          name: place.name,
          address: place.vicinity,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          category: getCategoryFromTypes(place.types || []),
          rating: place.rating,
          userRatingsTotal: place.user_ratings_total,
          photoReference: place.photos?.[0]?.photo_reference,
          distanceMeters: dist,
        };
      });

      // Compute global max for normalization
      const maxReviews = Math.max(
        ...mapped.map((m) => m.userRatingsTotal || 0),
        1
      );
      const maxDistance = Math.max(
        ...mapped.map((m) => m.distanceMeters || 0),
        1
      );

      // Weight settings
      const wRating = 0.5;
      const wReviews = 0.3;
      const wDistance = 0.2;

      // Compute score for each merchant
      const scored = mapped.map((m) => {
        const rating = m.rating || 0;
        const reviews = m.userRatingsTotal || 0;
        const distance = m.distanceMeters || maxDistance;

        const normalized_rating = rating / 5;

        // log normalization for review count
        const normalized_reviews =
          Math.log(1 + reviews) / Math.log(1 + maxReviews);

        // closer = better
        const normalized_distance = 1 - Math.min(distance / maxDistance, 1);

        const score =
          wRating * normalized_rating +
          wReviews * normalized_reviews +
          wDistance * normalized_distance;

        return { ...m, score };
      });

      // Sort merchants by composite score
      const sorted = scored.sort((a, b) => b.score - a.score);

      return { success: true, merchants: sorted };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Get photo URL from photo reference
   */
  static getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
    return `${PLACES_API_BASE}/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
  }

  /**
   * Geocode an address to get coordinates
   */
  static async geocodeAddress(address: string): Promise<{
    success: boolean;
    latitude?: number;
    longitude?: number;
    error?: string;
  }> {
    try {
      if (!GOOGLE_PLACES_API_KEY) {
        return { success: false, error: "Missing Google Places API key" };
      }

      const response = await fetch(
        "https://maps.googleapis.com/maps/api/geocode/json?" +
          new URLSearchParams({
            address,
            key: GOOGLE_PLACES_API_KEY!,
          })
      );

      const data = await response.json();

      if (data.status !== "OK") {
        return { success: false, error: data.status };
      }

      const location = data.results[0].geometry.location;
      return {
        success: true,
        latitude: location.lat,
        longitude: location.lng,
      };
    } catch (error: any) {
      console.error("Error geocoding address:", error);
      return { success: false, error: "Failed to geocode address" };
    }
  }
}
