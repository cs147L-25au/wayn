import React, { useState } from "react";

import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  ImageSourcePropType,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { theme } from "../assets/theme";

export type StatusOption =
  | "studying"
  | "exploring"
  | "chilling"
  | "working"
  | "hanging out";

interface StatusDropdownProps {
  selectedStatus: StatusOption | null;
  onStatusChange: (status: StatusOption) => void;
}

const statusConfig: Record<
  StatusOption,
  { image: ImageSourcePropType; label: string }
> = {
  studying: {
    image: require("../assets/emojis/study.png"),
    label: "Studying!",
  },
  exploring: {
    image: require("../assets/emojis/explore.png"),
    label: "Exploring!",
  },
  chilling: {
    image: require("../assets/emojis/chill.png"),
    label: "Chilling!",
  },
  working: {
    image: require("../assets/emojis/work.png"),
    label: "Working!",
  },
  "hanging out": {
    image: require("../assets/emojis/hangout.png"),
    label: "Hanging out!",
  },
};

const defaultImage = require("../assets/emojis/question.png");

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  selectedStatus,
  onStatusChange,
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const { width } = useWindowDimensions();
  const containerWidth = width * 0.7;

  const handleSelectStatus = (status: StatusOption) => {
    onStatusChange(status);
    setIsDropdownVisible(false);
  };

  const handleRemoveStatus = () => {
    onStatusChange(null!); // Use null assertion instead
    setIsDropdownVisible(false);
  };

  const displayText = selectedStatus
    ? statusConfig[selectedStatus].label
    : "What's up?";

  const displayImage = selectedStatus
    ? statusConfig[selectedStatus].image
    : defaultImage;

  return (
    <View style={[styles.container, { width: containerWidth }]}>
      <View style={styles.statusContainer}>
        {/* Circle with emoji image */}
        <View style={styles.circle}>
          <Image source={displayImage} style={styles.emojiImage} />
        </View>

        {/* Text box with dropdown */}
        <TouchableOpacity
          style={styles.textBox}
          onPress={() => setIsDropdownVisible(true)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.statusText,
              !selectedStatus && styles.placeholderText,
            ]}
            numberOfLines={1}
          >
            {displayText}
          </Text>
          <Ionicons
            name="chevron-down"
            size={20}
            color={theme.colors.iconPrimary}
            style={styles.chevron}
          />
        </TouchableOpacity>
      </View>

      {/* Dropdown Modal */}
      {isDropdownVisible && (
        <Modal
          visible={isDropdownVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsDropdownVisible(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setIsDropdownVisible(false)}
          >
            <View style={styles.dropdownPositioner}>
              <View style={[styles.dropdown, { width: containerWidth - 36 }]}>
                {(Object.keys(statusConfig) as StatusOption[]).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.dropdownItem,
                      selectedStatus === status && styles.selectedItem,
                    ]}
                    onPress={() => handleSelectStatus(status)}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={statusConfig[status].image}
                      style={styles.dropdownEmojiImage}
                    />
                    <Text
                      style={[
                        styles.dropdownText,
                        selectedStatus === status && styles.selectedText,
                      ]}
                    >
                      {statusConfig[status].label}
                    </Text>
                  </TouchableOpacity>
                ))}

                {/* Remove Status Option */}
                {selectedStatus && (
                  <>
                    <View style={styles.divider} />
                    <TouchableOpacity
                      style={styles.removeStatusItem}
                      onPress={handleRemoveStatus}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="close-circle-outline"
                        size={28}
                        color={theme.colors.iconSecondary}
                      />
                      <Text style={styles.removeStatusText}>Remove Status</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  circle: {
    width: 72,
    height: 72,
    borderRadius: theme.borderRadius.round,
    borderWidth: 3,
    borderColor: theme.colors.waynOrange,
    backgroundColor: theme.colors.white,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emojiImage: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  textBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderWidth: 3,
    borderColor: theme.colors.waynOrange,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 12,
    paddingLeft: 48,
    paddingRight: theme.spacing.md,
    marginLeft: -36,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    ...theme.text.body1Bold,
    flex: 1,
    color: theme.colors.waynOrange,
  },
  placeholderText: {
    color: theme.colors.textSecondary,
    fontFamily: "Poppins-Regular",
    fontWeight: "400",
  },
  chevron: {
    marginLeft: theme.spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  dropdownPositioner: {
    position: "absolute",
    top: 136, // Adjust this to position right below the status bar
    left: "32%",
    right: "16%",
  },
  dropdown: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: "#D1D5DB", // Light gray
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
  },
  selectedItem: {
    backgroundColor: theme.colors.waynOrangeLight,
  },
  dropdownEmojiImage: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  dropdownText: {
    ...theme.text.body1,
    flex: 1,
  },
  selectedText: {
    ...theme.text.body1Bold,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: theme.spacing.md,
  },
  removeStatusItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
  },
  removeStatusText: {
    ...theme.text.body1,
    color: theme.colors.iconSecondary,
    flex: 1,
  },
});

export default StatusDropdown;
