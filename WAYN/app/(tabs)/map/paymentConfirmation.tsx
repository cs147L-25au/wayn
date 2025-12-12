import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../../assets/theme";
import DualBottomCTA from "../../../components/buttons/dualBottomCTA";
import GiftCardRenderer from "../../../components/giftCardRenderer";
import OverlayHeader from "../../../components/navigation/overlayHeader";
import { useAuth } from "../../../contexts/authContext";
import { db } from "../../../utils/supabase";

// Gift card designs mapping (same as in giftCardCustomization)
const giftCardDesigns: Record<string, any> = {
  design1: {
    name: "Flowers",
    imageSource: require("../../../assets/images/image_placeholder.png"),
  },
  design2: {
    name: "Geometric",
    imageSource: require("../../../assets/images/image_placeholder.png"),
  },
};

export default function PaymentConfirmationScreen() {
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
    merchantId,
    merchantName,
    amount,
    designId,
    sessionId,
    collaboratorIds,
    giftCount,
    hostId,
  } = params;

  const formattedAmount =
    typeof amount === "string" ? parseFloat(amount).toFixed(2) : amount;

  const selectedDesign = designId
    ? giftCardDesigns[designId as string]
    : giftCardDesigns.design1;

  const handleSendGift = async () => {
    console.log("Send gift pressed");

    // Insert gift record into Supabase
    const giftData: any = {
      sender_display_name: currentUser?.display_name,
      receiver_display_name: friendName,
      sender_id: currentUser?.id,
      receiver_id: friendId,
      address: locationAddress,
      gift_type: "giftCard",
      latitude: parseFloat(locationLatitude as string),
      longitude: parseFloat(locationLongitude as string),
      content: {
        merchant: merchantName,
        amount: amount,
        designId: designId,
      },
    };

    try {
      const { data, error } = await db
        .from("sent_gifts")
        .insert([giftData])
        .select();
      if (error) {
        console.error("Error inserting sent_gifts:", error);
        return;
      }

      const giftId = data?.[0]?.id;
      console.log("param", giftId);

      console.log("Successfully inserted sent_gifts:", data);

      // Navigate to gift send animation screen
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
          giftType: "giftCard",
          giftId,
          designId,
          merchantName,
          amount,
        },
      });
    } catch (err) {
      console.error("Unexpected error inserting sent_gifts:", err);
    }
  };

  const handleAddGift = async () => {
    console.log("Add Gift pressed");

    //  Insert gift into gift basket table in supabase
    const giftItemData: any = {
      sender_display_name: currentUser?.display_name,
      receiver_display_name: friendName,
      sender_id: currentUser?.id,
      receiver_id: friendId,
      address: locationAddress,
      gift_type: "giftCard",
      content: {
        merchant: merchantName,
        amount: amount,
        designId: designId,
      },
      session_id: sessionId,
    };
    try {
      const { data, error } = await db
        .from("collab_gift_basket")
        .upsert(giftItemData, {
          onConflict: "session_id, sender_id, receiver_id, gift_type, address",
        })
        .select();
      if (error) {
        console.error("Error inserting collab_gift_basket:", error);
        // Even if upsert fails, try to get the latest count
      }

      console.log("Successfully inserted collab_gift_basket:", data);
      router.push({
        pathname: "/(tabs)/map/giftSelection",
        params: {
          friendName,
          friendId,
          friendIcon,
          locationName,
          locationAddress,
          locationLatitude,
          locationLongitude,
          sessionId,
          giftCount: Number(giftCount) + 1,
          collaboratorIds,
          hostId,
        },
      });
    } catch (err) {
      console.error("Unexpected error inserting collab_gift_basket:", err);
    }
  };

  const handleSaveAndExit = async () => {
    console.log("Save and exit pressed");
    const content: any = {
      merchant: merchantName,
      amount: amount,
      designId: designId,
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
        .upsert(giftDraftData, {
          onConflict: "id, sender_id, receiver_id, gift_type, address",
        })
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
        title="Payment"
        onBack={handleBack}
        onClose={handleClose}
      />

      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={theme.text.headline3}>Confirm Your Details</Text>
            <Text style={[theme.text.body2, styles.subtitle]}>
              You won't be charged until {friendName} accesses your gift.
            </Text>
          </View>

          {/* Payment Details Box */}
          <View style={styles.detailsBox}>
            {/* Item */}
            <View style={styles.detailRow}>
              <Text style={[theme.text.body3, styles.detailLabel]}>Item</Text>
              <Text style={[theme.text.body3Bold, styles.detailValue]}>
                {merchantName} Gift Card
              </Text>
            </View>

            {/* Amount */}
            <View style={styles.detailRow}>
              <Text style={[theme.text.body3, styles.detailLabel]}>Amount</Text>
              <Text style={[theme.text.body3Bold, styles.detailValue]}>
                ${formattedAmount}
              </Text>
            </View>

            {/* Payment Method */}
            <View style={styles.detailRow}>
              <Text style={[theme.text.body3, styles.detailLabel]}>
                Payment Method
              </Text>
              <Text style={[theme.text.body3Bold, styles.detailValue]}>
                Apple Pay
              </Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Tax */}
            <View style={styles.detailRow}>
              <Text style={[theme.text.body3, styles.detailLabel]}>Tax</Text>
              <Text style={[theme.text.body3Bold, styles.detailValue]}>
                $0.00
              </Text>
            </View>

            {/* Total */}
            <View style={styles.detailRow}>
              <Text style={[theme.text.body3Bold, styles.detailLabel]}>
                Total
              </Text>
              <Text style={[theme.text.body3Bold, styles.detailValue]}>
                ${formattedAmount}
              </Text>
            </View>
          </View>

          {/* Gift Card Preview */}
          <GiftCardRenderer
            designId={designId as string}
            amount={amount as string}
            merchantName={merchantName as string}
          />

          {/* Bottom padding to account for CTA bar */}
          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Dual CTA Bar */}
        {!collaboratorIds && (
          <DualBottomCTA
            primaryText="Send Gift"
            secondaryText="Save & Exit"
            onPrimaryPress={handleSendGift}
            onSecondaryPress={handleSaveAndExit}
          />
        )}

        {collaboratorIds && (
          <DualBottomCTA
            primaryText="Add Gift"
            secondaryText="Save & Exit"
            onPrimaryPress={handleAddGift}
            onSecondaryPress={handleSaveAndExit}
          />
        )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  headerSection: {
    gap: theme.spacing.sm,
  },
  subtitle: {
    color: theme.colors.textPrimary,
  },
  detailsBox: {
    borderRadius: theme.borderRadius.lg, // 24px
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  detailLabel: {
    color: theme.colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    color: theme.colors.textPrimary,
    textAlign: "right",
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: theme.spacing.sm,
  },
  giftCardPreview: {
    width: "100%",
    aspectRatio: 1.586, // Standard gift card ratio (roughly 16:10)
    borderRadius: theme.borderRadius.sm,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  giftCardImage: {
    width: "100%",
    height: "100%",
  },
  bottomPadding: {
    height: 100,
  },
});
