import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../../assets/theme";
import DualBottomCTA from "../../../components/buttons/dualBottomCTA";
import MerchantItem from "../../../components/merchantItem";
import OverlayHeader from "../../../components/navigation/overlayHeader";
import SearchBar from "../../../components/searchBar";
import { useAuth } from "../../../contexts/authContext";
import { PlacesService } from "../../../services/placesService";
import { db } from "../../../utils/supabase";

interface Merchant {
  id: string;
  name: string;
  relevanceTag: string;
  categoryIconUrl: any;
  category?: string;
  rating?: number;
  address?: string;
  distanceMeters?: number;
}

const MERCHANT_CATEGORIES = ["cafe", "restaurant", "shopping"];

// Function to normalize names for comparison
const normalizeName = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
};

const formatDistance = (meters?: number) => {
  if (!meters) return "";

  const miles = meters / 1609.34; // meters → miles

  if (miles < 0.1) {
    // Show in feet for really close distances
    const feet = meters * 3.28084;
    return `${Math.round(feet)} ft away`;
  }

  return `${miles.toFixed(2)} miles away`;
};

// Get category icon based on category string
const getCategoryIcon = (category: string) => {
  switch (category) {
    case "cafe":
      return require("../../../assets/images/cafe_icon.png");
    case "restaurant":
      return require("../../../assets/images/restaurant_icon.png");
    case "shopping":
      return require("../../../assets/images/shopping_icon.png");
    default:
      return require("../../../assets/images/placeholderIcon.png");
  }
};

