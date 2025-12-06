import React, { useEffect, useRef } from "react";
import { View, Image, Animated, StyleSheet, Dimensions } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface GiftBoxAnimationProps {
  onAnimationComplete: () => void;
  isCollaborative?: boolean;
}

const GiftBoxAnimation: React.FC<GiftBoxAnimationProps> = ({
  onAnimationComplete,
  isCollaborative = false,
}) => {
  // Animation values
  const lidTranslateY = useRef(new Animated.Value(-SCREEN_HEIGHT)).current;
  const boxTranslateY = useRef(new Animated.Value(0)).current;

  // Different sizes for individual vs collaborative gifts
  const boxDimensions = isCollaborative
    ? { width: 185, height: 122, lidWidth: 205, lidHeight: 140, lidTop: -108 }
    : { width: 148, height: 98, lidWidth: 164, lidHeight: 112, lidTop: -92 };

  useEffect(() => {
    const sequence = Animated.sequence([
      // Step 1: Wait 0.5s
      Animated.delay(500),

      // Step 2: Lid falls from top and lands on box
      Animated.timing(lidTranslateY, {
        toValue: 0, // Land in resting position
        duration: 600,
        useNativeDriver: true,
      }),

      // Step 3: Wait a moment
      Animated.delay(300),

      // Step 4: Entire box (bottom + lid) rises up off screen
      Animated.timing(boxTranslateY, {
        toValue: -SCREEN_HEIGHT,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);

    sequence.start(() => {
      onAnimationComplete();
    });
  }, []);

  // Select appropriate images based on gift type
  const lidImage = isCollaborative
    ? require("../../assets/images/collab_gift_lid.png")
    : require("../../assets/images/gift_lid.png");

  const bottomImage = isCollaborative
    ? require("../../assets/images/collab_gift_bottom.png")
    : require("../../assets/images/gift_bottom.png");

  return (
    <View style={styles.container}>
      {/* Animated gift box container */}
      <Animated.View
        style={[
          styles.boxContainer,
          {
            transform: [{ translateY: boxTranslateY }],
          },
        ]}
      >
        {/* Box bottom */}
        <View style={[styles.boxBottom, { 
          width: boxDimensions.width, 
          height: boxDimensions.height 
        }]}>
          <Image
            source={bottomImage}
            style={{ 
              width: boxDimensions.width, 
              height: boxDimensions.height 
            }}
            resizeMode="contain"
          />
        </View>

        {/* Box lid - starts off screen, falls down */}
        <Animated.View
          style={[
            styles.boxLid,
            {
              width: boxDimensions.lidWidth,
              height: boxDimensions.lidHeight,
              top: boxDimensions.lidTop,
              transform: [{ translateY: lidTranslateY }],
            },
          ]}
        >
          <Image
            source={lidImage}
            style={{ 
              width: boxDimensions.lidWidth, 
              height: boxDimensions.lidHeight 
            }}
            resizeMode="contain"
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  boxContainer: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  boxBottom: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  boxLid: {
    position: "absolute",
    zIndex: 2,
  },
});

export default GiftBoxAnimation;