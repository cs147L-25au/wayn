import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import * as ImagePicker from "expo-image-picker";
import { theme } from "../../../assets/theme";
import OverlayHeader from "../../../components/navigation/overlayHeader";
import { useAuth } from "../../../contexts/authContext";
import { UserService } from "../../../services/userService";

const profileAvatar = require("../../../assets/userIcons/jillicon.png");

const EditProfileScreen: React.FC = () => {
  const { currentUser, refreshCurrentUser } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [location, setLocation] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setFirstName("");
      setLastName("");
      setLocation("");
      setAvatarPreview(null);
      setLocalAvatarUri(null);
      return;
    }

    const displayParts = currentUser.display_name
      ? currentUser.display_name.trim().split(" ")
      : [];
    setFirstName(displayParts[0] || "");
    setLastName(displayParts.slice(1).join(" ") || "");
    setLocation(currentUser.current_address || "");
    setAvatarPreview(currentUser.profile_icon_url || null);
    setLocalAvatarUri(null);
  }, [currentUser]);

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow photo access to change your avatar.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets.length) {
      return;
    }

    const asset = result.assets[0];
    if (asset.uri) {
      setLocalAvatarUri(asset.uri);
      setAvatarPreview(asset.uri);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setSaving(true);

    try {
      let profileIconUrl = currentUser.profile_icon_url || null;

      if (localAvatarUri) {
        const uploadResult = await UserService.uploadProfileAvatar(currentUser.id, localAvatarUri);
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || "Unable to upload avatar");
        }
        profileIconUrl = uploadResult.url || null;
      }

      const displayName = [firstName.trim(), lastName.trim()]
        .filter(Boolean)
        .join(" ")
        .trim() || currentUser.display_name;

      const result = await UserService.updateProfile(currentUser.id, {
        display_name: displayName,
        current_address: location || null,
        profile_icon_url: profileIconUrl,
      });

      if (!result.success) {
        throw new Error(result.error || "Unable to update profile");
      }

      await refreshCurrentUser();
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const avatarSource = avatarPreview
    ? { uri: avatarPreview }
    : profileAvatar;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <OverlayHeader title="Edit Profile" onBack={() => router.back()} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarContainer}>
            <Image source={avatarSource} style={styles.avatar} resizeMode="cover" />
            <TouchableOpacity style={styles.editIconButton} onPress={pickAvatar}>
              <Feather name="edit-2" size={16} color={theme.colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>First Name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First Name"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last Name"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Location</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="City"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  avatarContainer: {
    alignSelf: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 124,
    height: 124,
    borderRadius: 62,
  },
  editIconButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.waynOrange,
    alignItems: "center",
    justifyContent: "center",
  },
  formContainer: {
    width: "100%",
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    color: theme.colors.black,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E8E8E9",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Poppins-Regular",
    color: theme.colors.black,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E8E8E9",
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  saveButton: {
    backgroundColor: theme.colors.waynOrange,
    borderRadius: 36,
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    color: theme.colors.white,
  },
});
