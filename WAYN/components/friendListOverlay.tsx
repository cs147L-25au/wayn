// components/FriendListOverlay.tsx
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { theme } from "../assets/theme";
import { Friend } from "../types";
import { defaultStatusIcon, statusIcons } from "../utils/statusIcons";
import FriendListItem from "./friendItem";

type FriendListOverlayProps = {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  snapPoints: number[];
  handleSheetChanges: (index: number) => void;
  friends: Friend[];
  onSelectFriend: (friendId: Friend) => void;
};

const FriendListOverlay = ({
  bottomSheetRef,
  snapPoints,
  handleSheetChanges,
  friends,
  onSelectFriend,
}: FriendListOverlayProps) => {
  // const { friends } = useFriends();

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backgroundStyle={{ opacity: 1 }}
      containerStyle={{ zIndex: 15 }}
    >
      <BottomSheetView style={styles.overlayContainer}>
        <Text style={theme.text.headline2}>Your Friends</Text>
        <FlatList
          data={friends}
          renderItem={({ item }) => (
            <FriendListItem
              firstName={item.firstName || "Jill"}
              lastName={item.lastName || "Chang"}
              location={item.address || "Near W 32 St"}
              timestamp={item.timestamp || "Since 4:52 PM"}
              profileImageUrl={item.icon}
              statusIcon={
                item.status ? statusIcons[item.status] : defaultStatusIcon
              }
              onPress={() => onSelectFriend(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    alignItems: "center",
  },
  listContent: {
    width: "90%",
    alignItems: "center",
    paddingTop: theme.spacing.md,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.textSecondary,
    marginVertical: theme.spacing.md,
    opacity: 0.5,
  },
});

export default FriendListOverlay;
