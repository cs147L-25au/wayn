import React, { useEffect, useRef } from "react";
import { View, Image, StyleSheet, Animated } from "react-native";
import { theme } from "../../assets/theme";
import { CustomMapPin } from "../buttons/mapPin";

interface NudgeAnimationProps {
  friendIcon: any;
}

const NudgeAnimation: React.FC<NudgeAnimationProps> = ({ friendIcon }) => {
  // Animation values
  const fingerX = useRef(new Animated.Value(60)).current; // Start right
  const pinRotation = useRef(new Animated.Value(0)).current; // Rotation around pivot
  const pinX = useRef(new Animated.Value(-20)).current; // Start slightly left

  useEffect(() => {
    // Create the animation sequence
    const nudgeSequence = Animated.sequence([
      // 1. Finger moves left to nudge
      Animated.timing(fingerX, {
        toValue: -10,
        duration: 400,
        useNativeDriver: true,
      }),

      // 2. Simultaneous: finger pushes icon, icon rotates
      Animated.parallel([
        // Finger continues slightly
        Animated.timing(fingerX, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        }),
        // Icon gets pushed left
        Animated.timing(pinX, {
          toValue: -35,
          duration: 200,
          useNativeDriver: true,
        }),
        // Icon tilts as it's pushed
        Animated.timing(pinRotation, {
          toValue: -15, // Tilt 15 degrees left
          duration: 200,
          useNativeDriver: true,
        }),
      ]),

      // 3. Finger retreats
      Animated.timing(fingerX, {
        toValue: 60,
        duration: 300,
        useNativeDriver: true,
      }),

      // 4. Icon springs back with wobble
      Animated.parallel([
        Animated.spring(pinX, {
          toValue: -20,
          friction: 5,
          tension: 60,
          useNativeDriver: true,
        }),
        // Single spring for rotation with natural oscillation
        Animated.spring(pinRotation, {
          toValue: 0,
          friction: 3, // Lower friction = more oscillation
          tension: 40, // Lower tension = bouncier
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Start animation
    nudgeSequence.start();
  }, []);

  const pinRotateInterpolation = pinRotation.interpolate({
    inputRange: [-15, 15],
    outputRange: ["-15deg", "15deg"],
  });

  return (
    <View style={styles.container}>
      {/* Map Pin - pivots around bottom point */}
      <Animated.View
        style={[
          styles.pinWrapper,
          {
            transform: [
              { translateX: pinX },
              { translateY: 10 }, // Move down so rotation pivot is at bottom
              { rotate: pinRotateInterpolation },
              { translateY: -10 }, // Move back up
            ],
          },
        ]}
      >
        <CustomMapPin imageSource={friendIcon} isSelected={false} />
      </Animated.View>

      {/* Pointer finger */}
      <Animated.Image
        source={require("../../assets/images/nudge_pointer.png")}
        style={[
          styles.finger,
          {
            transform: [{ translateX: fingerX }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  pinWrapper: {
    position: "absolute",
    left: "40%",
  },
  finger: {
    position: "absolute",
    width: 60,
    height: 60,
    right: "30%",
    resizeMode: "contain",
  },
});

export default NudgeAnimation;
