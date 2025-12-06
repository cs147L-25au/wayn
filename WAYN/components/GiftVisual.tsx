import React from "react";
import { StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../assets/theme";

export type GiftType = "giftCard" | "letter" | "audioRecording" | "playlist";

const GiftVisual = ({ type }: { type: GiftType }) => {
  const iconMap: Record<
    GiftType,
    React.ComponentProps<typeof Feather>["name"]
  > = {
    giftCard: "credit-card",
    letter: "mail",
    audioRecording: "mic",
    playlist: "music",
  };

  const iconName = iconMap[type] || "gift";

  return (
    <LinearGradient
      colors={[theme.colors.waynOrange, "#FF8A75"]}
      style={styles.giftImage}
    >
      <Feather name={iconName} size={40} color="white" />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  giftImage: {
    width: "100%",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default GiftVisual;
