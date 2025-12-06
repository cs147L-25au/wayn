import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet } from "react-native";

interface ShakingGiftBoxProps {
  imageSource: any;
  size?: number;
}

const ShakingGiftBox: React.FC<ShakingGiftBoxProps> = ({
  imageSource,
  size = 200,
}) => {
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shake = () => {
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    };

    // Shake every second
    const interval = setInterval(shake, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          transform: [
            {
              rotate: shakeAnimation.interpolate({
                inputRange: [-10, 10],
                outputRange: ["-5deg", "5deg"],
              }),
            },
          ],
        },
      ]}
    >
      <Image 
        source={imageSource} 
        style={{ width: size, height: size }} // Use size prop instead of hardcoded style
        resizeMode="contain" 
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center", // Add this to center it in the popup
  },
});

export default ShakingGiftBox;