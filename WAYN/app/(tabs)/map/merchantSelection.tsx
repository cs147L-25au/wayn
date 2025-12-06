import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { theme } from "../../../assets/theme";
import { db } from "../../../utils/supabase";
import OverlayHeader from "../../../components/navigation/overlayHeader";
import MerchantItem from "../../../components/merchantItem";
import DualBottomCTA from "../../../components/buttons/dualBottomCTA";
import SearchBar from "../../../components/searchBar";
import { useAuth } from "../../../contexts/authContext";

interface Merchant {
  id: string;
  name: string;
  relevanceTag: string;
  categoryIconUrl: any;
  category?: string;
}

// Function to normalize names for comparison (removes spaces, punctuation, lowercase)
const normalizeName = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
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
  } = params;

  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Mock merchant data - only cafe, restaurant, shopping types
  const mockMerchants: Merchant[] = [
    {
      id: "blue-bottle",
      name: "Blue Bottle Coffee",
      relevanceTag: `${friendName} is a frequent visitor`,
      categoryIconUrl: require("../../../assets/images/cafe_icon.png"),
      category: "cafe",
    },
    {
      id: "coupa-cafe",
      name: "Coupa Café",
      relevanceTag: `${friendName} is a frequent visitor`,
      categoryIconUrl: require("../../../assets/images/cafe_icon.png"),
      category: "cafe",
    },
    {
      id: "trader-joes",
      name: "Trader Joe's",
      relevanceTag: `Similar to ${friendName}'s favorites`,
      categoryIconUrl: require("../../../assets/images/shopping_icon.png"),
      category: "shopping",
    },
    {
      id: "target",
      name: "Target",
      relevanceTag: `${friendName} is a frequent visitor`,
      categoryIconUrl: require("../../../assets/images/shopping_icon.png"),
      category: "shopping",
    },
    {
      id: "the-counter",
      name: "The Counter",
      relevanceTag: `${friendName} is a frequent visitor`,
      categoryIconUrl: require("../../../assets/images/restaurant_icon.png"),
      category: "restaurant",
    },
    {
      id: "starbucks",
      name: "Starbucks",
      relevanceTag: `${friendName} is a frequent visitor`,
      categoryIconUrl: require("../../../assets/images/cafe_icon.png"),
      category: "cafe",
    },
    {
      id: "chipotle",
      name: "Chipotle",
      relevanceTag: `${friendName} is a frequent visitor`,
      categoryIconUrl: require("../../../assets/images/restaurant_icon.png"),
      category: "restaurant",
    },
  ];

  // Filter out duplicates from mockMerchants if selected location is already in the list
  const filteredMockMerchants = mockMerchants.filter(
    (merchant) =>
      normalizeName(merchant.name) !== normalizeName(locationName as string)
  );

  // Build final merchants list - ALWAYS show selected location at top
  const merchantsList: Merchant[] = [
    // Always include selected location first
    {
      id: "selected-location",
      name: locationName as string,
      relevanceTag: "Your selected location",
      categoryIconUrl: require("../../../assets/images/placeholderIcon.png"),
      category: locationCategory as string,
    },
    // Then add filtered mock merchants (only cafe, restaurant, shopping)
    ...filteredMockMerchants,
  ];

  // Filter merchants based on search query
  const filteredMerchants = merchantsList.filter(
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
          sessionId,
          collaboratorIds,
          giftCount,
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
