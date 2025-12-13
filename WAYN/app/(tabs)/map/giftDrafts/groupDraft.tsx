import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
console.log("Text is:", Text);

import { theme } from "../../../../assets/theme";
import GiftVisual, { GiftType } from "../../../../components/GiftVisual";
import { useAuth } from "../../../../contexts/authContext";
import { UserService } from "../../../../services/userService";
import { db } from "../../../../utils/supabase";

export interface Gift {
  id: number;
  receiver: any;
  receiver_id?: string;
  collaborators: any;
  receiver_profile: any;
  createdDays: number;
  content: any;
  address?: string;
  latitude?: number;
  longitude?: number;
  type_image_display: GiftType;
}

function getDaysAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Fetching gift drafts from supabse
export default function GroupGiftsScreen() {
  const { currentUser } = useAuth();
  const [gifts, setGifts] = useState<Array<Gift>>([]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchGifts = async () => {
      const { data, error } = await db
        .from("gift_drafts_collab")
        .select("*")
        .eq("sender_ids->>host", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching gifts:", error);
        return;
      }

      // For each gift row, fetch the recipient's profile via helper
      const resolvedGifts = await Promise.all(
        data.map(async (row) => {
          // Fetch full recipient user profile
          const { success, friend, error } = await UserService.getFriendById(
            row.receiver_id
          );

          if (!success || !friend) {
            console.warn("Failed to fetch friend for gift:", error);
          }

          // Extract icon URI - Friend.icon can be string, number, or { uri: string }
          let iconUri = "";
          if (friend?.icon) {
            if (typeof friend.icon === "string") {
              iconUri = friend.icon;
            } else if (typeof friend.icon === "number") {
              iconUri = friend.icon.toString();
            } else if (
              typeof friend.icon === "object" &&
              friend.icon !== null &&
              "uri" in friend.icon
            ) {
              iconUri = (friend.icon as { uri: string }).uri;
            }
          }

          const resolvedGift = {
            id: Number(row.id),
            receiver: row.receiver_display_name,
            receiver_id: row.receiver_id,
            receiver_profile: iconUri,
            collaborators: row.sender_display_names.collaborators,
            createdDays: getDaysAgo(row.created_at),
            content: row.content,
            address: row.address,
            latitude: row.latitude,
            longitude: row.longitude,
            type_image_display: row.gift_type,
          };

          return resolvedGift;
        })
      );
      console.log("Resolved Gifts: ", resolvedGifts);
      setGifts(resolvedGifts);
    };

    fetchGifts();
  }, []);

  const handleDelete = (giftId: number) => {
    Alert.alert("Delete Draft", "Are you sure you want to delete this draft?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          // Delete from supabase
          const giftId_num = Number(giftId);
          const { error, count } = await db
            .from("gift_drafts_collab")
            .delete({ count: "exact" })
            .eq("id", giftId_num);
          console.log("Deleted", count);
          console.log("Deleting id:", giftId, typeof giftId);

          if (error) {
            console.error("Error deleting draft:", error);
            Alert.alert("Error", "Failed to delete draft.");
            return;
          }

          // remove from local state
          setGifts((prev) => prev.filter((gift) => gift.id !== giftId));
        },
      },
    ]);
  };

  const handleResume = async (gift: Gift) => {
    Alert.alert("Resume gift creation feature coming soon!");
    return;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {gifts.length > 0 ? (
          gifts.map((gift) => (
            <View key={gift.id} style={styles.giftCard}>
              <GiftVisual type={gift.type_image_display} />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Image
                    source={{ uri: gift.receiver_profile }}
                    style={styles.avatarImage}
                  />
                  <View style={styles.textContainer}>
                    <Text style={styles.giftTitle}>
                      Gift to {gift.receiver}
                    </Text>
                    <Text style={styles.collaboratorsText}>
                      Collaborating with {gift.collaborators.join(", ")}
                    </Text>
                  </View>
                </View>

                <Text style={styles.createdText}>
                  Created {gift.createdDays} days ago
                </Text>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleDelete(gift.id)}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleResume(gift)}
                  >
                    <Text style={styles.buttonText}>Resume</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text style={{ fontSize: 16, color: "#6b7280" }}>
              You have no drafts yet.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  giftCard: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  imagePlaceholder: {
    height: 128,
    backgroundColor: "#d1d5db",
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#9ca3af",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#e5e5e5",
  },
  giftTitle: {
    ...theme.text.body1Bold,
  },
  createdText: {
    ...theme.text.body2,
    color: "#6b7280",
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: theme.colors.waynOrange,
    borderRadius: 24,
    alignItems: "center",
  },
  buttonText: {
    ...theme.text.buttonMedium,
    color: theme.colors.waynOrange,
  },
  collaboratorsText: {
    ...theme.text.body2,
    color: "#4b5563",
  },
  textContainer: {
    flex: 1, // Allow this container to take up the remaining space
    gap: 4, // Add some space between the title and collaborators text
  },
});
