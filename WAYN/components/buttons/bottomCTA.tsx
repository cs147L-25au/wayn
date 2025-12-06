import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../../assets/theme";

interface BottomCTABarProps {
  buttonText: string;
  onPress: () => void;
  disabled?: boolean;
}

const BottomCTABar: React.FC<BottomCTABarProps> = ({
  buttonText,
  onPress,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text
          style={[styles.buttonText, disabled && styles.buttonTextDisabled]}
        >
          {buttonText}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.textSecondary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 20,
    zIndex: 20,
  },
  button: {
    backgroundColor: theme.colors.waynOrange,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#E5E7EB",
  },
  buttonText: {
    ...theme.text.body2Bold,
    color: "white",
  },
  buttonTextDisabled: {
    color: "#9CA3AF",
  },
});

export default BottomCTABar;
