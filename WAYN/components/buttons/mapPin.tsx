import { theme } from "@/assets/theme";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Image, ImageSourcePropType, StyleSheet, Text, View } from "react-native";

interface CustomMapPinProps {
  imageSource: ImageSourcePropType | string;
  isSelected?: boolean;
  useInitials?: boolean;
  initials?: string;
}

interface UserMapPinProps extends CustomMapPinProps {
  useInitials?: boolean;
  initials?: string;
  isLocationSharingEnabled?: boolean;
}

const BaseMapPin: React.FC<CustomMapPinProps & { triangleColor: string; borderColor: string; initialsColor: string; isGreyedOut?: boolean; }> = ({
  imageSource,
  isSelected = false,
  useInitials = false,
  initials = "",
  triangleColor,
  borderColor,
  initialsColor,
  isGreyedOut = false,
}) => {
  const imageUrl =
    typeof imageSource === "string" ? { uri: imageSource } : imageSource;

  const scale = isSelected ? 1.25 : 1;
  const circleSize = 64 * scale;
  const borderWidth = 3 * scale;
  const imageSize = circleSize - borderWidth * 2;
  const triangleWidth = 32 * scale;
  const triangleHeight = 55 * scale;

  return (
    <View
      style={[
        styles.pinContainer,
        {
          width: 64 * 1.5,
          height: 87 * 1.5,
          opacity: isGreyedOut ? 0.5 : 1,
        },
      ]}
    >
      {/* Triangle pointing down */}
      <View
        style={[
          styles.triangle,
          {
            top: circleSize / 2 - 1,
            borderLeftWidth: triangleWidth,
            borderRightWidth: triangleWidth,
            borderTopWidth: triangleHeight,
            borderTopColor: triangleColor,
          },
        ]}
      />

      {/* Circle with image or initials on top */}
      <View
        style={[
          styles.circle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            borderWidth: borderWidth,
            borderColor: borderColor,
            backgroundColor: "white",
          },
        ]}
      >
        {useInitials ? (
          <Text
            style={[
              styles.initialsText,
              {
                fontSize: (imageSize * 0.4) * scale,
                color: initialsColor,
              },
            ]}
          >
            {initials}
          </Text>
        ) : (
          <Image
            source={imageUrl}
            style={[
              styles.profileImage,
              {
                width: imageSize,
                height: imageSize,
                borderRadius: imageSize / 2,
              },
            ]}
          />
        )}
      </View>
      
      {/* Lock icon overlay when location sharing is disabled */}
      {isGreyedOut && (
        <View
          style={[
            styles.lockOverlay,
            {
              width: circleSize,
              height: circleSize,
            },
          ]}
        >
          <View style={styles.lockIconContainer}>
            <Feather name="lock" size={16} color="#FFFFFF" />
          </View>
        </View>
      )}
    </View>
  );
};

export const UserMapPin: React.FC<UserMapPinProps> = ({ isLocationSharingEnabled = true, ...props }) => {
  const blueColor = theme.colors.waynBlue;
  const isGreyedOut = !isLocationSharingEnabled;
  
  return (
    <BaseMapPin
      {...props}
      triangleColor={blueColor}
      borderColor={blueColor}
      initialsColor={blueColor}
      isGreyedOut={isGreyedOut}
    />
  );
};

export const CustomMapPin: React.FC<CustomMapPinProps> = ({
  imageSource,
  isSelected = false,
  useInitials = false,
  initials = "",
}) => {
  return (
    <BaseMapPin
      imageSource={imageSource}
      isSelected={isSelected}
      useInitials={useInitials}
      initials={initials}
      triangleColor={theme.colors.waynOrange}
      borderColor={theme.colors.waynOrange}
      initialsColor={theme.colors.waynOrange}
    />
  );
};

const styles = StyleSheet.create({
  pinContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  circle: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    position: "absolute",
    top: 0,
    zIndex: 2,
  },
  profileImage: {
    resizeMode: "cover",
  },
  initialsText: {
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
  triangle: {
    position: "absolute",
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    zIndex: 1,
  },
  lockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    zIndex: 3,
  },
  lockIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    marginLeft: 10,
  },
});
