import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../assets/theme";

interface NavigationHeaderProps {
  currentInstruction: string;
  onClose: () => void;
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentInstruction,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Status bar spacer */}
      <View />
      
      {/* Content row - centered */}
      <View style={styles.contentContainer}>
        <View style={styles.instructionContainer}>
          <Ionicons name="navigate" size={24} color={theme.colors.waynOrange} />
          <Text style={styles.instructionText} numberOfLines={2}>
            {currentInstruction}
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  instructionContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: theme.spacing.sm,
  },
  instructionText: {
    ...theme.text.body1,
    flex: 1,
    color: theme.colors.textPrimary,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
});

export default NavigationHeader;