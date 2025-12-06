import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { theme } from "../assets/theme";
import PrimaryButton from "./buttons/primaryButtonMed";
import ShakingGiftBox from "./animations/shakingGiftAnimation";

interface GiftPopupProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  imageSource?: any;
  buttonText: string;
  onButtonPress: () => void;
  showShakingGift?: boolean;
  isCollaborative?: boolean; // ✅ ADD THIS
}

const GiftPopup: React.FC<GiftPopupProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  imageSource,
  buttonText,
  onButtonPress,
  showShakingGift = false,
  isCollaborative = false, // ✅ ADD THIS
}) => {
  // ✅ ADD THIS: Select image based on collaborative status
  const giftImage = isCollaborative
    ? require("../assets/images/received_collab_gift.png")
    : imageSource || require("../assets/images/received_gift.png");

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <View style={styles.header}>
            <Text style={[theme.text.headline3, styles.title]}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {showShakingGift ? (
            <ShakingGiftBox
              imageSource={giftImage}
              size={isCollaborative ? 130 : 100} // ✅ Collab is 130px, regular is 100px
            />
          ) : (
            giftImage && ( // ✅ CHANGED: Use giftImage instead of imageSource
              <Image
                source={giftImage}
                style={styles.image}
                resizeMode="contain"
              />
            )
          )}

          <Text style={[theme.text.body2, styles.subtitle]}>{subtitle}</Text>

          <View style={styles.buttonContainer}>
            <PrimaryButton title={buttonText} onPress={onButtonPress} />
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
  popup: {
    width: "85%",
    padding: theme.spacing.lg,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: theme.spacing.xl,
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
    alignSelf: "stretch",
  },
  subtitle: {
    color: theme.colors.textPrimary,
  },
  buttonContainer: {
    width: "100%",
  },
});

export default GiftPopup;
