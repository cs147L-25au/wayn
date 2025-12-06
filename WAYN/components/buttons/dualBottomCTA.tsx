import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../assets/theme";
import SecondaryButtonM from "./secondaryButtonMed";

interface DualBottomCTAProps {
  primaryText: string;
  secondaryText: string;
  onPrimaryPress: () => void;
  onSecondaryPress: () => void;
  primaryDisabled?: boolean;
  secondaryDisabled?: boolean;
}

const DualBottomCTA: React.FC<DualBottomCTAProps> = ({
  primaryText,
  secondaryText,
  onPrimaryPress,
  onSecondaryPress,
  primaryDisabled = false,
  secondaryDisabled = false,
}) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.buttonRow}>
        <View style={styles.buttonWrapper}>
          <SecondaryButtonM
            title={secondaryText}
            onPress={onSecondaryPress}
            disabled={secondaryDisabled}
          />
        </View>
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              primaryDisabled && styles.primaryButtonDisabled,
            ]}
            onPress={onPrimaryPress}
            disabled={primaryDisabled}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.primaryButtonText,
                primaryDisabled && styles.primaryButtonTextDisabled,
              ]}
            >
              {primaryText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
    borderTopWidth: 1,
    borderTopColor: theme.colors.textSecondary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  buttonWrapper: {
    flex: 1,
  },
  primaryButton: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.sm,
    borderRadius: 36,
    backgroundColor: theme.colors.waynOrange,
  },
  primaryButtonDisabled: {
    backgroundColor: "#E5E7EB",
  },
  primaryButtonText: {
    ...theme.text.buttonMedium,
    color: theme.colors.white,
  },
  primaryButtonTextDisabled: {
    color: "#9CA3AF",
  },
});

export default DualBottomCTA;
