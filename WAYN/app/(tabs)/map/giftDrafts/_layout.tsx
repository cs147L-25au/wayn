import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useRouter, withLayoutContext } from "expo-router";
import { theme } from "../../../../assets/theme";
import OverlayHeader from "../../../../components/navigation/overlayHeader";

const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext(Navigator);

export default function GiftDraftsLayout() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <OverlayHeader
        title="Gift Drafts"
        onBack={() => router.push("(tabs)/map")}
      />

      {/* Tab Navigator */}
      <MaterialTopTabs
        screenOptions={{
          tabBarActiveTintColor: "#000",
          tabBarInactiveTintColor: "#9ca3af",
          tabBarLabelStyle: {
            ...theme.text.body1Bold,
          },
          tabBarStyle: {
            backgroundColor: "#fff",
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarIndicatorStyle: {
            backgroundColor: theme.colors.black,
            height: 2,
          },
        }}
      >
        <MaterialTopTabs.Screen
          name="index"
          options={{ title: "Individual Gifts" }}
        />
        <MaterialTopTabs.Screen
          name="groupDraft"
          options={{ title: "Group Gifts" }}
        />
      </MaterialTopTabs>

      {/* Bottom indicator */}
      <View style={styles.bottomIndicator}>
        <View style={styles.indicatorBar} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 12,
  },
  backIcon: {
    fontSize: 40,
    fontWeight: "300",
  },
  headerTitle: {
    ...theme.text.headline2,
  },
  closeIcon: {
    fontSize: 24,
    fontWeight: "300",
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  bottomIndicator: {
    alignItems: "center",
    paddingVertical: 16,
  },
  indicatorBar: {
    width: 128,
    height: 4,
    backgroundColor: "#000",
    borderRadius: 2,
  },
});
