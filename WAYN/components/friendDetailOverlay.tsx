import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { theme } from "../assets/theme";
import Button from "./buttons/primaryButtonMed";
import FriendListItem from "./friendItem";
import LocationListItem from "./locationItem";

import { Friend, Location } from "../types/index";
import { defaultStatusIcon, statusIcons } from "../utils/statusIcons";

interface FriendDetailOverlayProps {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  snapPoints: number[];
  handleSheetChanges: (index: number) => void;
  friend: Friend;
  locations: Location[];
  onBack: () => void;
  onViewProfile: () => void;
  onSendGift: () => void;
  onLocationPress: (location: Location) => void;
}

const FriendDetailOverlay: React.FC<FriendDetailOverlayProps> = ({
  bottomSheetRef,
  snapPoints,
  handleSheetChanges,
  friend,
  locations,
  onBack,
  onViewProfile,
  onSendGift,
  onLocationPress,
}) => {
  const [popupVisible, setPopupVisible] = useState(false);

  const handleNudge = () => {
    setPopupVisible(true);
    onViewProfile(); // Call the original onViewProfile if needed
  };

  const handleClosePopup = () => {
    setPopupVisible(false);
  };

  const renderLocationItem = ({ item }: { item: Location }) => {
    return (
      <LocationListItem
        locationName={item.locationName}
        address={item.address}
        distance={item.distance}
        categoryIconUrl={item.categoryIconUrl}
        onPress={() => onLocationPress(item)}
      />
    );
  };

  return (
    <>
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
            <FriendListItem
              firstName={friend.firstName}
              lastName={friend.lastName}
              location={friend.address}
              timestamp={friend.timestamp}
              profileImageUrl={friend.icon}
              statusIcon={
                friend.status ? statusIcons[friend.status] : defaultStatusIcon
              }
              onPress={onBack}
            />

            <View style={styles.buttonContainer}>
              <Button title="Nudge!" onPress={handleNudge} />
              <Button title="Send Gift" onPress={onSendGift} />
            </View>

            <View style={styles.divider} />

            <Text style={[theme.text.headline4, styles.sectionHeader]}>
              Favorite Spots
            </Text>

            <FlatList
              data={friend.favoriteLocations}
              renderItem={renderLocationItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
    </>
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
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  divider: {
    height: 1,
    width: "100%",
    backgroundColor: theme.colors.textSecondary,
    opacity: 0.5,
  },
  sectionHeader: {
    width: "100%",
    textAlign: "left",
  },
  listContent: {
    width: "100%",
    alignItems: "center",
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.textSecondary,
    marginVertical: theme.spacing.md,
    opacity: 0.5,
  },
});

export default FriendDetailOverlay;
