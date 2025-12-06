import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import React, { useCallback } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import SelectableFriendItem from "./selectableFriendItem";
import PrimaryButton from "./buttons/primaryButtonMed";
import { theme } from "../assets/theme";
import { Friend } from "../types";

type FriendSelectionOverlayProps = {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  snapPoints: number[];
  handleSheetChanges: (index: number) => void;
  friends: Friend[];
  selectedFriendIds: string[];
  onToggleFriend: (friendId: string) => void;
  onSave: () => void;
  title: string;
  subtitle: string;
};

const FriendSelectionOverlay: React.FC<FriendSelectionOverlayProps> = ({
  bottomSheetRef,
  snapPoints,
  handleSheetChanges,
  friends,
  selectedFriendIds,
  onToggleFriend,
  onSave,
  title,
  subtitle,
}) => {
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backgroundStyle={{ opacity: 1 }}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView style={styles.overlayContainer}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          {/* Friend List */}
          <FlatList
            data={friends}
            renderItem={({ item }) => (
              <SelectableFriendItem
                firstName={item.firstName}
                lastName={item.lastName}
                location={item.address}
                timestamp={item.timestamp}
                profileImageUrl={item.icon}
                isSelected={selectedFriendIds.includes(item.id)}
                onPress={() => onToggleFriend(item.id)}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsVerticalScrollIndicator={false}
          />

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <PrimaryButton title="Save" onPress={onSave} />
          </View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  title: {
    ...theme.text.headline3,
    color: theme.colors.textPrimary,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.text.body3,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: theme.spacing.md,
  },
  separator: {
    height: theme.spacing.lg,
  },
  buttonContainer: {
    paddingVertical: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
});

export default FriendSelectionOverlay;
