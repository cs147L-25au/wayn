import { Feather } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { theme } from "../../../assets/theme";
import FriendSelectionOverlay from "../../../components/friendSelectionOverlay";
import OverlayHeader from "../../../components/navigation/overlayHeader";
import { useAuth } from "../../../contexts/authContext";
import { UserService } from "../../../services/userService";
import { Friend } from "../../../types";
import { db } from "../../../utils/supabase";

const STORAGE_KEYS = {
  locationEnabled: "location_sharing_enabled",
  selectedOption: "location_sharing_option",
  exceptFriends: "location_sharing_except_friends",
  onlyFriends: "location_sharing_only_friends",
};

const LocationSharingSettings: React.FC = () => {
  const { currentUser, refreshCurrentUser } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [selectedOption, setSelectedOption] = useState<"all" | "only" | "except">("all");
  const [exceptFriendIds, setExceptFriendIds] = useState<string[]>([]);
  const [onlyFriendIds, setOnlyFriendIds] = useState<string[]>([]);
  const [showFriendSelection, setShowFriendSelection] = useState(false);
  const [selectionMode, setSelectionMode] = useState<"only" | "except">("except");
  const [permissionGranted, setPermissionGranted] = useState(false);
  const watcherRef = useRef<Location.LocationSubscription | null>(null);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [400, 700], []);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setShowFriendSelection(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    loadFriends();
  }, [currentUser]);

  const loadFriends = async () => {
    if (!currentUser) return;
    
    const result = await UserService.getFriends(currentUser.id);
    if (result.success && result.friends) {
      setFriends(result.friends);
    } else {
      console.error("Failed to load friends:", result.error);
    }
  };

  useEffect(() => {
    return () => {
      stopLocationWatcher();
    };
  }, []);

  useEffect(() => {
    if (locationEnabled) {
      ensurePermissionAndWatch();
    } else {
      stopLocationWatcher();
    }
  }, [locationEnabled, currentUser, permissionGranted]);

  const loadSettings = async () => {
    try {
      // First try to load from Supabase (source of truth)
      if (currentUser) {
        const { data, error } = await db
          .from('users')
          .select('location_sharing_enabled')
          .eq('id', currentUser.id)
          .single();
        
        if (!error && data) {
          const enabled = data.location_sharing_enabled ?? true; // Default to true if null
          setLocationEnabled(enabled);
          // Sync to AsyncStorage for local caching
          await AsyncStorage.setItem(STORAGE_KEYS.locationEnabled, JSON.stringify(enabled));
        }
      }
      
      // Also load other settings from AsyncStorage
      const [optionValue, exceptFriendsValue, onlyFriendsValue] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.selectedOption),
        AsyncStorage.getItem(STORAGE_KEYS.exceptFriends),
        AsyncStorage.getItem(STORAGE_KEYS.onlyFriends),
      ]);
      if (optionValue !== null) {
        setSelectedOption(JSON.parse(optionValue) as "all" | "only" | "except");
      }
      if (exceptFriendsValue !== null) {
        setExceptFriendIds(JSON.parse(exceptFriendsValue));
      }
      if (onlyFriendsValue !== null) {
        setOnlyFriendIds(JSON.parse(onlyFriendsValue));
      }
      
      // Fallback to AsyncStorage if Supabase didn't have the value
      if (currentUser) {
        const enabledValue = await AsyncStorage.getItem(STORAGE_KEYS.locationEnabled);
        if (enabledValue !== null) {
          const enabled = JSON.parse(enabledValue);
          setLocationEnabled(enabled);
          // Sync to Supabase if it's different
          const { data } = await db
            .from('users')
            .select('location_sharing_enabled')
            .eq('id', currentUser.id)
            .single();
          if (data && data.location_sharing_enabled !== enabled) {
            await db
              .from('users')
              .update({ location_sharing_enabled: enabled })
              .eq('id', currentUser.id);
          }
        }
      }
    } catch (error) {
      console.error("Error loading location sharing settings:", error);
    }
  };

  const handleToggle = async (value: boolean) => {
    if (!currentUser) return;
    
    setLocationEnabled(value);
    try {
      // Save to AsyncStorage for local caching
      await AsyncStorage.setItem(STORAGE_KEYS.locationEnabled, JSON.stringify(value));
      
      // Save to Supabase so other users know your location sharing status
      const { error } = await db
        .from('users')
        .update({ location_sharing_enabled: value })
        .eq('id', currentUser.id);
      
      if (error) {
        console.error("Error updating location sharing setting:", error);
        // Revert local state on error
        setLocationEnabled(!value);
      } else {
        refreshCurrentUser(); // Refresh to get updated user data
      }
    } catch (error) {
      console.error("Error saving location sharing setting:", error);
      // Revert local state on error
      setLocationEnabled(!value);
    }
  };

  const ensurePermissionAndWatch = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === Location.PermissionStatus.GRANTED;
      setPermissionGranted(granted);
      if (granted && locationEnabled) {
        startLocationWatcher();
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
    }
  }, [locationEnabled]);

  const startLocationWatcher = useCallback(async () => {
    if (!currentUser || watcherRef.current) return;
    try {
      watcherRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 5,
          timeInterval: 10000,
        },
        async (location) => {
          console.log("Location watcher update", location.coords);
          if (!location || !currentUser) return;
          console.log("Updating location for", currentUser?.id);
          const result = await UserService.updateLocation(
            currentUser.id,
            location.coords.latitude,
            location.coords.longitude,
            "Current location"
          );
          if (result.success) {
            refreshCurrentUser();
          }
        }
      );
    } catch (error) {
      console.error("Error starting location watch:", error);
    }
  }, [currentUser]);

  const stopLocationWatcher = useCallback(() => {
    if (!watcherRef.current) return;
    watcherRef.current.remove();
    watcherRef.current = null;
  }, []);

  const handleOptionChange = async (option: "all" | "only" | "except") => {
    if (!locationEnabled) return;
    setSelectedOption(option);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.selectedOption, JSON.stringify(option));
    } catch (error) {
      console.error("Error saving location sharing option:", error);
    }
  };

  const handleOpenFriendSelection = (mode: "only" | "except") => {
    if (!locationEnabled) return;
    setSelectionMode(mode);
    setShowFriendSelection(true);
    bottomSheetRef.current?.snapToIndex(1);
  };

  const handleToggleFriend = (friendId: string) => {
    if (selectionMode === "except") {
      setExceptFriendIds((prev) =>
        prev.includes(friendId)
          ? prev.filter((id) => id !== friendId)
          : [...prev, friendId]
      );
    } else {
      setOnlyFriendIds((prev) =>
        prev.includes(friendId)
          ? prev.filter((id) => id !== friendId)
          : [...prev, friendId]
      );
    }
  };

  const handleSaveFriendSelection = async () => {
    try {
      if (selectionMode === "except") {
        await AsyncStorage.setItem(STORAGE_KEYS.exceptFriends, JSON.stringify(exceptFriendIds));
      } else {
        await AsyncStorage.setItem(STORAGE_KEYS.onlyFriends, JSON.stringify(onlyFriendIds));
      }
      bottomSheetRef.current?.close();
      setShowFriendSelection(false);
    } catch (error) {
      console.error("Error saving friend selection:", error);
    }
  };

  const formatSelectedFriends = (friendIds: string[], maxLength: number = 30): string => {
    if (friendIds.length === 0) {
      return "Choose people";
    }

    const selectedFriends = friends.filter((f) => friendIds.includes(f.id));
    if (selectedFriends.length === 0) {
      return "Choose people";
    }

    const names = selectedFriends.map((f) => f.firstName);
    let result = names.join(", ");
    
    if (result.length <= maxLength) {
      return result;
    }

    // Try to fit as many names as possible
    let displayNames: string[] = [];
    let currentLength = 0;
    
    for (const name of names) {
      const testLength = displayNames.length === 0 
        ? name.length 
        : currentLength + ", ".length + name.length;
      
      if (testLength <= maxLength - 10) { // Reserve space for "+X others"
        displayNames.push(name);
        currentLength = testLength;
      } else {
        break;
      }
    }

    const remaining = names.length - displayNames.length;
    if (remaining > 0) {
      return `${displayNames.join(", ")} +${remaining} other${remaining > 1 ? "s" : ""}`;
    }

    return displayNames.join(", ");
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <OverlayHeader title="Location Sharing" onBack={() => router.back()} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.permissionBanner}>
          <Feather
            name="alert-circle"
            size={theme.iconSize.lg}
            color={theme.colors.iconPrimary}
          />
          <View style={styles.permissionTextContainer}>
            <Text style={styles.permissionTitle}>Allow Location Settings</Text>
            <Text style={styles.permissionDescription}>
              To use this app with friends, we need your device's location permissions to be on. Go into your phone's settings.
            </Text>
          </View>
          <Feather
            name="chevron-right"
            size={theme.iconSize.lg}
            color={theme.colors.iconSecondary}
          />
        </TouchableOpacity>

        <View style={styles.toggleSection}>
          <View style={styles.toggleTextContainer}>
            <Text style={styles.toggleTitle}>Your Location Sharing</Text>
          </View>
          <Switch
            value={locationEnabled}
            onValueChange={handleToggle}
            trackColor={{ false: "#E8E8E9", true: theme.colors.waynOrangeMedium }}
            thumbColor={locationEnabled ? theme.colors.waynOrange : "#F4F4F5"}
            ios_backgroundColor="#E8E8E9"
          />
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
        </View>

        <Text style={[styles.sectionTitle, !locationEnabled && styles.disabledText]}>
          Who can see your location?
        </Text>

        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => handleOptionChange("all")}
          disabled={!locationEnabled}
        >
          <View style={styles.optionContent}>
            <View style={styles.optionIcon}>
              <Feather
                name="users"
                size={24}
                color={locationEnabled ? theme.colors.iconPrimary : theme.colors.iconSecondary}
              />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionTitle, !locationEnabled && styles.disabledText]}>
                All friends
              </Text>
              <Text style={[styles.optionSubtitle, !locationEnabled && styles.disabledText]}>
                {friends.length > 0 
                  ? friends.slice(0, 3).map(f => f.firstName).join(", ") + (friends.length > 3 ? ` +${friends.length - 3} more` : "")
                  : "No friends yet"}
              </Text>
            </View>
          </View>
          <View style={[styles.radioButton, selectedOption === "all" && styles.radioButtonSelected]}>
            {selectedOption === "all" && <View style={styles.radioButtonInner} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => handleOptionChange("only")}
          disabled={!locationEnabled}
        >
          <View style={styles.optionContent}>
            <View style={styles.optionIcon}>
              <Feather
                name="user-check"
                size={24}
                color={locationEnabled ? theme.colors.iconPrimary : theme.colors.iconSecondary}
              />
            </View>
            <View style={styles.optionTextContainerWithAction}>
              <Text style={[styles.optionTitle, !locationEnabled && styles.disabledText]}>
                Only these friends
              </Text>
              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => handleOpenFriendSelection("only")}
                disabled={!locationEnabled}
              >
                <Text 
                  style={[styles.actionText, !locationEnabled && styles.disabledText]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {formatSelectedFriends(onlyFriendIds)}
                </Text>
                <Feather
                  name="chevron-right"
                  size={16}
                  color={theme.colors.iconSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.radioButton, selectedOption === "only" && styles.radioButtonSelected]}>
            {selectedOption === "only" && <View style={styles.radioButtonInner} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => handleOptionChange("except")}
          disabled={!locationEnabled}
        >
          <View style={styles.optionContent}>
            <View style={styles.optionIcon}>
              <Feather
                name="user-x"
                size={24}
                color={locationEnabled ? theme.colors.iconPrimary : theme.colors.iconSecondary}
              />
            </View>
            <View style={styles.optionTextContainerWithAction}>
              <Text style={[styles.optionTitle, !locationEnabled && styles.disabledText]}>
                Your friends, except
              </Text>
              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => handleOpenFriendSelection("except")}
                disabled={!locationEnabled}
              >
                <Text 
                  style={[styles.actionText, !locationEnabled && styles.disabledText]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {formatSelectedFriends(exceptFriendIds)}
                </Text>
                <Feather
                  name="chevron-right"
                  size={16}
                  color={theme.colors.iconSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.radioButton, selectedOption === "except" && styles.radioButtonSelected]}>
            {selectedOption === "except" && <View style={styles.radioButtonInner} />}
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Friend Selection Bottom Sheet */}
      {showFriendSelection && (
        <FriendSelectionOverlay
          bottomSheetRef={bottomSheetRef}
          snapPoints={snapPoints}
          handleSheetChanges={handleSheetChanges}
          friends={friends}
          selectedFriendIds={selectionMode === "except" ? exceptFriendIds : onlyFriendIds}
          onToggleFriend={handleToggleFriend}
          onSave={handleSaveFriendSelection}
          title={
            selectionMode === "except"
              ? "Sharing location with friends, except"
              : "Sharing location with only these friends"
          }
          subtitle={
            selectionMode === "except"
              ? "These people will not receive your location"
              : "Only these people will receive your location"
          }
        />
      )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  permissionBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    borderRadius: 12,
    marginBottom: theme.spacing.sm,
  },
  permissionTextContainer: {
    flex: 1,
  },
  permissionTitle: {
    ...theme.text.headline4,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  permissionDescription: {
    ...theme.text.body3,
    color: theme.colors.iconSecondary,
    lineHeight: 18,
  },
  toggleSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleTitle: {
    ...theme.text.body1,
    color: theme.colors.textPrimary,
  },
  dividerContainer: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: "#E8E8E9",
  },
  sectionTitle: {
    ...theme.text.headline3,
    color: theme.colors.textPrimary,
    textAlign: "center",
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    gap: theme.spacing.lg,
  },
  optionIcon: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTextContainerWithAction: {
    flex: 1,
  },
  optionTitle: {
    ...theme.text.body1,
    color: theme.colors.textPrimary,
  },
  optionSubtitle: {
    ...theme.text.body3,
    color: theme.colors.iconSecondary,
    marginTop: theme.spacing.sm,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  actionText: {
    ...theme.text.body3,
    color: theme.colors.iconSecondary,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.iconSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: theme.colors.waynOrange,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.waynOrange,
  },
  disabledText: {
    color: theme.colors.iconSecondary,
  },
});

export default LocationSharingSettings;
