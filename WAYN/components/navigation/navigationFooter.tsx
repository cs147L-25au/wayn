// components/navigation/navigationFooter.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../assets/theme";
import { TravelMode } from "../../services/navigationService";

interface NavigationFooterProps {
  totalDuration: string;
  totalDistance: string;
  estimatedArrival: string;
  travelMode: TravelMode;
  onToggleTravelMode: () => void;
}

const NavigationFooter: React.FC<NavigationFooterProps> = ({
  totalDuration,
  totalDistance,
  estimatedArrival,
  travelMode,
  onToggleTravelMode,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.durationText}>{totalDuration}</Text>
        <View style={styles.detailsRow}>
          <Text style={styles.detailText}>{totalDistance}</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.detailText}>ETA {estimatedArrival}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={onToggleTravelMode} style={styles.modeToggle}>
        <Ionicons
          name={travelMode === "WALKING" ? "walk" : "car"}
          size={28}
          color={theme.colors.white}
        />
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
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
  infoContainer: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  durationText: {
    ...theme.text.headline3,
    color: theme.colors.textPrimary,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  detailText: {
    ...theme.text.body2,
    color: theme.colors.textSecondary,
  },
  separator: {
    ...theme.text.body2,
    color: theme.colors.textSecondary,
  },
  modeToggle: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.waynOrange,
    borderRadius: theme.borderRadius.sm,
  },
});

export default NavigationFooter;
