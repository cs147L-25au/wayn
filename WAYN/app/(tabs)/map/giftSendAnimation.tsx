import React, { useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { theme } from "../../../assets/theme";
import GiftBoxAnimation from "../../../components/animations/giftBoxAnimation";

export default function GiftSendAnimationScreen() {
  const params = useLocalSearchParams();
  const {
    friendName,
    friendId,
    friendIcon,
    locationName,
    locationAddress,
    locationLatitude,
    locationLongitude,
    giftType,
    giftId,
    giftImage,
    designId,
    merchantName,
    amount,
    audioUri,
    isCollaborative,
  } = params;

  const [showMessage, setShowMessage] = useState(false);
  const messageOpacity = React.useRef(new Animated.Value(0)).current;

  const handleAnimationComplete = () => {
    // Show "Gift Sent!" message
    setShowMessage(true);
    Animated.timing(messageOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Wait 1.5s then navigate to map with gift drop animation
      setTimeout(() => {
        router.dismissTo({
          pathname: "/(tabs)/map",
          params: {
            showGiftDrop: "true",
            friendId,
            friendIcon,
            locationLatitude,
            locationLongitude,
            friendName,
            giftType,
            giftId,
            merchantName,
            designId,
            amount,
            locationAddress,
            isCollaborative: isCollaborative === "true" ? "true" : undefined,
          },
        });
      }, 1500);
    });
  };

  return (
    <View style={styles.container}>
      {!showMessage ? (
        <GiftBoxAnimation
          onAnimationComplete={handleAnimationComplete}
          isCollaborative={isCollaborative === "true"}
        />
      ) : (
        <Animated.View
          style={[styles.messageContainer, { opacity: messageOpacity }]}
        >
          <Text style={styles.messageText}>Gift Sent!</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messageText: {
    ...theme.text.headline1,
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
});