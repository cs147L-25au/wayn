import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { theme } from "../../assets/theme";

interface giftDraftButtonProps {
  onPress?: () => void;
}

export default function GiftDraftsButton({ onPress }: giftDraftButtonProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <FontAwesome
        name="pencil-square-o"
        size={24}
        color={theme.colors.waynOrange}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.waynOrange,
    backgroundColor: "white",
  },
});
