import { router, useLocalSearchParams } from "expo-router";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../../assets/theme";
import DualBottomCTA from "../../../components/buttons/dualBottomCTA";
import GiftVisual from "../../../components/GiftVisual";
import OverlayHeader from "../../../components/navigation/overlayHeader";
import { useAuth } from "../../../contexts/authContext";
import { UserService } from "../../../services/userService";
import { db } from "../../../utils/supabase";

// gift entries as stored in supabase
interface GiftCollab {
  id: number;
  created_at: any;
  session_id: any;
  type: "giftCard" | "letter" | "audioRecording" | "playlist";
  giftImage?: any;
  receiver: any;
  sender_profile: any;
  sender: any;
  sender_id: any;
  content: any;
}

const getGiftType = (gift: GiftCollab) => {
  switch (gift.type) {
    case "giftCard":
      return `${gift.content.merchantName || ""} Gift Card`;
    case "letter":
      return "Letter";
    case "audioRecording":
      return "Audio Recording";
    case "playlist":
      return "Playlist";
  }
};

export default function ConfirmGiftScreen() {
  const { currentUser } = useAuth();
  const [gifts, setGifts] = useState<GiftCollab[]>([]);
  const [isCollaborator, setIsCollaborator] = useState(false);
  const [parsedIds, setParsedIds] = useState<String[]>([]);

  const params = useLocalSearchParams();
  const {
    friendName,
    friendId,
    friendIcon,
    locationName,
    locationAddress,
    locationLatitude,
    locationLongitude,
    giftId,
    giftType,
    collaboratorIds,
    sessionId,
    hostName,
    hostId,
  } = params;

  useEffect(() => {
    if (!params.collaboratorIds) return;

    // Normalize to a single string
    const collaboratorIdsStr = Array.isArray(params.collaboratorIds)
      ? params.collaboratorIds[0]
      : params.collaboratorIds;

    try {
      const parsed = JSON.parse(collaboratorIdsStr);
      setParsedIds(parsed);
    } catch (err) {
      console.error("Failed to parse collaboratorIds:", err);
    }
  }, [params.collaboratorIds]);

  useEffect(() => {
    if (!currentUser?.id) return;
    if (!parsedIds.length) return;

    const userId = currentUser.id;
    const isCollab = parsedIds.includes(userId);
    setIsCollaborator(isCollab);

    console.log("parsedIds:", parsedIds);
    console.log("currentUser.id:", currentUser.id);
    console.log("isCollaborator:", isCollab);
  }, [parsedIds, currentUser?.id]);

  useEffect(() => {
    const loadGifts = async () => {
      if (!currentUser) return;

      // // --- Hardcoded Gifts for Collaborators ---
      let collaboratorGifts: GiftCollab[] = [];
      // if (collaboratorIds && typeof collaboratorIds === "string") {
      //   try {
      //     const parsedIds = JSON.parse(collaboratorIds);
      //     if (Array.isArray(parsedIds)) {
      //       collaboratorGifts = await Promise.all(
      //         parsedIds.map(async (id: string, index: number) => {
      //           const { user } = await UserService.getUserById(id);

      //           // Random Gift Generation
      //           const giftTypes: GiftCollab["type"][] = [
      //             "giftCard",
      //             "letter",
      //             "audioRecording",
      //             "playlist",
      //           ];
      //           const randomType =
      //             giftTypes[Math.floor(Math.random() * giftTypes.length)];
      //           let mockContent: any = {};
      //           const senderName = user?.display_name || "a friend";

      //           switch (randomType) {
      //             case "letter":
      //               mockContent = {
      //                 text: `A special letter from ${senderName}.`,
      //               };
      //               break;
      //             case "giftCard":
      //               mockContent = { merchantName: "Starbucks" };
      //               break;
      //             case "audioRecording":
      //               mockContent = {
      //                 text: `An audio message from ${senderName}.`,
      //               };
      //               break;
      //             case "playlist":
      //               mockContent = {
      //                 text: `A playlist curated by ${senderName}.`,
      //               };
      //               break;
      //           }

      //           // Create a mock gift for this collaborator
      //           const mockGift: GiftCollab = {
      //             id: -(index + 1), // Use negative IDs to avoid collision with real gifts
      //             created_at: new Date().toISOString(),
      //             session_id: sessionId,
      //             receiver: friendName,
      //             sender_profile: user?.profile_icon_url || "",
      //             sender_id: id,
      //             sender: user?.display_name || "Collaborator",
      //             type: randomType,
      //             content: mockContent,
      //           };
      //           return mockGift;
      //         })
      //       );
      //     }
      //   } catch (e) {
      //     console.error("Failed to parse collaborator IDs for mock gifts:", e);
      //   }
      // }
      // --- End of Hardcoded Gifts ---

      // Fetch gifts from backend using sessionId
      console.log("Loading gifts for session:", sessionId);
      const { data, error } = await db
        .from("collab_gift_basket")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching gifts:", error);
        return;
      }

      // For each gift row, fetch the sender's profile via helper
      const resolvedGifts = await Promise.all(
        data.map(async (row) => {
          // Fetch full recipient user profile
          const { success, friend, error } = await UserService.getFriendById(
            row.sender_id
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
            created_at: row.created_at,
            session_id: row.session_id,
            receiver: row.receiver_display_name,
            sender_profile: iconUri,
            sender_id: row.sender_id,
            sender: row.sender_display_name,
            type: row.gift_type,
            content: row.content,
            address: row.address,
          };
          return resolvedGift;
        })
      );
      console.log("Fetched Gifts: ", resolvedGifts);
      setGifts([...resolvedGifts, ...collaboratorGifts]);
    };
    loadGifts();
  }, [currentUser?.id, sessionId]);

  const handleBack = () => {
    console.log("Back pressed");
    console.log("Params:", params);
    router.navigate({
      pathname: "/(tabs)/map/giftSelection",
      params: {
        ...params,
        giftCount: gifts.length.toString(),
        transition: "slide_from_left",
      },
    });
  };

  const handleClose = () => {
    console.log("Close pressed");
    router.navigate({
      pathname: "/(tabs)/map",
      params: {
        ...params,
        giftCount: gifts.length.toString(),
      },
    });
  };

  const handleModify = (id: string) => {
    console.log("Modify gift:", id);
  };

  const handleRemove = (id: number) => {
    Alert.alert("Delete Draft", "Are you sure you want to remove this gift?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          // Delete from supabase
          const giftId_num = Number(id);
          const { error, count } = await db
            .from("collab_gift_basket")
            .delete({ count: "exact" })
            .eq("id", giftId_num);
          console.log("Deleted", count);

          if (error) {
            console.error("Error deleting draft:", error);
            Alert.alert("Error", "Failed to delete draft.");
            return;
          }

          // remove from local state
          setGifts((prev) => prev.filter((gift) => gift.id !== id));
        },
      },
    ]);
  };

  const handleView = (id: string) => {
    console.log("View gift:", id);
  };

  const handleDoneAdding = () => {
    console.log("Done adding pressed");
    router.navigate({
      pathname: "/(tabs)/map",
      params: {
        ...params,
        giftCount: gifts.length.toString(),
      },
    });
  };

  const handleSendGift = async () => {
    console.log("Send gift pressed");

    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to send a gift.");
      return;
    }

    // 1. Parse collaborator IDs from the params
    let parsedCollaboratorIds: string[] = [];
    if (typeof collaboratorIds === "string") {
      try {
        parsedCollaboratorIds = JSON.parse(collaboratorIds);
      } catch (e) {
        console.error("Failed to parse collaborator IDs", e);
      }
    }

    // 2. Create a full list of all participants, including the host (current user)
    const allParticipantIds = [currentUser.id, ...parsedCollaboratorIds].filter(
      (id, index, self) => self.indexOf(id) === index
    ); // Ensure unique IDs

    // 3. Fetch display names for all participants
    const participantProfiles = await Promise.all(
      allParticipantIds.map(async (id) => {
        const { user } = await UserService.getUserById(id);
        return user ? { id: user.id, name: user.display_name } : null;
      })
    );

    const validParticipants = participantProfiles.filter(Boolean);

    // 4. Construct the gift data with the new structure
    const collaboratorProfiles = validParticipants.filter(
      (p) => p!.id !== currentUser.id
    );

    const giftData: any = {
      receiver_display_name: friendName,
      receiver_id: friendId,
      sender_display_names: {
        host: currentUser.display_name,
        collaborators: collaboratorProfiles.map((p) => p!.name),
      },
      sender_ids: {
        host: currentUser.id,
        collaborators: collaboratorProfiles.map((p) => p!.id),
      },
      address: locationAddress,
      session_id: sessionId,
      latitude: parseFloat(locationLatitude as string),
      longitude: parseFloat(locationLongitude as string),
      content: {
        gifts: gifts,
      },
    };

    try {
      const { data, error } = await db
        .from("sent_gifts_collab")
        .insert([giftData])
        .select();

      if (error) {
        console.error("Error inserting sent_gifts_collab:", error);
        Alert.alert("Error", "Failed to send group gift");
        return;
      }

      console.log("Successfully inserted sent_gifts_collab:", data);
      const newGiftId = data?.[0]?.id;

      router.push({
        pathname: "/(tabs)/map/giftSendAnimation",
        params: {
          friendName,
          friendId,
          friendIcon,
          locationName,
          locationAddress,
          locationLatitude,
          locationLongitude,
          giftId: newGiftId,
          isCollaborative: "true",
        },
      });
    } catch (err) {
      console.error("Unexpected error inserting sent_gifts_collab:", err);
      Alert.alert("Error", "Failed to send gift");
    }

    console.log(
      "Sending collaborative gift:",
      JSON.stringify(giftData, null, 2)
    );
  };

  const handleSaveAndExit = async () => {
    console.log("Save & Exit pressed");

    // 1. Parse collaborator IDs from the params
    let parsedCollaboratorIds: string[] = [];
    if (typeof collaboratorIds === "string") {
      try {
        parsedCollaboratorIds = JSON.parse(collaboratorIds);
      } catch (e) {
        console.error("Failed to parse collaborator IDs", e);
      }
    }

    // 2. Create a full list of all participants, including the host (current user)
    const allParticipantIds = [
      currentUser?.id,
      ...parsedCollaboratorIds,
    ].filter((id, index, self) => self.indexOf(id) === index); // Ensure unique IDs

    // 3. Fetch display names for all participants
    const participantProfiles = await Promise.all(
      allParticipantIds.map(async (id) => {
        const { user } = await UserService.getUserById(id ?? "");
        return user ? { id: user.id, name: user.display_name } : null;
      })
    );

    const validParticipants = participantProfiles.filter(Boolean);

    // 4. Construct the gift data with the new structure
    const collaboratorProfiles = validParticipants.filter(
      (p) => p!.id !== currentUser?.id
    );

    const giftData: any = {
      receiver_display_name: friendName,
      receiver_id: friendId,
      sender_display_names: {
        host: currentUser?.display_name,
        collaborators: collaboratorProfiles.map((p) => p!.name),
      },
      sender_ids: {
        host: currentUser?.id,
        collaborators: collaboratorProfiles.map((p) => p!.id),
      },
      address: locationAddress,
      session_id: sessionId,
      content: {
        gifts: gifts,
      },
    };

    try {
      const { data, error } = await db
        .from("gift_drafts_collab")
        .insert([giftData])
        .select();

      if (error) {
        console.error("Error inserting gift_drafts_collab", error);
        Alert.alert("Error", "Failed to save gift");
        return;
      }

      console.log("Successfully inserted gift_drafts_collab:", data);
      const newGiftId = data?.[0]?.id;

      router.push("/(tabs)/map");
    } catch (err) {
      console.error("Unexpected error inserting gift_drafts_collab:", err);
      Alert.alert("Error", "Failed to send gift");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <OverlayHeader
        title={`Gift to ${friendName}`}
        onBack={handleBack}
        onClose={handleClose}
      />

      {/* Gifts List or Empty State */}
      {gifts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No gifts added yet.</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {gifts.map((gift) => (
            <View key={gift.id} style={styles.card}>
              {/* Sender Badge */}
              <View style={styles.senderBadge}>
                <Image
                  source={{ uri: gift.sender_profile }}
                  style={styles.avatar}
                />
                <View>
                  <Text style={styles.recipientName}>
                    {gift.sender_id === currentUser?.id ? "You" : gift.sender}
                  </Text>
                </View>
              </View>

              {/* Gift Image */}
              <GiftVisual type={gift.type} />
              {/* Title */}
              <Text style={styles.giftTitle}>{getGiftType(gift)}</Text>

              {/* Button */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleRemove(gift.id)}
                >
                  <Text style={styles.buttonText}>Remove</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleView(gift.id.toString())}
                >
                  <Text style={styles.buttonText}>Modify</Text>
                </TouchableOpacity> */}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Bottom Buttons */}
      {!isCollaborator && (
        <View style={styles.bottomContainer}>
          <DualBottomCTA
            primaryText="Send Gift"
            secondaryText="Save & Exit"
            onPrimaryPress={handleSendGift}
            onSecondaryPress={handleSaveAndExit}
            primaryDisabled={gifts.length === 0}
          />
        </View>
      )}

      {isCollaborator && (
        <View style={styles.bottomContainer}>
          <DualBottomCTA
            primaryText="Done Adding"
            secondaryText="Save & Exit"
            onPrimaryPress={handleDoneAdding}
            onSecondaryPress={handleSaveAndExit}
            primaryDisabled={gifts.length === 0}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingBottom: 16,
    marginVertical: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },

  senderBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: theme.colors.waynBlue,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },

  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 6,
  },
  giftImage: {
    width: "100%",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    marginTop: 5,
    alignSelf: "center",
    borderWidth: 2,
    borderColor: theme.colors.waynOrange,
    borderRadius: 24,
    paddingVertical: 6,
    paddingHorizontal: 26,
  },
  buttonText: {
    ...theme.text.buttonMedium,
    color: theme.colors.waynOrange,
    marginTop: 3,
  },
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  recipientName: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },
  giftTitle: {
    padding: 10,
    marginLeft: 10,
    marginTop: 8,
    ...theme.text.headline3,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100, // Offset for the bottom CTA
  },
  emptyText: {
    ...theme.text.body1,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});