export default function MerchantSelectionScreen() {
  const { currentUser } = useAuth();
  const params = useLocalSearchParams();
  const {
    friendName,
    friendId,
    friendIcon,
    locationName,
    locationAddress,
    locationLatitude,
    locationLongitude,
    locationCategory,
    sessionId,
    collaboratorIds,
    giftCount,
    hostId,
  } = params;

  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");

  useEffect(() => {
    setCategory(locationCategory);
  }, [locationCategory]);

  // Load nearby merchants on mount
  useEffect(() => {
    loadNearbyMerchants();
  }, [locationLatitude, locationLongitude]);

  const loadNearbyMerchants = async () => {
    setLoading(true);

    try {
      const lat = parseFloat(locationLatitude as string);
      const lng = parseFloat(locationLongitude as string);

      if (isNaN(lat) || isNaN(lng)) {
        console.error("Invalid coordinates");
        setLoading(false);
        return;
      }

      // Fetch nearby merchants from Google Places API
      const result = await PlacesService.getNearbyMerchants(lat, lng, 2000, [
        "cafe",
        "restaurant",
        "clothing_store",
        "shoe_store",
        "book_store",
        "jewelry_store",
        "department_store",
        "shopping_mall",
        "supermarket",
      ]);

      if (result.success && result.merchants) {
        // Transform PlaceMerchant to Merchant format
        const transformedMerchants: Merchant[] = result.merchants
          .filter(
            (place) =>
              // Filter out the selected location if it appears in results
              normalizeName(place.name) !==
              normalizeName(locationName as string)
          )
          .map((place) => ({
            id: place.id,
            name: place.name,
            relevanceTag: place.rating
              ? `⭐ ${place.rating.toFixed(1)} · ${
                  place.userRatingsTotal || 0
                } reviews · ${formatDistance(place.distanceMeters)}`
              : `${formatDistance(place.distanceMeters)}`,
            distanceMeters: place.distanceMeters,
            categoryIconUrl: getCategoryIcon(place.category),
            category: place.category,
            rating: place.rating,
            address: place.address,
          }));

        // Add the selected location at the top
        const selectedLocationMerchant: Merchant = {
          id: "selected-location",
          name: locationName as string,
          relevanceTag: "Your selected location",
          categoryIconUrl: getCategoryIcon(
            (locationCategory as string) || "other"
          ),
          category: locationCategory as string,
        };

        // Add the current location as recommended only if it's a merchant
        let merchantsList = [...transformedMerchants];
        console.log("locationCategory", locationCategory);
        if (locationCategory && MERCHANT_CATEGORIES.includes(category)) {
          const selectedLocationMerchant: Merchant = {
            id: "selected-location",
            name: locationName as string,
            relevanceTag: "Your selected location",
            categoryIconUrl: getCategoryIcon(locationCategory),
            category: locationCategory,
            rating: undefined,
            address: locationAddress,
            distanceMeters: 0,
          };

          // Add to top
          merchantsList = [selectedLocationMerchant, ...merchantsList];
        }

        setMerchants(merchantsList);
      } else {
        console.error("Failed to load merchants:", result.error);
        Alert.alert(
          "Failed to Load Merchants",
          "Unable to fetch nearby merchants. Please try again.",
          [
            { text: "Retry", onPress: loadNearbyMerchants },
            { text: "Cancel", style: "cancel" },
          ]
        );

        // Fallback to just showing the selected location
        setMerchants([
          // {
          //   id: "selected-location",
          //   name: locationName as string,
          //   relevanceTag: "Your selected location",
          //   categoryIconUrl: getCategoryIcon(
          //     (locationCategory as string) || "other"
          //   ),
          //   category: locationCategory as string,
          // },
        ]);
      }
    } catch (error) {
      console.error("Error loading merchants:", error);
      Alert.alert(
        "Error",
        "An error occured when trying to recommend merchants. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter merchants based on search query
  const filteredMerchants = merchants.filter(
    (merchant) =>
      merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      merchant.relevanceTag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMerchantSelect = (merchantId: string) => {
    setSelectedMerchantId(merchantId);
  };

  const handleNext = () => {
    if (selectedMerchantId) {
      const selectedMerchant = filteredMerchants.find(
        (m) => m.id === selectedMerchantId
      );
      console.log("Next pressed with merchant:", selectedMerchantId);
      router.push({
        pathname: "/(tabs)/map/giftCardCustomization",
        params: {
          friendName,
          friendId,
          friendIcon,
          locationName,
          locationAddress,
          locationLatitude,
          locationLongitude,
          merchantId: selectedMerchantId,
          merchantName: selectedMerchant?.name || "Merchant",
          merchantAddress: selectedMerchant?.address || locationAddress,
          sessionId,
          collaboratorIds,
          giftCount,
          hostId,
        },
      });
    }
  };

  const handleSaveAndExit = async () => {
    if (selectedMerchantId) {
      const selectedMerchant = filteredMerchants.find(
        (m) => m.id === selectedMerchantId
      );
      console.log("Save and exit pressed");
      const content: any = {
        merchantName: selectedMerchant?.name || "Merchant",
        merchantAddress: selectedMerchant?.address || locationAddress,
      };

      const giftDraftData: any = {
        sender_display_name: currentUser?.display_name,
        receiver_display_name: friendName,
        sender_id: currentUser?.id,
        receiver_id: friendId,
        address: locationAddress,
        gift_type: "giftCard",
        content: content,
      };
      try {
        const { data, error } = await db
          .from("gift_drafts")
          .insert([giftDraftData])
          .select();
        if (error) {
          console.error("Error inserting gift_drafts:", error);
          return;
        }
        console.log("Successfully inserted gift_drafts:", data);

        router.push("/(tabs)/map");
      } catch (err) {
        console.error("Unexpected error inserting sent_gifts:", err);
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleClose = () => {
    router.push("/(tabs)/map");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <OverlayHeader
        title="Gift Card"
        onBack={handleBack}
        onClose={handleClose}
      />

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={theme.text.headline3}>Select Merchant</Text>
        </View>

        <View style={styles.searchWrapper}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search merchants..."
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[theme.text.body2, styles.loadingText]}>
              Finding nearby merchants...
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <Text style={[theme.text.headline3, styles.sectionTitle]}>
              Recommended
            </Text>

            {filteredMerchants.map((merchant) => (
              <MerchantItem
                key={merchant.id}
                merchantName={merchant.name}
                relevanceTag={merchant.relevanceTag}
                categoryIconUrl={merchant.categoryIconUrl}
                isSelected={selectedMerchantId === merchant.id}
                onPress={() => handleMerchantSelect(merchant.id)}
              />
            ))}

            {filteredMerchants.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={[theme.text.body2, styles.emptyText]}>
                  No merchants found
                </Text>
              </View>
            )}

            <View style={styles.bottomPadding} />
          </ScrollView>
        )}

        <DualBottomCTA
          primaryText="Next"
          secondaryText="Save and Exit"
          onPrimaryPress={handleNext}
          onSecondaryPress={handleSaveAndExit}
          primaryDisabled={!selectedMerchantId}
          secondaryDisabled={!selectedMerchantId}
        />
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
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  searchWrapper: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xl * 2,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  sectionTitle: {
    marginBottom: 0,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  bottomPadding: {
    height: 100,
  },
});
