import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { theme } from "../assets/theme";
import SecondaryButtonM from "./buttons/secondaryButtonMed";
import GiftCardRenderer from "./giftCardRenderer";

interface GiftDetailOverlayProps {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  snapPoints: number[];
  handleSheetChanges: (index: number) => void;
  gift: {
    id: string;
    friendId: string;
    friendName: string;
    friendIcon: any;
    latitude: number;
    longitude: number;
    giftType: string;
    merchantName?: string;
    designId?: string;
    amount?: string;
    dateSent: string;
    address: string;
    isCollaborative?: boolean; // ADD THIS
  };
  onBack: () => void;
  onUnsend: () => void;
}

const GiftDetailOverlay: React.FC<GiftDetailOverlayProps> = ({
  bottomSheetRef,
  snapPoints,
  handleSheetChanges,
  gift,
  onBack,
  onUnsend,
}) => {
  // Determine gift title based on type
  const getGiftTitle = () => {
    if (gift.isCollaborative) {
      return "Collaborative Gift";
    }
    
    switch (gift.giftType) {
      case "giftCard":
        return `${gift.merchantName || "Merchant"} Gift Card`;
      case "letter":
        return "Letter";
      case "audioRecording":
        return "Audio Recording";
      case "playlist":
        return "Playlist";
      default:
        return "Gift";
      case "Group gift":
        return "Group gift";
    }
  };

  // Select appropriate gift icon
  const giftIconSource = gift.isCollaborative
    ? require("../assets/images/sent_collab_gift.png")
    : require("../assets/images/gift_mini.png");

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backgroundStyle={{ opacity: 1 }}
      containerStyle={{ zIndex: 15 }}
    >
      <BottomSheetView style={styles.overlayContainer}>
        <View style={styles.container}>
          {/* Gift Item Info */}
          <View style={styles.giftInfoContainer}>
            <View style={styles.iconContainer}>
              <Image
                source={giftIconSource}
                style={styles.giftIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={theme.text.headline4}>{getGiftTitle()}</Text>
              <Text style={[theme.text.body2, styles.addressText]}>
                {gift.address}
              </Text>
              <Text style={[theme.text.body3, styles.dateText]}>
                Sent {gift.dateSent}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Gift Preview - Only for gift cards for now */}
          {gift.giftType === "giftCard" && !gift.isCollaborative && (
            <View style={styles.giftPreviewContainer}>
              <GiftCardRenderer
                designId={gift.designId || "design1"}
                amount={gift.amount || "0"}
                merchantName={gift.merchantName || "Merchant"}
              />
            </View>
          )}

          {/* Collaborative gift info */}
          {gift.isCollaborative && (
            <Text style={[theme.text.body2, styles.collabText]}>
              This is a collaborative gift with multiple contributors.
            </Text>
          )}

          {/* Unsend Button */}
          <SecondaryButtonM title="Unsend" onPress={onUnsend} />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: theme.spacing.md,
    gap: theme.spacing.lg,
    alignItems: "stretch",
  },
  giftInfoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.md,
    width: "100%",
  },
  iconContainer: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  giftIcon: {
    width: 48,
    height: 48,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  addressText: {
    color: theme.colors.textSecondary,
  },
  dateText: {
    color: theme.colors.textSecondary,
  },
  divider: {
    height: 1,
    width: "100%",
    backgroundColor: theme.colors.textSecondary,
    opacity: 0.5,
  },
  giftPreviewContainer: {
    width: "100%",
  },
  collabText: {
    color: theme.colors.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default GiftDetailOverlay;
