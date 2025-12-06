import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import SelectableLocationItem from "./selectableLocation";
import { theme } from "../assets/theme";
import { Location } from "../types/index";

interface LocationSelectionOverlayProps {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  snapPoints: number[];
  handleSheetChanges: (index: number) => void;
  locations: (Location & { latitude: number; longitude: number })[];
  selectedLocationId: string | null;
  onLocationSelect: (
    location: Location & { latitude: number; longitude: number }
  ) => void;
  friendName: string;
  isPOISelected?: boolean; // New prop to indicate if location was selected from map
}

const LocationSelectionOverlay: React.FC<LocationSelectionOverlayProps> = ({
  bottomSheetRef,
  snapPoints,
  handleSheetChanges,
  locations,
  selectedLocationId,
  onLocationSelect,
  friendName,
  isPOISelected = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter locations based on search query
  const filteredLocations = locations.filter(
    (location) =>
      location.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderLocationItem = ({
    item,
  }: {
    item: Location & { latitude: number; longitude: number };
  }) => {
    return (
      <SelectableLocationItem
        locationName={item.locationName}
        address={item.address}
        distance={item.distance}
        categoryIconUrl={item.categoryIconUrl}
        isSelected={selectedLocationId === item.id}
        onPress={() => onLocationSelect(item)}
      />
    );
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backgroundStyle={{ opacity: 1 }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      containerStyle={{ zIndex: 15 }}
    >
      <BottomSheetView style={styles.overlayContainer}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
              <Text style={theme.text.headline3}>Choose Gift Destination</Text>
              <Text style={[theme.text.body3, styles.subtitle]}>
                {isPOISelected
                  ? `Tap a location pin on the map or search below`
                  : `${friendName} unlocks gift at this destination`}
              </Text>
            </View>

            {/* Search Bar - hide when POI is selected */}
            {!isPOISelected && (
              <View style={styles.searchContainer}>
                <Feather
                  name="search"
                  size={20}
                  color={theme.colors.textSecondary}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search locations..."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            )}

            {/* Helper text when POI selected */}
            {isPOISelected && (
              <View style={styles.poiHintContainer}>
                <Feather
                  name="map-pin"
                  size={16}
                  color={theme.colors.waynOrange}
                />
                <Text style={[theme.text.body3, styles.poiHintText]}>
                  Selected from map
                </Text>
              </View>
            )}

            {/* Location List */}
            <FlatList
              data={filteredLocations}
              renderItem={renderLocationItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Feather
                    name="map-pin"
                    size={48}
                    color={theme.colors.textSecondary}
                  />
                  <Text style={[theme.text.body2, styles.emptyText]}>
                    {searchQuery
                      ? "No locations found"
                      : "Tap a location on the map to select it"}
                  </Text>
                </View>
              }
            />
          </View>
        </TouchableWithoutFeedback>
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
  },
  headerContainer: {
    gap: theme.spacing.sm,
  },
  subtitle: {
    color: theme.colors.textPrimary,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...theme.text.body3,
    color: theme.colors.textPrimary,
  },
  poiHintContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF4F2",
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.waynOrange,
  },
  poiHintText: {
    color: theme.colors.waynOrange,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 100, // Space for the bottom CTA bar
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.textSecondary,
    marginVertical: theme.spacing.md,
    opacity: 0.5,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xl * 2,
    gap: theme.spacing.md,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});

export default LocationSelectionOverlay;
