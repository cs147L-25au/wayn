// services/userService.ts
import { Friend } from "../types";
import { db, User } from "../utils/supabase";

export class UserService {
  /**
   * Get all friends for a user (all users except the current user)
   */
  static async getFriends(
    userId: string
  ): Promise<{ success: boolean; friends?: Friend[]; error?: string }> {
    try {
      // Fetch all users EXCEPT the current user
      const { data: friendsData, error: friendsError } = await db
        .from("users")
        .select(
          "id, display_name, profile_icon_url, current_latitude, current_longitude, current_address, current_status, location_sharing_enabled, favorite_locations"
        )
        .neq("id", userId)
        .order("display_name");

      if (friendsError) {
        console.log("Error fetching friends:", friendsError);
        return { success: false, error: friendsError.message };
      }

      const friends: Friend[] =
        friendsData?.map((user) => this.userToFriend(user)) || [];

      return { success: true, friends };
    } catch (error) {
      console.error("Unexpected error in getFriends:", error);
      return { success: false, error: "Unexpected error occurred" };
    }
  }

  /**
   * Helper: Transform User database model to Friend UI model
   */
  private static userToFriend(user: Partial<User>): Friend {
    const nameParts = (user.display_name || "").split(" ");

    // Show "Location off" if location sharing is disabled, otherwise show their address
    const address =
      user.location_sharing_enabled === false
        ? "Location off"
        : user.current_address || "Location unavailable";

    return {
      id: user.id!,
      firstName: nameParts[0] || user.display_name || "User",
      lastName: nameParts.slice(1).join(" ") || "",
      address: address,
      timestamp: "Just now",
      icon: user.profile_icon_url
        ? { uri: user.profile_icon_url }
        : require("../assets/userIcons/jillicon.png"),
      latitude: user.current_latitude || 0,
      longitude: user.current_longitude || 0,
      status: user.current_status ?? null, // Use nullish coalescing to handle undefined
      favoriteLocations: Array.isArray(user.favorite_locations)
        ? user.favorite_locations.map((loc: any, index: number) => ({
            id: loc.id ?? `loc-${index}`, // fallback ID
            locationName: loc.locationName ?? loc.name ?? "Unknown place",
            address: loc.address ?? "Unknown address",
            distance: loc.distance ?? "",
            category: loc.category ?? "other",
            categoryIconUrl: loc.categoryIconUrl ?? "",
            // mock coordinates if missing
            latitude: loc.latitude ?? 37.422525 + index * 0.01,
            longitude: loc.longitude ?? -122.166915 + index * 0.01,
          }))
        : [],
    };
  }

  /**
   * Update user's status
   */
  static async updateStatus(
    userId: string,
    status: User["current_status"]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await db
        .from("users")
        .update({
          current_status: status,
          status_updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        console.error("Error updating status:", error);
        return { success: false, error: error.message };
      }

      console.log(`Status updated for user ${userId}:`, status);
      return { success: true };
    } catch (error) {
      console.error("Unexpected error in updateStatus:", error);
      return { success: false, error: "Unexpected error occurred" };
    }
  }

  /**
   * Update user's location
   */
  static async updateLocation(
    userId: string,
    latitude: number,
    longitude: number,
    address: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await db
        .from("users")
        .update({
          current_latitude: latitude,
          current_longitude: longitude,
          current_address: address,
        })
        .eq("id", userId);

      if (error) {
        console.error("Error updating location:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Unexpected error in updateLocation:", error);
      return { success: false, error: "Unexpected error occurred" };
    }
  }

  /**
   * Subscribe to status changes for all users (except current user)
   */
  static subscribeToFriendStatuses(
    userId: string,
    onStatusChange: (friendId: string, status: User["current_status"]) => void
  ) {
    console.log("Setting up friend status subscription for user:", userId);

    const subscription = db
      .channel("friend-status-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=neq.${userId}`,
        },
        (payload) => {
          const updatedUser = payload.new as User;
          console.log("Friend status updated:", {
            friendId: updatedUser.id,
            newStatus: updatedUser.current_status,
            timestamp: updatedUser.status_updated_at,
          });
          onStatusChange(updatedUser.id, updatedUser.current_status);
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      console.log("Unsubscribing from friend status updates");
      subscription.unsubscribe();
    };
  }

