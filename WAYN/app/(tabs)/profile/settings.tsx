import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { theme } from "../../../assets/theme";
import OverlayHeader from "../../../components/navigation/overlayHeader";
import PrimaryButton from "../../../components/buttons/primaryButtonMed";

const SettingsScreen: React.FC = () => {
  const handleSave = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <OverlayHeader title="Settings" onBack={() => router.back()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/profile/locationSharing")}
          >
            <Feather
              name="map-pin"
              size={theme.iconSize.lg}
              color={theme.colors.iconPrimary}
            />
            <Text style={styles.menuText}>Location Sharing</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <Feather
              name="credit-card"
              size={theme.iconSize.lg}
              color={theme.colors.iconPrimary}
            />
            <Text style={styles.menuText}>Payment Info</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/profile/accessibility")}
          >
            <Feather
              name="eye"
              size={theme.iconSize.lg}
              color={theme.colors.iconPrimary}
            />
            <Text style={styles.menuText}>Accessibility</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title="Save" onPress={handleSave} />
      </View>
    </SafeAreaView>
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
  },
  menuContainer: {
    width: "100%",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: theme.spacing.md,
  },
  menuText: {
    ...theme.text.body1,
    color: theme.colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: "#E8E8E9",
    marginVertical: theme.spacing.sm,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#E8E8E9",
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.white,
  },
});

export default SettingsScreen;
