import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

export const db = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  }
);

export interface User {
  id: string; // Already string, but now it's 'chang333' instead of UUID
  display_name: string; // Changed from first_name/last_name
  profile_icon_url: string | null;
  current_latitude: number | null;
  current_longitude: number | null;
  current_address: string | null;
  current_status:
    | "studying"
    | "exploring"
    | "chilling"
    | "working"
    | "hanging out"
    | null;
  status_updated_at: string;
  is_active: boolean;
  location_sharing_enabled: boolean;
  favorite_locations?: Location[] | null;
}

export interface Nudge {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "sent" | "seen" | "undone";
  created_at: string;
  seen_at: string | null;
  undone_at: string | null;
}
