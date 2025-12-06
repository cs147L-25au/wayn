// components/friendItem.tsx
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../assets/theme";

interface FriendListItemProps {
  firstName: string;
  lastName: string;
  location: string;
  timestamp: string;
  profileImageUrl: string | ImageSourcePropType | number;
  onPress?: () => void;
  /** "sheet" = existing design (default), "profile" = profile screen row */
  variant?: "sheet" | "profile";
  /** Status Icon */
  statusIcon?: ImageSourcePropType | null;
}

const AVATAR_SIZE_SHEET = 64;
const AVATAR_SIZE_PROFILE = 48;

const FriendListItem: React.FC<FriendListItemProps> = ({
  firstName,
  lastName,
  location,
  timestamp,
  profileImageUrl,
  onPress,
  statusIcon,
  variant = "sheet",
}) => {
  const imageSource =
    typeof profileImageUrl === "string"
      ? { uri: profileImageUrl }
      : profileImageUrl;

  const isProfile = variant === "profile";

  return (
    <TouchableOpacity
      style={[styles.container, isProfile && styles.containerProfile]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Left side: avatar + text */}
      <View style={styles.leftBlock}>
        <Image
          source={imageSource}
          style={[styles.profileImage, isProfile && styles.profileImageProfile]}
        />

        <View
          style={[styles.infoColumn, isProfile && styles.infoColumnProfile]}
        >
          <Text
            style={isProfile ? styles.nameProfile : styles.name}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {firstName} {lastName}
          </Text>

          {isProfile ? (
            <View style={styles.locationRowProfile}>
              <Feather
                name="map-pin"
                size={theme.iconSize.sm}
                color={theme.colors.textSecondary}
              />
              <Text
                style={styles.locationProfile}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {location}
              </Text>
            </View>
          ) : (
            <>
              <Text
                style={styles.location}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {location}
              </Text>
              <Text
                style={styles.timestamp}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {timestamp}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Right side: badge (sheet) or arrow icon (profile) */}
      {isProfile ? (
        <Feather
          name="arrow-up-right"
          size={theme.iconSize.md}
          color={theme.colors.iconSecondary}
        />
      ) : (
        statusIcon && <Image source={statusIcon} style={styles.statusBadge} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  statusBadge: {
    width: 64,
    height: 64,
    position: "absolute",
    right: 10,
  },
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  containerProfile: {
    justifyContent: "space-between",
    paddingVertical: theme.spacing.sm,
  },
  leftBlock: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: theme.spacing.md,
  },
  studyingBadge: {
    width: 48,
    height: 48,
    resizeMode: "contain",
    marginLeft: 4,
    marginTop: -6,
  },
  profileImage: {
    width: AVATAR_SIZE_SHEET,
    height: AVATAR_SIZE_SHEET,
    borderRadius: theme.borderRadius.round,
  },
  profileImageProfile: {
    width: AVATAR_SIZE_PROFILE,
    height: AVATAR_SIZE_PROFILE,
    borderRadius: AVATAR_SIZE_PROFILE / 2,
  },
  infoColumn: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  infoColumnProfile: {
    gap: 0,
  },
  name: {
    ...theme.text.headline4,
  },
  nameProfile: {
    ...theme.text.body2Bold,
    color: theme.colors.textPrimary,
  },
  location: {
    ...theme.text.body3,
    color: theme.colors.textPrimary,
  },
  timestamp: {
    ...theme.text.body3,
    color: theme.colors.textSecondary,
  },
  locationRowProfile: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.xs,
  },
  locationProfile: {
    ...theme.text.body3,
    marginLeft: theme.spacing.xs,
    color: theme.colors.textSecondary,
  },
});

export default FriendListItem;
