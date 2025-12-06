import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "../../../assets/theme";
import OverlayHeader from "../../../components/navigation/overlayHeader";

const STORAGE_KEY = "accessibility_initials_enabled";

const AccessibilityScreen: React.FC = () => {
  const [initialsEnabled, setInitialsEnabled] = useState(false);

  useEffect(() => {
    loadSetting();
  }, []);

  const loadSetting = async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEY);
      if (value !== null) {
        setInitialsEnabled(JSON.parse(value));
      }
    } catch (error) {
      console.error("Error loading accessibility setting:", error);
    }
  };

  const handleToggle = async (value: boolean) => {
    setInitialsEnabled(value);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving accessibility setting:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <OverlayHeader 
        title="Accessibility" 
        onBack={() => router.back()}
        onClose={() => router.back()}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.toggleSection}>
          <View style={styles.toggleTextContainer}>
            <Text style={styles.toggleTitle}>Initials for map pins</Text>
            <Text style={styles.toggleDescription}>
              Use initials instead of profile pictures
            </Text>
          </View>
          <Switch
            value={initialsEnabled}
            onValueChange={handleToggle}
            trackColor={{ false: "#E8E8E9", true: theme.colors.waynOrangeMedium }}
            thumbColor={initialsEnabled ? theme.colors.waynOrange : "#F4F4F5"}
            ios_backgroundColor="#E8E8E9"
          />
        </View>
      </ScrollView>
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
    paddingBottom: theme.spacing.xxl,
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
    marginRight: theme.spacing.md,
  },
  toggleTitle: {
    ...theme.text.body1,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  toggleDescription: {
    ...theme.text.body3,
    color: theme.colors.iconSecondary,
  },
});

export default AccessibilityScreen;