  /**
   * Refresh friend statuses
   */
  static async refreshFriendStatuses(
    userId: string,
    friendIds: string[]
  ): Promise<{
    success: boolean;
    statuses: Record<string, User["current_status"]>;
    error?: string;
  }> {
    if (friendIds.length === 0) {
      return { success: true, statuses: {} };
    }

    try {
      const { data, error } = await db
        .from("users")
        .select("id, current_status")
        .in("id", friendIds);

      if (error) {
        console.error("Error refreshing friend statuses:", error);
        return { success: false, error: error.message, statuses: {} };
      }

      const statusMap: Record<string, User["current_status"]> = {};
      data?.forEach((user) => {
        statusMap[user.id] = user.current_status;
      });

      console.log("Refreshed friend statuses:", statusMap);
      return { success: true, statuses: statusMap };
    } catch (error) {
      console.error("Unexpected error in refreshFriendStatuses:", error);
      return {
        success: false,
        error: "Unexpected error occurred",
        statuses: {},
      };
    }
  }

  /**
   * Get a single user by ID
   */
  static async getUserById(
    userId: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const { data, error } = await db
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user:", error);
        return { success: false, error: error.message };
      }

      return { success: true, user: data as User };
    } catch (error) {
      console.error("Unexpected error in getUserById:", error);
      return { success: false, error: "Unexpected error occurred" };
    }
  }

  /**
   * Get a single friend by ID (returns Friend type)
   */
  static async getFriendById(
    friendId: string
  ): Promise<{ success: boolean; friend?: Friend; error?: string }> {
    try {
      const { success, user, error } = await this.getUserById(friendId);

      if (!success || !user) {
        return { success: false, error: error || "User not found" };
      }

      const friend = this.userToFriend(user);
      return { success: true, friend };
    } catch (error) {
      console.error("Unexpected error in getFriendById:", error);
      return { success: false, error: "Unexpected error occurred" };
    }
  }

  /**
   * Update user's display name
   */
  static async updateDisplayName(
    userId: string,
    displayName: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await db
        .from("users")
        .update({ display_name: displayName })
        .eq("id", userId);

      if (error) {
        console.error("Error updating display name:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Unexpected error in updateDisplayName:", error);
      return { success: false, error: "Unexpected error occurred" };
    }
  }

  /**
   * Update user's profile icon
   */
  static async updateProfileIcon(
    userId: string,
    iconUrl: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await db
        .from("users")
        .update({ profile_icon_url: iconUrl })
        .eq("id", userId);

      if (error) {
        console.error("Error updating profile icon:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Unexpected error in updateProfileIcon:", error);
      return { success: false, error: "Unexpected error occurred" };
    }
  }

  /**
 * Upload profile avatar to Supabase Storage
 */
static async uploadProfileAvatar(
  userId: string,
  localUri: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Extract file extension
    const fileExtension = localUri.split('.').pop() || 'jpg';
    const fileName = `${userId}-${Date.now()}.${fileExtension}`;
    const filePath = `avatars/${fileName}`;

    // Read file as blob
    const response = await fetch(localUri);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();

    // Upload to Supabase Storage
    const { data, error } = await db.storage
      .from('profile-pictures')  // Changed from 'profile-avatars'
      .upload(filePath, arrayBuffer, {
        contentType: this.getMimeType(fileExtension),
        upsert: false,
      });

    if (error) {
      console.error('Error uploading avatar:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = db.storage
      .from('profile-pictures')  // Changed from 'profile-avatars'
      .getPublicUrl(filePath);

    return { success: true, url: urlData.publicUrl };
  } catch (error: any) {
    console.error('Unexpected error in uploadProfileAvatar:', error);
    return { success: false, error: error.message || 'Unexpected error occurred' };
  }
}

  /**
 * Update user profile (display name, address, profile icon)
 */
static async updateProfile(
  userId: string,
  updates: {
    display_name?: string;
    current_address?: string | null;
    profile_icon_url?: string | null;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await db
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }

    console.log(`Profile updated for user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in updateProfile:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

  /**
   * Get user's current status
   */
  static async getStatus(userId: string): Promise<{
    success: boolean;
    status?: User["current_status"];
    updatedAt?: string;
    error?: string;
  }> {
    try {
      const { data, error } = await db
        .from("users")
        .select("current_status, status_updated_at")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching status:", error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        status: data.current_status,
        updatedAt: data.status_updated_at,
      };
    } catch (error) {
      console.error("Unexpected error in getStatus:", error);
      return { success: false, error: "Unexpected error occurred" };
    }
  }

  /**
   * Helper: Get MIME type from file extension
   */
  private static getMimeType(extension: string): string {
    switch (extension.toLowerCase()) {
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "webp":
        return "image/webp";
      case "gif":
        return "image/gif";
      case "heic":
        return "image/heic";
      default:
        return "application/octet-stream";
    }
  }
}
