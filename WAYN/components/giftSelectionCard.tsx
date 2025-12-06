import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageSourcePropType,
} from "react-native";
import { theme } from "../assets/theme";
import PrimaryButton from "./buttons/primaryButtonMed";

interface GiftSelectionCardProps {
  title: string;
  subtitle: string;
  imageSource: ImageSourcePropType;
  onChoose: () => void;
}

const GiftSelectionCard: React.FC<GiftSelectionCardProps> = ({
  title,
  subtitle,
  imageSource,
  onChoose,
}) => {
  return (
    <View style={styles.card}>
      {/* Left side - Image */}
      <Image source={imageSource} style={styles.image} resizeMode="cover" />

      {/* Right side - Text and Button */}
      <View style={styles.leftContent}>
        <View style={styles.textContainer}>
          <Text style={theme.text.headline4}>{title}</Text>
          <Text style={[theme.text.body3, styles.subtitle]}>{subtitle}</Text>
        </View>
        <PrimaryButton title="Choose" onPress={onChoose} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "stretch", // Changed from 'center' to allow column to fill height
    gap: 20,
    padding: 24,
    borderRadius: theme.spacing.md, // 16
    borderWidth: 1,
    borderColor: "#E8E8E9",
    backgroundColor: theme.colors.white,
  },
  leftContent: {
    flex: 1,
    justifyContent: "space-between", // This pushes the button to the bottom
  },
  textContainer: {
    gap: theme.spacing.md, // 16 - Gap between title and subtitle
  },
  subtitle: {
    color: theme.colors.textPrimary,
  },
  image: {
    width: 145,
    height: 168,
    borderRadius: 12,
  },
});

export default GiftSelectionCard;
