import React, { useRef, useState } from "react";
import { PanResponder, View } from "react-native";
import Svg, { Polyline } from "react-native-svg";
import type { DrawBlock, DrawStroke } from "../../../types/types";

type DrawOverlayProps = {
  block: DrawBlock;
  color: string;
  thickness: number;
  isSelected: boolean;
  isActive: boolean;
  isErasing?: boolean;
  onSelect: () => void;
  onUpdate: (patch: Partial<DrawBlock>) => void;
  setScrollEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  onDelete: () => void; // kept for compatibility, not used
};

export default function DrawOverlay({
  block,
  color,
  thickness,
  isSelected,
  isActive,
  isErasing,
  onSelect,
  onUpdate,
  setScrollEnabled,
}: DrawOverlayProps) {
  const [currentStroke, setCurrentStroke] = useState<DrawStroke | null>(null);
  const viewRef = useRef<View>(null);

  /** Convert global screen coords → local coords inside the drawing view */
  const getLocalPoint = (
    x: number,
    y: number,
    cb: (p: { x: number; y: number }) => void
  ) => {
    viewRef.current?.measure((fx, fy, width, height, px, py) => {
      cb({ x: x - px, y: y - py });
    });
  };

  /** Erase strokes within radius */
  const eraseAtPoint = (x: number, y: number) => {
    const hit = 18;

    const remaining = block.strokes.filter((stroke) => {
      return !stroke.points.some((p) => Math.hypot(p.x - x, p.y - y) < hit);
    });

    onUpdate({ strokes: remaining });
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => Boolean(isActive || isErasing),
    onMoveShouldSetPanResponder: () => Boolean(isActive || isErasing),

    onPanResponderStart: (_, gesture) => {
      onSelect();

      if (isActive || isErasing) setScrollEnabled(false);

      if (isErasing) {
        getLocalPoint(gesture.x0, gesture.y0, ({ x, y }) => eraseAtPoint(x, y));
        return;
      }

      if (!isActive) return;

      const stroke: DrawStroke = {
        id: Date.now().toString(),
        color,
        thickness,
        points: [],
      };

      getLocalPoint(gesture.x0, gesture.y0, ({ x, y }) => {
        stroke.points = [{ x, y }];
        setCurrentStroke(stroke);
      });
    },

    onPanResponderMove: (_, gesture) => {
      if (isErasing) {
        getLocalPoint(gesture.moveX, gesture.moveY, ({ x, y }) =>
          eraseAtPoint(x, y)
        );
        return;
      }

      if (!isActive || !currentStroke) return;

      getLocalPoint(gesture.moveX, gesture.moveY, ({ x, y }) => {
        setCurrentStroke((prev) =>
          prev ? { ...prev, points: [...prev.points, { x, y }] } : prev
        );
      });
    },

    onPanResponderEnd: () => {
      if (currentStroke) {
        onUpdate({
          strokes: [...block.strokes, currentStroke],
        });
      }
      setCurrentStroke(null);
      // Re-enable parent scroll
      setScrollEnabled(true);
    },
  });

  return (
    <View
      ref={viewRef}
      {...panResponder.panHandlers}
      pointerEvents={isActive || isErasing ? "auto" : "box-none"}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {/* Entire drawing canvas */}
      <Svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        {block.strokes.map((stroke) => (
          <Polyline
            key={stroke.id}
            points={stroke.points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke={stroke.color}
            strokeWidth={stroke.thickness}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {currentStroke && (
          <Polyline
            points={currentStroke.points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke={currentStroke.color}
            strokeWidth={currentStroke.thickness}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </Svg>
    </View>
  );
}
