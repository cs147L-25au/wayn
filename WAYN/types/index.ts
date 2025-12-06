// import type { Database } from "./database.types";

import { LocationCategory } from "@/utils/categoryIcons";
import { ImageSourcePropType } from "react-native";
import { User } from "../utils/supabase";

export type StatusOption =
  | "studying"
  | "exploring"
  | "chilling"
  | "working"
  | "hanging out";

export type Friend = {
  id: string;
  firstName: string;
  lastName: string;
  icon: string | number;
  longitude: number;
  latitude: number;
  address: string;
  timestamp: string;
  status: User["current_status"]; // Reuse exact database type
  favoriteLocations: Location[];
};

export type Location = {
  id: string;
  locationName: string;
  address: string;
  distance?: string;
  categoryIconUrl: string | number | ImageSourcePropType;
  category?: LocationCategory;
  latitude?: number;
  longitude?: number;
};

// ===== USER/PROFILE TYPES =====
// These types represent the 'profiles' table in your database
// They're shortcuts so you don't have to write Database["public"]["Tables"]["profiles"]["Row"] everywhere

// ProfileSelect: Use this when READING/GETTING user data from the database
// This includes ALL fields as they exist in the database (including auto-generated fields like timestamps)
// Example: const user: ProfileSelect = await supabase.from('profiles').select('*').single()

// export type ProfileSelect = Database["public"]["Tables"]["profiles"]["Row"];

// ProfileInsert: Use this when CREATING/INSERTING a new user into the database
// Some fields are optional here because the database generates them automatically (like id, created_at, updated_at)
// Example: const newUser: ProfileInsert = { first_name: "John", last_name: "Doe", ... }

// export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

// ProfileUpdate: Use this when UPDATING an existing user in the database
// ALL fields are optional here - you only need to include the fields you want to change
// Example: const updates: ProfileUpdate = { first_name: "Jane" } // Only updating first name

// export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

// ===== GIFT TYPES =====
// These types represent the 'gifts' table in your database
// Same pattern as Profile types above

// GiftSelect: Use this when READING/GETTING gift data from the database
// Includes all fields: id, sender_ids, recipient_id, content, is_opened, etc.

// export type GiftSelect = Database["public"]["Tables"]["gifts"]["Row"];

// GiftInsert: Use this when CREATING a new gift in the database
// Some fields like id, sent_date, and created_at are auto-generated, so they're optional
// Example: const newGift: GiftInsert = { sender_ids: [...], recipient_id: "...", content: [...] }

// export type GiftInsert = Database["public"]["Tables"]["gifts"]["Insert"];

// GiftUpdate: Use this when UPDATING an existing gift (like marking it as opened)
// All fields optional - only include what you want to change
// Example: const updates: GiftUpdate = { is_opened: true, opened_date: new Date().toISOString() }

// export type GiftUpdate = Database["public"]["Tables"]["gifts"]["Update"];

// ===== CONTENT TYPES =====
// This is a CUSTOM type (not from the database) that describes the structure of each content item in a gift
// Gifts can have multiple content items (text messages, images, etc.)

// export type GiftContentItem = {
//   type: 'text' | 'image';
//   text?: string;
//   url?: string;
//   order: number;
// };

// ===== COMPOSITE TYPES =====
// These types COMBINE the basic gift data with related data from other tables
// Use these when you fetch gifts WITH related information (using Supabase joins)

// GiftWithSenders: Gift data PLUS the full profile information of all senders
// The & symbol means "combine these types together" (intersection type)
// Use this when you want to display sender names/photos along with the gift
// Example query: supabase.from('gifts').select('*, profiles!sender_ids(*)')

// export type GiftWithSenders = GiftSelect & {
//   senders: ProfileSelect[];
// };

// GiftWithRecipient: Gift data PLUS the full profile information of the recipient
// Use this when you want to display the recipient's name/photo along with the gift
// Example query: supabase.from('gifts').select('*, profiles!recipient_id(*)')

// export type GiftWithRecipient = GiftSelect & {
//   recipient: ProfileSelect;
// };

// GiftWithAllDetails: The COMPLETE gift data with BOTH senders AND recipient profiles
// This is the "kitchen sink" type - includes everything you might need to display a gift
// Use this for gift detail pages where you need all related information
// Example query: supabase.from('gifts').select('*, sender:profiles!sender_ids(*), recipient:profiles!recipient_id(*)')

// export type GiftWithAllDetails = GiftSelect & {
//   senders: ProfileSelect[];
//   recipient: ProfileSelect;
// };

// ===== HELPER TYPES =====
// These are standalone utility types for common data structures in your app
// They make your code more readable and prevent bugs

// Location: Represents GPS coordinates (latitude and longitude)
// Use this instead of separate lat/lng parameters everywhere
// Example: const location: Location = { latitude: 37.7749, longitude: -122.4194 }
// This works well with Google Maps API and Supabase's GEOGRAPHY(POINT) type

// export type Location = {
//   latitude: number;
//   longitude: number;
// };

// UserActivity: The ONLY valid values for a user's current activity status
// This is a union type - TypeScript will only allow these exact strings
// Benefits: Prevents typos, provides autocomplete, matches your database CHECK constraint
// Example: const activity: UserActivity = 'chilling' // ✅ Valid
//          const activity: UserActivity = 'sleeping' // ❌ TypeScript error!

// export type UserActivity = 'chilling' | 'studying' | 'exploring' | 'hanging out';

// GiftContentType: The ONLY valid values for the overall gift type
// Similar to UserActivity - prevents typos and provides type safety
// Example: const giftType: GiftContentType = 'letter' // ✅ Valid
//          const giftType: GiftContentType = 'video'  // ❌ TypeScript error!

// export type GiftContentType = 'gift_card' | 'letter' | 'audio_rec' | 'playlist';
