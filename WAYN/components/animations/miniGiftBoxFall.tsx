import React, { useEffect, useRef } from "react";
import { View, Image, Animated, StyleSheet } from "react-native";

interface MiniGiftBoxFallProps {
  recipientImage: any;
  onAnimationComplete: () => void;
  targetPosition: { x: number; y: number };
  isCollaborative?: boolean;
  collaboratorImages?: any[];
}

const MiniGiftBoxFall: React.FC<MiniGiftBoxFallProps> = ({
  recipientImage,
  onAnimationComplete,
  targetPosition,
  isCollaborative = false,
  collaboratorImages = [],
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(translateY, {
        toValue: targetPosition.y,
        duration: 800,
        useNativeDriver: true,
      }),
      // Small bounce effect when landing
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Wait a moment before completing
      setTimeout(() => {
        onAnimationComplete();
      }, 300);
    });
  }, []);

  // Select appropriate gift image
  const giftImage = isCollaborative
    ? require("../../assets/images/collab_gift_mini.png")
    : require("../../assets/images/gift_mini.png");

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: targetPosition.x,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <Image
        source={giftImage}
        style={styles.giftBox}
        resizeMode="contain"
      />
      <View style={styles.profilePicContainer}>
        <Image
          source={recipientImage}
          style={styles.profilePic}
          resizeMode="cover"
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: 60,
    height: 60,
    zIndex: 1000,
  },
  giftBox: {
    width: 60,
    height: 60,
  },
  profilePicContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    overflow: "hidden",
  },
  profilePic: {
    width: "100%",
    height: "100%",
  },
});

export default MiniGiftBoxFall;