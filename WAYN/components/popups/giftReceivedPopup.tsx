import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from "react-native";
import { theme } from "../../assets/theme";
import SecondaryButtonM from "../buttons/secondaryButtonMed";
import ReceivedGiftAnimation from "../animations/receivedGiftAnimation";

interface GiftReceivedPopupCardProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  imageSource?: any;
  buttonText: string;
  onButtonPress: () => void;
  isCollaborative?: boolean; // ADD THIS
}

const GiftReceivedPopupCard: React.FC<GiftReceivedPopupCardProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  imageSource,
  buttonText,
  onButtonPress,
  isCollaborative = false, // ADD THIS
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popupCard}>
          <View style={styles.header}>
            <Text style={[theme.text.headline3, styles.title]}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.animationContainer}>
            <ReceivedGiftAnimation
              width={200}
              height={200}
              isCollaborative={isCollaborative} // PASS IT HERE
            />
          </View>

          <Text style={[theme.text.body2, { color: theme.colors.textPrimary }]}>
            {subtitle}
          </Text>

          <View style={styles.buttonContainer}>
            <SecondaryButtonM title={buttonText} onPress={onButtonPress} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  popupCard: {
    width: "85%",
    padding: theme.spacing.lg,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "#E8E8E9",
    backgroundColor: theme.colors.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
  },
  title: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  closeIcon: {
    fontSize: 20,
    color: theme.colors.iconPrimary,
    fontWeight: "400",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: theme.borderRadius.sm,
    alignSelf: "stretch",
  },
  buttonContainer: {
    width: "100%",
  },
  animationContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
});

export default GiftReceivedPopupCard;
