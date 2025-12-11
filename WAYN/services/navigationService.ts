// services/navigationService.ts
import getEnv from "../utils/env";

const { GOOGLE_MAPS_API_KEY } = getEnv();

export interface NavigationStep {
  instruction: string;
  distance: string;
  duration: string;
}

export interface RouteData {
  steps: NavigationStep[];
  totalDistance: string;
  totalDuration: string;
  durationInSeconds: number;
  polyline: string;
  legs: Array<{
    start_location: { lat: number; lng: number };
    end_location: { lat: number; lng: number };
    steps: Array<{
      html_instructions: string;
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      polyline: { points: string };
      start_location: { lat: number; lng: number };
      end_location: { lat: number; lng: number };
    }>;
  }>;
}

export type TravelMode = "WALKING" | "DRIVING";

export class NavigationService {
  static async getRoute(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number },
    mode: TravelMode = "WALKING"
  ): Promise<{ success: boolean; route?: RouteData; error?: string }> {
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=${mode.toLowerCase()}&key=${GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "OK") {
        return {
          success: false,
          error: `Failed to get route: ${data.status}`,
        };
      }

      const route = data.routes[0];
      const leg = route.legs[0];

      const steps: NavigationStep[] = leg.steps.map((step: any) => ({
        instruction: step.html_instructions.replace(/<[^>]*>/g, ""), // Remove HTML tags
        distance: step.distance.text,
        duration: step.duration.text,
      }));

      return {
        success: true,
        route: {
          steps,
          totalDistance: leg.distance.text,
          totalDuration: leg.duration.text,
          durationInSeconds: leg.duration.value,
          polyline: route.overview_polyline.points,
          legs: route.legs,
        },
      };
    } catch (error) {
      console.error("Navigation service error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static decodePolyline(encoded: string): Array<{ latitude: number; longitude: number }> {
    const points: Array<{ latitude: number; longitude: number }> = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let b;
      let shift = 0;
      let result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return points;
  }
}