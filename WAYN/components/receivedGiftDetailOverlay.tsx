import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { theme } from "../assets/theme";
import PrimaryButtonM from "./buttons/primaryButtonMed"; // ADD THIS

interface ReceivedGiftDetailOverlayProps {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  snapPoints: number[];
  handleSheetChanges: (index: number) => void;
  gift: {
    id: string;
    senderId: string;
    senderName: string;
    senderIcon: any;
    latitude: number;
    longitude: number;
    giftType: string;
    dateSent: string;
    address: string;
    isCollaborative?: boolean;
    collaboratorIcons?: any[];
    content?: {
      senderDisplayNames?: {
        host: string;
        collaborators: string[];
      };
    };
  };
  onBack: () => void;
  onNavigate: () => void; // ADD THIS
}

const ReceivedGiftDetailOverlay: React.FC<ReceivedGiftDetailOverlayProps> = ({
  bottomSheetRef,
  snapPoints,
  handleSheetChanges,
  gift,
  onBack,
  onNavigate, // ADD THIS
}) => {
  // Select appropriate gift icon
  const giftIconSource = gift.isCollaborative
    ? require("../assets/images/received_collab_gift.png")
    : require("../assets/images/received_gift.png");

  // Get display title
  const getDisplayTitle = () => {
    if (gift.isCollaborative && gift.content?.senderDisplayNames) {
      return `Gift from ${gift.content.senderDisplayNames.host} and others`;
    }
    return `Gift from ${gift.senderName}`;
  };

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
              
              {/* Show overlapping profile pics for collaborative gifts */}
              {gift.isCollaborative && gift.collaboratorIcons && (
                <View style={styles.collaboratorPicsContainer}>
                  {gift.collaboratorIcons.slice(0, 3).map((icon, index) => (
                    <View
                      key={index}
                      style={[
                        styles.collaboratorPic,
                        { left: index * 8, zIndex: 3 - index }
                      ]}
                    >
                      <Image
                        source={typeof icon === 'string' ? { uri: icon } : icon}
                        style={styles.collaboratorPicImage}
                        resizeMode="cover"
                      />
                    </View>
                  ))}
                </View>
              )}
            </View>
            <View style={styles.textContainer}>
              <Text style={theme.text.headline4}>
                {getDisplayTitle()}
              </Text>
              <Text style={[theme.text.body2, styles.addressText]}>
                {gift.address}
              </Text>
              <Text style={[theme.text.body3, styles.dateText]}>
                Sent {gift.dateSent}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Subtitle */}
          <Text style={[theme.text.body3, styles.subtitleText]}>
            Go to this location to unlock your gift.
          </Text>

          {/* Navigate Button */}
          <PrimaryButtonM title="Navigate" onPress={onNavigate} />
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
    position: "relative",
  },
  giftIcon: {
    width: 48,
    height: 48,
  },
  collaboratorPicsContainer: {
    position: "absolute",
    bottom: -8,
    left: -4,
    flexDirection: "row",
    height: 20,
    width: 40,
  },
  collaboratorPic: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    overflow: "hidden",
  },
  collaboratorPicImage: {
    width: "100%",
    height: "100%",
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
  subtitleText: {
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});

export default ReceivedGiftDetailOverlay;