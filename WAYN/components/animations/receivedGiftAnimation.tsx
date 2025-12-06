import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, Image } from "react-native";

interface ReceivedGiftAnimationProps {
  width?: number; // Total width of the animation area
  height?: number; // Total height of the animation area
  isCollaborative?: boolean;
}

const ReceivedGiftAnimation: React.FC<ReceivedGiftAnimationProps> = ({
  width = 200,
  height = 200,
  isCollaborative = false,
}) => {
  const bobAnimation = useRef(new Animated.Value(0)).current;

  // Calculate sizes maintaining aspect ratio
  // Box is 45 wide, pin is 24 wide in original images
  const boxWidth = isCollaborative ? width * 0.65 : width * 0.5; // Collab is 65%, regular is 50%
  const boxHeight = boxWidth; // Assuming square aspect ratio for box
  
  // ✅ CHANGED: Pin size always based on regular box width (50% of container)
  const regularBoxWidth = width * 0.5;
  const pinWidth = (24 / 45) * regularBoxWidth; // Always maintain ratio to regular box
  const pinHeight = pinWidth * 1.5; // Pins are typically taller

  useEffect(() => {
    // Create looping bob animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnimation, {
          toValue: -15, // Bob up 15 pixels
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(bobAnimation, {
          toValue: 0, // Bob back down
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [bobAnimation]);

  //Select gift box image based on collaborative status
  const giftBoxImage = isCollaborative
    ? require("../../assets/images/received_collab_gift_ bottom.png")
    : require("../../assets/images/received_box_bottom.png");

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Bobbing pin positioned above the box */}
      <Animated.View
        style={[
          styles.pinContainer,
          {
            width: pinWidth,
            height: pinHeight,
            transform: [{ translateY: bobAnimation }],
            bottom: boxHeight + (isCollaborative ? 1 : 10), // ✅ CHANGED: Lower gap for collab (5px vs 10px)
          },
        ]}
      >
        <Image
          source={require("../../assets/images/received_pin.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Static gift box at the bottom center */}
      <View
        style={[
          styles.boxContainer,
          {
            width: boxWidth,
            height: boxHeight,
          },
        ]}
      >
        <Image
          source={giftBoxImage}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  pinContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  boxContainer: {
    position: "absolute",
    bottom: 20, // Some padding from bottom
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});

export default ReceivedGiftAnimation;