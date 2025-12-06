import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { stickers } from "../../../assets/stickers";
import type { StickerBlock } from "../../../types/types";

type Props = {
  block: StickerBlock;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onUpdate: (patch: Partial<StickerBlock>) => void;
};

export default function StickerOverlay({
  block,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
}: Props) {
  // Animatable values
  const translateX = useSharedValue(block.x);
  const translateY = useSharedValue(block.y);
  const scale = useSharedValue(block.size / 100);
  const rotation = useSharedValue(block.rotation);

  const dragStartX = useSharedValue(0);
  const dragStartY = useSharedValue(0);

  /* -------- DRAG -------- */
  const drag = Gesture.Pan()
    .shouldCancelWhenOutside(false)
    .onStart(() => {
      dragStartX.value = translateX.value;
      dragStartY.value = translateY.value;
      runOnJS(onSelect)();
    })
    .onUpdate((e) => {
      translateX.value = dragStartX.value + e.translationX;
      translateY.value = dragStartY.value + e.translationY;
    })
    .onEnd(() => {
      runOnJS(onUpdate)({
        x: translateX.value,
        y: translateY.value,
      });
    });

  /* -------- PINCH -------- */
  const startScale = useSharedValue(scale.value);

  const pinch = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value;
      runOnJS(onSelect)();
    })
    .onUpdate((e) => {
      scale.value = startScale.value * e.scale;
    })
    .onEnd(() => {
      runOnJS(onUpdate)({
        size: scale.value * 100,
      });
    });

  /* -------- ROTATE -------- */
  const startRotation = useSharedValue(rotation.value);

  const rotate = Gesture.Rotation()
    .onStart(() => {
      startRotation.value = rotation.value;
      runOnJS(onSelect)();
    })
    .onUpdate((e) => {
      rotation.value = startRotation.value + e.rotation;
    })
    .onEnd(() => {
      runOnJS(onUpdate)({
        rotation: rotation.value,
      });
    });

  const composed = Gesture.Simultaneous(drag, pinch, rotate);

  /** Animated style */
  const style = useAnimatedStyle(() => ({
    position: "absolute",
    zIndex: 999,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotateZ: `${rotation.value}rad` },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={style} pointerEvents="box-none">
        <TouchableWithoutFeedback onPress={onSelect}>
          <View>
            <Image
              source={stickers[block.content]}
              style={{
                width: block.size,
                height: block.size,
                borderWidth: isSelected ? 2 : 0,
                borderColor: "#4A90E2",
                borderRadius: 12,
              }}
              resizeMode="contain"
            />
          </View>
        </TouchableWithoutFeedback>

        {isSelected && (
          <TouchableOpacity
            onPress={onDelete}
            style={{
              position: "absolute",
              top: -10,
              right: -10,
              padding: 6,
              borderRadius: 20,
              backgroundColor: "rgba(0,0,0,0.7)",
            }}
          >
            <Feather name="trash" size={18} color="white" />
          </TouchableOpacity>
        )}
      </Animated.View>
    </GestureDetector>
  );
}
