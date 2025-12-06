import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../../assets/theme";

interface OverlayHeaderProps {
  title: string;
  onBack: () => void;
  onClose?: () => void;
  isCollaborative?: boolean;
  primarySenderName?: string;
}

const OverlayHeader: React.FC<OverlayHeaderProps> = ({
  title,
  onBack,
  onClose,
  isCollaborative = false,
  primarySenderName,
}) => {
  // Format title for collaborative gifts
  const getDisplayTitle = () => {
    if (isCollaborative && primarySenderName) {
      if (title.toLowerCase().startsWith("gift from")) {
        return `Gift from ${primarySenderName} and others`;
      }
    }
    return title;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backIcon}>‹</Text>
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1}>
        {getDisplayTitle()}
      </Text>
      {onClose && (
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeIcon}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.md,
    flexShrink: 0,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    fontSize: 32,
    color: theme.colors.black,
    lineHeight: 32,
  },
  title: {
    ...theme.text.headline2,
    color: theme.colors.black,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    fontSize: 36,
    color: theme.colors.black,
    lineHeight: 32,
  },
});

export default OverlayHeader;