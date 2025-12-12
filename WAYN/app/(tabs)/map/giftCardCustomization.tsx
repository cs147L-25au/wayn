import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../../assets/theme";
import DualBottomCTA from "../../../components/buttons/dualBottomCTA";
import SelectableAmountButton from "../../../components/buttons/selectableButton";
import DesignThumbnail from "../../../components/designThumbnail";
import NumberInputField from "../../../components/fields/numInputField";
import OverlayHeader from "../../../components/navigation/overlayHeader";
import { useAuth } from "../../../contexts/authContext";
import { db } from "../../../utils/supabase";

import GiftCardRenderer from "@/components/giftCardRenderer";

interface GiftCardDesign {
  id: string;
  name: string;
  imageSource: any;
  thumbnailSource: any;
}

const PRESET_AMOUNTS = [5, 10, 25, 100];

export default function GiftCardCustomizationScreen() {
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
    sessionId,
    collaboratorIds,
    giftCount,
    hostId,
  } = params;

  const [selectedDesignId, setSelectedDesignId] = useState<string>("design1");
  const [selectedPresetAmount, setSelectedPresetAmount] = useState<
    number | null
  >(null);
  const [customAmount, setCustomAmount] = useState<string>("");

  // Mock gift card designs
  const giftCardDesigns: GiftCardDesign[] = [
    {
      id: "design1",
      name: "Flowers",
      imageSource: require("../../../assets/images/image_placeholder.png"),
      thumbnailSource: require("../../../assets/images/image_placeholder.png"),
    },
    {
      id: "design2",
      name: "Geometric",
      imageSource: require("../../../assets/images/image_placeholder.png"),
      thumbnailSource: require("../../../assets/images/image_placeholder.png"),
    },
  ];

  const selectedDesign = giftCardDesigns.find((d) => d.id === selectedDesignId);

  const handleDesignSelect = (designId: string) => {
    setSelectedDesignId(designId);
  };

  const handlePresetAmountSelect = (amount: number) => {
    setSelectedPresetAmount(amount);
    setCustomAmount(""); // Clear custom amount when preset is selected
  };

  const handleCustomAmountChange = (text: string) => {
    setCustomAmount(text);
    if (text) {
      setSelectedPresetAmount(null); // Clear preset selection when custom is entered
    }
  };

  const handleNext = () => {
    const amount = customAmount || selectedPresetAmount;
    if (amount) {
      console.log(
        "Next pressed with amount:",
        amount,
        "and design:",
        selectedDesignId
      );
      router.push({
        pathname: "/(tabs)/map/paymentConfirmation",
        params: {
          friendName,
          friendId,
          friendIcon,
          locationName,
          locationAddress,
          locationLatitude,
          locationLongitude,
          merchantId,
          merchantName,
          amount: customAmount || selectedPresetAmount?.toString(),
          designId: selectedDesignId,
          sessionId,
          collaboratorIds,
          giftCount,
          hostId,
        },
      });
    }
  };

  const handleSaveAndExit = async () => {
    console.log("Save and exit pressed");

    const content: any = {
      merchant: merchantName,
    };
    if (selectedPresetAmount || customAmount) {
      content.amount = customAmount || selectedPresetAmount;
    }
    if (selectedDesignId) {
      content.designId = selectedDesignId;
    }
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

  const currentAmount = customAmount || selectedPresetAmount?.toString() || "0";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <OverlayHeader
        title="Gift Card"
        onBack={handleBack}
        onClose={handleClose}
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <Text style={theme.text.headline3}>
              Customize {merchantName || "Merchant"} Gift Card
            </Text>

            {/* Gift Card Preview */}
            <GiftCardRenderer
              designId={selectedDesignId}
              amount={currentAmount}
              merchantName={merchantName as string}
            />

            {/* Design Selection */}
            <View style={styles.designSection}>
              <View style={styles.designRow}>
                {giftCardDesigns.map((design) => (
                  <DesignThumbnail
                    key={design.id}
                    imageSource={design.thumbnailSource}
                    label={design.name}
                    isSelected={selectedDesignId === design.id}
                    onPress={() => handleDesignSelect(design.id)}
                  />
                ))}
                <DesignThumbnail
                  label="Create Your Own"
                  isSelected={false}
                  isCreateNew
                  onPress={() => console.log("Create your own pressed")}
                />
              </View>
            </View>

            {/* Amount Selection */}
            <View style={styles.amountSection}>
              <Text style={theme.text.headline3}>Select Amount</Text>

              {/* Preset Amounts */}
              <View style={styles.presetAmountsRow}>
                {PRESET_AMOUNTS.map((amount) => (
                  <SelectableAmountButton
                    key={amount}
                    amount={amount}
                    isSelected={selectedPresetAmount === amount}
                    onPress={() => handlePresetAmountSelect(amount)}
                  />
                ))}
              </View>

              {/* Custom Amount Input */}
              <NumberInputField
                value={customAmount}
                onChangeText={handleCustomAmountChange}
                placeholder="Enter custom amount"
                allowDecimals={true}
                leftContent={<Text style={styles.dollarSign}>$</Text>}
                returnKeyType="done"
              />
            </View>

            {/* Bottom padding to account for CTA bar */}
            <View style={styles.bottomPadding} />
          </ScrollView>

          {/* Dual CTA Bar */}
          <DualBottomCTA
            primaryText="Next"
            secondaryText="Save and Exit"
            onPrimaryPress={handleNext}
            onSecondaryPress={handleSaveAndExit}
            primaryDisabled={!currentAmount}
          />
        </View>
      </TouchableWithoutFeedback>
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
  giftCardImage: {
    width: "100%",
    height: "100%",
  },
  designSection: {
    gap: theme.spacing.md,
  },
  designRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "flex-start",
  },
  amountSection: {
    gap: theme.spacing.md,
  },
  presetAmountsRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
  },
  dollarSign: {
    ...theme.text.body1Bold,
    color: theme.colors.textPrimary,
  },
  bottomPadding: {
    height: 100,
  },
});
