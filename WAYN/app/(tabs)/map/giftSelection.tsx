import SecondaryButton from "@/components/buttons/secondaryButtonS";
import GiftSelectionCard from "@/components/giftSelectionCard";
import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../../assets/theme";
import OverlayHeader from "../../../components/navigation/overlayHeader";
import { useAuth } from "../../../contexts/authContext";

export default function GiftSelectionScreen() {
  const { currentUser } = useAuth();
  const params = useLocalSearchParams();
  const {
    friendName,
    locationName,
    locationAddress,
    collaboratorIds,
    giftCount,
    hostName,
    hostId,
    sessionId: paramSessionId,
    locationCategory,
  } = params;
  const [collaboratorCount, setCollaboratorCount] = useState(0);
  const [currentGiftCount, setCurrentGiftCount] = useState(0); // New state for gift count
  const [sessionId, setSessionId] = useState<string | null>(
    (paramSessionId as string) || null
  );

  // This effect runs when the screen comes into focus.
  useFocusEffect(
    useCallback(() => {
      if (collaboratorIds && typeof collaboratorIds === "string") {
        try {
          const ids = JSON.parse(collaboratorIds);
          console.log("Received collaborator IDs:", ids);
          setCollaboratorCount(ids.length);
        } catch (e) {
          console.error("Failed to parse collaborator IDs:", e);
          setCollaboratorCount(0);
        }
      } else {
        setCollaboratorCount(0);
      }

      // Handle incoming giftCount
      if (giftCount && typeof giftCount === "string") {
        try {
          setCurrentGiftCount(parseInt(giftCount, 10));
        } catch (e) {
          console.error("Failed to parse gift count:", e);
          setCurrentGiftCount(0);
        }
      } else {
        setCurrentGiftCount(0);
      }

      // Handle incoming sessionId
      if (paramSessionId && typeof paramSessionId === "string") {
        setSessionId(paramSessionId);
      }
    }, [collaboratorIds, giftCount, paramSessionId])
  );

  const handleCollaborate = () => {
    console.log("Collaborate pressed");
    let currentSessionId = sessionId;
    if (!currentSessionId && currentUser && params.friendId) {
      currentSessionId = `${currentUser.id}-${params.friendId}-${Date.now()}`;
      setSessionId(currentSessionId);
      console.log("New session created:", currentSessionId);
    }
    router.push({
      pathname: "/(tabs)/map/collaboratorSelection",
      params: {
        friendName,
        friendId: params.friendId,
        locationName,
        locationAddress,
        locationLatitude: params.locationLatitude,
        locationLongitude: params.locationLongitude,
        collaboratorIds,
        sessionId: currentSessionId,
        giftCount,
        hostName: hostName,
        hostId: hostId,
      },
    });
    // Navigate to collaborate flow or show collaborate modal
    // router.push('/collaborate');
  };

  const handleChooseLetter = () => {
    if (!params.friendId) {
      return;
    }

    router.push({
      pathname: "/(tabs)/map/letterCompose",
      params: {
        friendName: friendName || "",
        friendId: params.friendId || "",
        friendIcon: params.friendIcon || "",
        locationName: locationName || "",
        locationAddress: locationAddress || "",
        locationLatitude: params.locationLatitude || "",
        locationLongitude: params.locationLongitude || "",
        collaboratorIds: collaboratorIds || "",
        sessionId: sessionId || "",
        giftCount: currentGiftCount,
        hostId: hostId,
      },
    });
  };

  const handleChooseGiftCard = () => {
    console.log("Chose Gift Card");
    router.push({
      pathname: "/(tabs)/map/merchantSelection",
      params: {
        giftType: "giftCard",
        friendName,
        friendId: params.friendId,
        friendIcon: params.friendIcon,
        locationName,
        locationAddress,
        locationLatitude: params.locationLatitude,
        locationLongitude: params.locationLongitude,
        locationCategory: params.locationCategory,
        collaboratorIds,
        sessionId,
        giftCount: currentGiftCount,
        hostId: hostId,
      },
    });
    // router.push({
    //   pathname: '/(tabs)', // Dummy path for now
    //   params: {
    //     giftType: 'giftCard',
    //     friendName,
    //     locationName,
    //     locationAddress,
    //   },
    // });
  };

  const handleChoosePlaylist = () => {
    console.log("Chose Playlist");
    router.push({
      pathname: "/(tabs)/map/playlistCompose",
      params: {
        friendName,
        friendId: params.friendId,
        friendIcon: params.friendIcon,
        locationName,
        locationAddress,
        locationLatitude: params.locationLatitude,
        locationLongitude: params.locationLongitude,
        collaboratorIds,
        sessionId,
        giftCount: currentGiftCount,
        hostId: hostId,
      },
    });
  };

  const handleChooseAudio = () => {
    console.log("Chose Audio Recording");
    router.push({
      pathname: "/(tabs)/map/audioCompose",
      params: {
        giftType: "audio",
        friendName,
        friendId: params.friendId,
        friendIcon: params.friendIcon,
        locationName,
        locationAddress,
        locationLatitude: params.locationLatitude,
        locationLongitude: params.locationLongitude,
        collaboratorIds,
        sessionId,
        giftCount: currentGiftCount,
        hostId: hostId,
      },
    });
  };

  const handleOpenGiftBasket = () => {
    console.log("Opening collaborative gift basket");
    router.push({
      pathname: "/(tabs)/map/collabGiftBasket", // Path to your ConfirmGiftScreen
      params: {
        ...params,
        collaboratorIds,
        giftCount: currentGiftCount,
        sessionId,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <OverlayHeader
        title="Send a Gift"
        onBack={() => router.back()}
        onClose={() =>
          router.push({
            pathname: "/(tabs)/map",
            params: { transition: "fade" },
          })
        }
      />

      <View style={styles.container}>
        {/* Sticky Header Section with Collaborate Button */}
        <View style={styles.stickyHeader}>
          <View style={styles.headerLeft}>
            <Text style={theme.text.headline3}>Send to {friendName}</Text>
            <View style={styles.locationInfo}>
              <Feather
                name="map-pin"
                size={theme.iconSize.sm}
                color={theme.colors.textSecondary}
              />
              <View style={styles.locationTextContainer}>
                <Text style={[theme.text.body3Bold, styles.locationName]}>
                  {locationName}
                </Text>
                <Text style={[theme.text.body3, styles.locationAddress]}>
                  {locationAddress}
                </Text>
              </View>
            </View>
          </View>

          {/* Collaborate Button using SecondaryButton component */}
          <View style={styles.buttonsContainer}>
            <View>
              <SecondaryButton
                title="Collaborate"
                onPress={handleCollaborate}
                leftIcon={
                  <Feather
                    name="users"
                    size={16}
                    color={theme.colors.waynOrange}
                  />
                }
              />
              {collaboratorCount > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{collaboratorCount}</Text>
                </View>
              )}
            </View>
            {/* Orange Gift Button */}
            {collaboratorCount > 0 && ( // Only show if there are gifts in the basket
              <TouchableOpacity
                style={styles.giftButton}
                onPress={handleOpenGiftBasket}
              >
                <Feather name="gift" size={20} color={theme.colors.white} />
                {currentGiftCount > 0 && ( // Conditionally render badge
                  <View style={styles.giftBadgeContainer}>
                    <Text style={styles.giftBadgeText}>{currentGiftCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Scrollable Gift Cards Section */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <GiftSelectionCard
            title="Letter"
            subtitle="Send a personalized, thoughtful message."
            imageSource={require("../../../assets/images/Letter Img.png")}
            onChoose={handleChooseLetter}
          />

          <GiftSelectionCard
            title="Gift Card"
            subtitle="Gift them a favorite place — or somewhere new."
            imageSource={require("../../../assets/images/Gift Card Img.png")}
            onChoose={handleChooseGiftCard}
          />

          <GiftSelectionCard
            title="Playlist"
            subtitle="Send a playlist for their vibe — mood, moment, or place."
            imageSource={require("../../../assets/images/Playlist Img.png")}
            onChoose={handleChoosePlaylist}
          />

          <GiftSelectionCard
            title="Audio Recording"
            subtitle="For when text just isn't enough."
            imageSource={require("../../../assets/images/Audio Img.png")}
            onChoose={handleChooseAudio}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  container: {
    flex: 1,
  },
  stickyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  buttonsContainer: {
    // Stack buttons vertically and align them to the right
    alignItems: "flex-end",
    gap: theme.spacing.lg,
  },
  giftButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.waynOrange,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: theme.colors.waynOrange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLeft: {
    flex: 1,
    gap: theme.spacing.md,
  },
  locationInfo: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    alignItems: "flex-start",
  },
  locationTextContainer: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  locationName: {
    color: theme.colors.textPrimary,
  },
  locationAddress: {
    color: theme.colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  badgeContainer: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: theme.colors.waynOrange,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  badgeText: {
    color: theme.colors.white,
    fontWeight: "bold",
    fontSize: 12,
  },
  giftBadgeContainer: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: theme.colors.waynOrange, // Or a different color if preferred
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  giftBadgeText: {
    color: theme.colors.white,
    fontWeight: "bold",
    fontSize: 12,
  },
});
