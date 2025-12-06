// utils/googlePlaces.ts
import getEnv from './env';

const { GOOGLE_MAPS_API_KEY } = getEnv();

export interface PlaceDetails {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: string;
  categoryIconUrl?: string;
}

/**
 * Fetch place details from Google Places API
 * @param placeId - The Google Place ID
 * @param userLocation - User's current location to calculate distance
 * @returns Place details including address and formatted data
 */
export async function fetchPlaceDetails(
  placeId: string,
  userLocation?: { latitude: number; longitude: number }
): Promise<PlaceDetails | null> {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,icon&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.result) {
      const result = data.result;
      
      // Calculate distance if user location is provided
      let distance = '';
      if (userLocation && result.geometry?.location) {
        const distanceInMiles = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          result.geometry.location.lat,
          result.geometry.location.lng
        );
        distance = `${distanceInMiles.toFixed(1)} mi away`;
      }

      return {
        id: placeId,
        name: result.name || 'Unknown Location',
        address: result.formatted_address || '',
        latitude: result.geometry?.location?.lat || 0,
        longitude: result.geometry?.location?.lng || 0,
        distance,
        categoryIconUrl: result.icon,
      };
    }

    console.error('Places API error:', data.status);
    return null;
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
}

/**
 * Calculate distance between two coordinates in miles
 * Using the Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}