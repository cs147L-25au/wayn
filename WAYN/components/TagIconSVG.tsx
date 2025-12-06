// components/TagIconSvg.tsx
import React from "react";
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  Mask,
  Path,
  Rect,
} from "react-native-svg";

export type TagVariant = "music" | "pen" | "money" | "sound";

type Props = {
  variant: TagVariant;
  width?: number;
  height?: number;
  color?: string;
};

export const TagIconSvg: React.FC<Props> = ({
  variant,
  width = 36,
  height,
  color = "#FF6B54",
}) => {
  // Maintain aspect ratio of original SVG (85 x 81)
  const computedHeight = height ?? (width * 81) / 85;

  const renderIcon = () => {
    switch (variant) {
      case "music":
        return (
          <>
            <Path
              d="M62.3891 59.5054L69.5147 51.1254L59.8391 45.5234L52.7134 53.9035"
              stroke="white"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M56.8647 61.3713L57.6265 62.0191C58.468 62.7346 59.7302 62.6325 60.4457 61.791L62.3891 59.5055L60.1036 57.5622C59.2621 56.8466 57.9999 56.9487 57.2844 57.7903L56.6366 58.5521C55.921 59.3936 56.0232 60.6558 56.8647 61.3713Z"
              stroke="white"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M47.1891 55.7692L47.951 56.417C48.7924 57.1325 50.0546 57.0305 50.7702 56.1889L52.7135 53.9035L50.428 51.9601C49.5866 51.2446 48.3244 51.3467 47.6088 52.1882L46.961 52.95C46.2455 53.7915 46.3476 55.0537 47.1891 55.7692Z"
              stroke="white"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );

      case "pen":
        return (
          <>
            <Path
              d="M63.5029 49.4939L65.5891 49.3251C66.6901 49.2361 67.6548 50.0564 67.7439 51.1574L67.9051 53.1508C67.9942 54.2518 67.1739 55.2165 66.0729 55.3056L63.9867 55.4744M63.5029 49.4939L49.9486 50.5905C49.4805 50.6284 49.0407 50.8297 48.7061 51.1594L46.7465 53.0903C46.3031 53.5272 46.3623 54.2586 46.8701 54.6185L49.1147 56.2092C49.4978 56.4808 49.9643 56.6088 50.4324 56.571L63.9867 55.4744M63.5029 49.4939L63.9867 55.4744"
              stroke="white"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );

      case "money":
        return (
          <>
            <Path
              d="M43.9258 53.4321L56.0177 39.2114C56.2562 38.9309 56.6769 38.8968 56.9574 39.1353L71.1782 51.2273C71.4587 51.4658 71.4927 51.8865 71.2542 52.167L59.1623 66.3878C58.9237 66.6683 58.5031 66.7023 58.2225 66.4638L44.0018 54.3719C43.7213 54.1333 43.6872 53.7126 43.9258 53.4321Z"
              stroke="white"
              strokeWidth={2.5}
            />
            <Path
              d="M62.1428 52.0765C62.0647 51.111 61.4544 49.9666 60.6291 49.2256M60.6291 49.2256C59.6471 48.3441 58.3609 48.0338 57.305 49.2756C55.3617 51.561 60.5234 53.9811 58.58 56.2666C57.4717 57.5701 55.8803 57.1819 54.7457 56.1447M60.6291 49.2256L61.8007 47.8477M53.3613 53.1417C53.2956 54.2138 53.8911 55.3634 54.7457 56.1447M54.7457 56.1447L53.3795 57.7514"
              stroke="white"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );

      case "sound":
        return (
          <>
            <Path
              d="M47.9153 47.2006L50.3213 44.371C51.0369 43.5295 51.5372 42.7796 52.3787 43.4951L54.588 45.3737C54.7371 45.5004 54.9201 45.5807 55.1144 45.6044L62.2468 46.4771C63.0374 46.5739 63.4031 47.5108 62.8872 48.1175L53.6332 59.0008C53.1174 59.6074 52.1338 59.3971 51.9112 58.6324L49.9032 51.733C49.8485 51.5451 49.74 51.3773 49.5909 51.2506L47.3816 49.372C46.5401 48.6565 47.1998 48.0421 47.9153 47.2006Z"
              stroke="white"
              strokeWidth={2.5}
            />
            <Path
              d="M63.9354 52.2881C63.9354 52.2881 64.1065 54.4025 62.487 56.3071C60.8676 58.2116 58.7531 58.3827 58.7531 58.3827"
              stroke="white"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M68.1642 51.946C68.1642 51.946 68.4493 55.47 65.5342 58.8982C62.6192 62.3264 59.0952 62.6115 59.0952 62.6115"
              stroke="white"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );
    }
  };

  return (
    <Svg
      width={width}
      height={computedHeight}
      viewBox="0 0 85 81"
      fill="none"
    >
      {/* Background tag shape */}
      <Defs>
        <ClipPath id="tagClip">
          <Rect
            width={24}
            height={24}
            fill="white"
            transform="translate(56.2215 35.8843) rotate(40.3746)"
          />
        </ClipPath>
        <Mask id="tagMask">
          <Path d="M59.422 80.238L12.1888 40.0755L37.4523 10.3643L84.6855 50.5268L59.422 80.238Z" fill="white" />
        </Mask>
      </Defs>

      <Path
        d="M59.422 80.238L12.1888 40.0755L37.4523 10.3643L84.6855 50.5268L59.422 80.238Z"
        fill={color}
      />
      <Path
        d="M59.422 80.238L58.1264 81.7617L59.6501 83.0573L60.9456 81.5336L59.422 80.238ZM84.6855 50.5268L86.2091 51.8224L87.5047 50.2988L85.9811 49.0032L84.6855 50.5268ZM59.422 80.238L60.7175 78.7144L13.4844 38.5519L12.1888 40.0755L10.8932 41.5992L58.1264 81.7617L59.422 80.238ZM37.4523 10.3643L36.1568 11.888L83.3899 52.0505L84.6855 50.5268L85.9811 49.0032L38.7479 8.84068L37.4523 10.3643ZM84.6855 50.5268L83.1618 49.2313L57.8983 78.9425L59.422 80.238L60.9456 81.5336L86.2091 51.8224L84.6855 50.5268Z"
        fill="white"
        mask="url(#tagMask)"
      />
      <Path
        d="M12.6005 14.8922L36.1105 11.9428L24.798 25.2468L13.4842 38.5524L12.6005 14.8922Z"
        fill={color}
      />
      <Circle
        cx={25.3699}
        cy={24.3407}
        r={4.5}
        transform="rotate(-49.6254 25.3699 24.3407)"
        fill="white"
      />

      {/* Icon clipped into the rotated rectangle */}
      <G clipPath="url(#tagClip)">{renderIcon()}</G>
    </Svg>
  );
};
