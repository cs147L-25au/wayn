// app/(tabs)/profile/index.tsx (or profile.tsx)

import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { theme } from "../../../assets/theme";
import FriendListItem from "../../../components/friendItem";
import { useAuth } from "../../../contexts/authContext";
import { UserService } from "../../../services/userService";
import { Friend } from "../../../types";

const profileAvatar = require("../../../assets/userIcons/jillicon.png");
const AVATAR_SIZE = 72;

const ProfileScreen: React.FC = () => {
  const { currentUser } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  // Load friends from backend
  useEffect(() => {
    const loadFriends = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      const result = await UserService.getFriends(currentUser.id);
      if (result.success && result.friends) {
        setFriends(result.friends);
      } else {
        console.error('Failed to load friends:', result.error);
      }
      setLoading(false);
    };

    loadFriends();
  }, [currentUser?.id]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerBackground} />

      <View style={styles.container}>
        {/* Fixed header */}
        <View style={styles.headerSection}>
          <View style={styles.topRow}>
            <View style={styles.avatarWrapper}>
              <Image
                source={
                  currentUser?.profile_icon_url
                    ? { uri: currentUser.profile_icon_url }
                    : profileAvatar
                }
                style={styles.avatar}
                resizeMode="cover"
              />
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.iconCircle}
                onPress={() => router.push("/(tabs)/profile/edit")}
              >
                <Feather
                  name="edit-2"
                  size={theme.iconSize.sm}
                  color={theme.colors.iconPrimary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconCircle, styles.iconCircleRight]}
                onPress={() => router.push("/(tabs)/profile/settings")}
              >
                <Feather
                  name="settings"
                  size={theme.iconSize.sm}
                  color={theme.colors.iconPrimary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.profileTextBlock}>
            <Text style={styles.nameText}>
              {currentUser ? `${currentUser.display_name}` : 'Hallie X.'}
            </Text>

            <View style={styles.locationRow}>
              <Feather
                name="map-pin"
                size={theme.iconSize.sm}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.locationText}>
                {currentUser?.current_address || 'San Francisco, CA'}
              </Text>
            </View>

            <Text style={styles.statsText}>
              24 gifts sent · 27 gifts received
            </Text>
          </View>

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Friends</Text>
        </View>

        {/* Show loading or friends list */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.waynOrange} />
          </View>
        ) : (
          <FlatList
            data={friends}
            keyExtractor={(item) => item.id}
            style={styles.friendsList}
            contentContainerStyle={styles.friendsListContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <FriendListItem
                variant="profile"
                firstName={item.firstName}
                lastName={item.lastName}
                location={item.address}
                timestamp={item.timestamp}
                profileImageUrl={item.icon}
                onPress={() => {
                  router.push({
                    pathname: "/(tabs)/map",
                    params: { friendId: item.id },
                  });
                }}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: theme.spacing.xxl * 3 - AVATAR_SIZE / 2,
    backgroundColor: theme.colors.waynOrange,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
  },
  headerSection: {},
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  avatarWrapper: {
    borderRadius: AVATAR_SIZE / 2 + 4,
    padding: 3,
    backgroundColor: theme.colors.white,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: theme.iconSize.lg,
    height: theme.iconSize.lg,
    borderRadius: theme.iconSize.lg / 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.iconSecondary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
  },
  iconCircleRight: {
    marginLeft: theme.spacing.sm,
  },
  profileTextBlock: {
    marginTop: theme.spacing.md,
  },
  nameText: {
    ...theme.text.headline3,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.xs,
  },
  locationText: {
    ...theme.text.body3,
    marginLeft: theme.spacing.xs,
    color: theme.colors.textSecondary,
  },
  statsText: {
    ...theme.text.body3,
    marginTop: theme.spacing.xs,
    color: theme.colors.textSecondary,
  },
  divider: {
    marginTop: theme.spacing.lg,
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.textSecondary,
    opacity: 0.4,
  },
  sectionTitle: {
    ...theme.text.headline4,
    marginTop: theme.spacing.lg,
  },
  friendsList: {
    flex: 1,
    marginTop: theme.spacing.sm,
  },
  friendsListContent: {
    paddingBottom: theme.spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
