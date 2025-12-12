import Feather from "@expo/vector-icons/Feather";
import { Tabs, usePathname } from "expo-router";
import { theme } from "../../assets/theme";

export default function TabsLayout() {
  const pathname = usePathname();

  // Hide tab bar on these screens
  const hideTabBar = [
    "/(tabs)/map/giftSelection",
    "/(tabs)/map/merchantSelection",
    "/(tabs)/map/giftCardCustomization",
    "/(tabs)/map/paymentConfirmation",
    "/(tabs)/map/audioCompose",
    "/(tabs)/map/letterCompose",
    "/(tabs)/map/playlistCompose",
    "/(tabs)/map/collaboratorSelection",
    "/(tabs)/map/collabGiftBasket",
  ].some((route) => pathname.includes(route.replace("/(tabs)", "")));
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.waynOrange,
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: hideTabBar ? { display: "none" } : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Hide redirect
        }}
      />

      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ size, color }: { size: number; color: string }) => (
            <Feather size={size} name="map" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="gifts"
        options={{
          title: "Gifts",
          tabBarIcon: ({ size, color }: { size: number; color: string }) => (
            <Feather size={size} name="gift" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ size, color }: { size: number; color: string }) => (
            <Feather size={size} name="user" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
