import React from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { theme } from "../assets/theme";

interface SelectableFriendItemProps {
  firstName: string;
  lastName: string;
  location: string;
  timestamp: string;
  profileImageUrl: string | ImageSourcePropType | number;
  isSelected: boolean;
  onPress: () => void;
}

const SelectableFriendItem: React.FC<SelectableFriendItemProps> = ({
  firstName,
  lastName,
  location,
  timestamp,
  profileImageUrl,
  isSelected,
  onPress,
}) => {
  const imageSource =
    typeof profileImageUrl === "string"
      ? { uri: profileImageUrl }
      : profileImageUrl;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftBlock}>
        <Image source={imageSource} style={styles.profileImage} />

        <View style={styles.infoColumn}>
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
            {firstName} {lastName}
          </Text>

          <Text style={styles.location} numberOfLines={1} ellipsizeMode="tail">
            {location}
          </Text>

          <Text style={styles.timestamp} numberOfLines={1} ellipsizeMode="tail">
            {timestamp}
          </Text>
        </View>
      </View>

      {/* Checkbox */}
      <View
        style={[
          styles.checkbox,
          isSelected && styles.checkboxSelected,
        ]}
      >
        {isSelected && (
          <Feather name="check" size={16} color={theme.colors.waynOrange} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    justifyContent: "space-between",
  },
  leftBlock: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: theme.spacing.md,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.round,
  },
  infoColumn: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  name: {
    ...theme.text.headline4,
  },
  location: {
    ...theme.text.body3,
    color: theme.colors.textPrimary,
  },
  timestamp: {
    ...theme.text.body3,
    color: theme.colors.textSecondary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E8E9",
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: "#FFF4F2",
    borderColor: theme.colors.waynOrange,
  },
});

export default SelectableFriendItem;






