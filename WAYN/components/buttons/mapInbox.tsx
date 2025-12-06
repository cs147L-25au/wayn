import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { theme } from "../../assets/theme";

interface mapInboxButtonProps {
  onPress?: () => void;
}

export default function MapInboxButton({ onPress }: mapInboxButtonProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Feather name="mail" size={24} color={theme.colors.waynOrange} />
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
