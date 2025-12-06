import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { theme } from "../assets/theme";

interface SelectableLocationItemProps {
  locationName: string;
  address: string;
  distance?: string;
  categoryIconUrl: string | ImageSourcePropType | number;
  isSelected: boolean;
  onPress: () => void;
}

const SelectableLocationItem: React.FC<SelectableLocationItemProps> = ({
  locationName,
  address,
  distance,
  categoryIconUrl,
  isSelected,
  onPress,
}) => {
  const iconSource =
    typeof categoryIconUrl === "string"
      ? { uri: categoryIconUrl }
      : categoryIconUrl;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* Info Column */}
      <View style={styles.infoColumn}>
        <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
          {locationName}
        </Text>
        <Text style={styles.address} numberOfLines={1} ellipsizeMode="tail">
          {address}
        </Text>
        {distance && ( // ← Add this conditional check
          <Text style={styles.distance} numberOfLines={1} ellipsizeMode="tail">
            {distance}
          </Text>
        )}
      </View>

      {/* Category Icon or Checkmark */}
      {isSelected ? (
        <View style={styles.checkmarkContainer}>
          <Feather name="check" size={20} color={theme.colors.waynOrange} />
        </View>
      ) : (
        <Image source={iconSource} style={styles.categoryIcon} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  infoColumn: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  name: {
    ...theme.text.body3Bold,
  },
  address: {
    ...theme.text.body3,
    color: theme.colors.textPrimary,
  },
  distance: {
    ...theme.text.body3,
    color: theme.colors.textSecondary,
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.round,
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.round,
    backgroundColor: "#FFF4F2",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SelectableLocationItem;
