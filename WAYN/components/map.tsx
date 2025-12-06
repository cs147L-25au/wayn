import * as ExpoLocation from "expo-location";
import React, { useEffect, useRef } from "react";
import { Image, StyleSheet, View } from "react-native";
import MapView, {
  Marker,
  PoiClickEvent,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import { Friend } from "../types";
import { CustomMapPin, UserMapPin } from "./buttons/mapPin";

interface MapProps {
  location: ExpoLocation.LocationObject;
  friends: Friend[];
  onFriendPress: (friend: Friend) => void;
  onUserPress?: () => void;
  region?: Region;
  onRegionChangeComplete?: (region: Region) => void;
  selectedFriendId?: string | null;
  onPoiClick?: (placeData: {
    placeId: string;
    name: string;
    coordinate: { latitude: number; longitude: number };
  }) => void;
  selectedGiftLocation?: { latitude: number; longitude: number } | null;
  placedGifts?: Array<{
    id: string;
    friendId: string;
    friendName: string;
    friendIcon: any;
    latitude: number;
    longitude: number;
    giftType: string;
    merchantName: string;
    designId: string;
    amount: string;
    dateSent: string;
    address: string;
  }>;
  onGiftPress?: (gift: any) => void;
  // ADD THESE TWO NEW PROPS:
  receivedGifts?: Array<{
    id: string;
    senderId: string;
    senderName: string;
    senderIcon: any;
    latitude: number;
    longitude: number;
    giftType: string;
    dateSent: string;
    address: string;
    isCollaborative?: boolean; // ADD THIS
    collaboratorIcons?: any[]; // ADD THIS
    content?: {
      // ADD THIS
      senderDisplayNames?: {
        host: string;
        collaborators: string[];
      };
      collaboratorIcons?: any[];
    };
  }>;
  onReceivedGiftPress?: (gift: any) => void;
  useInitials?: boolean;
  userIcon?: string | undefined;
  userInitials?: string;
  isLocationSharingEnabled?: boolean;
  showUserInitials?: boolean;
}

const Map: React.FC<MapProps> = ({
  location,
  friends,
  onFriendPress,
  onUserPress,
  region,
  onRegionChangeComplete,
  selectedFriendId,
  onPoiClick,
  selectedGiftLocation,
  placedGifts = [],
  onGiftPress,
  receivedGifts = [], // ADD THIS
  onReceivedGiftPress, // ADD THIS
  useInitials = false,
  userIcon,
  userInitials,
  isLocationSharingEnabled = true,
  showUserInitials = false,
}) => {
  const mapRef = useRef<MapView>(null);

  const OverlappingProfilePics: React.FC<{
    images: any[];
    maxDisplay?: number;
  }> = ({ images, maxDisplay = 3 }) => {
    const displayImages = images.slice(0, maxDisplay);
    const overlap = 18;

    return (
      <View style={styles.overlappingContainer}>
        {displayImages.map((img, index) => (
          <Image
            key={index}
            source={typeof img === "string" ? { uri: img } : img}
            style={[
              styles.overlappingImage,
              { left: index * overlap, zIndex: displayImages.length - index },
            ]}
            resizeMode="cover"
          />
        ))}
      </View>
    );
  };

  // Generate initials from friend name
  const getInitials = (friend: Friend): string => {
    const firstInitial = friend.firstName?.[0]?.toUpperCase() || "";
    const lastInitial = friend.lastName?.[0]?.toUpperCase() || "";
    return `${firstInitial}${lastInitial}`;
  };

  // Function to add small offset to markers at same location
  const getMarkerCoordinates = (friend: Friend, index: number) => {
    // Find if other friends are at the same location
    const friendsAtSameLocation = friends.filter(
      (f, i) =>
        f.latitude === friend.latitude &&
        f.longitude === friend.longitude &&
        i <= index
    );

    // If multiple friends at same location, add a small offset in a circle pattern
    if (friendsAtSameLocation.length > 1) {
      const offsetIndex = friendsAtSameLocation.length - 1;
      const angleStep = (2 * Math.PI) / 8; // Divide circle into 8 positions
      const angle = angleStep * offsetIndex;
      const offset = 0.0001; // Small offset (~10 meters)

      return {
        latitude: friend.latitude + offset * Math.cos(angle),
        longitude: friend.longitude + offset * Math.sin(angle),
      };
    }

    return {
      latitude: friend.latitude,
      longitude: friend.longitude,
    };
  };

  // Function to offset gift markers at same location
  const getGiftMarkerCoordinates = (gift: any, index: number) => {
    const giftsAtSameLocation = placedGifts.filter(
      (g, i) =>
        g.latitude === gift.latitude &&
        g.longitude === gift.longitude &&
        i <= index
    );

    if (giftsAtSameLocation.length > 1) {
      const offsetIndex = giftsAtSameLocation.length - 1;
      const angleStep = (2 * Math.PI) / 8;
      const angle = angleStep * offsetIndex;
      const offset = 0.0001;

      return {
        latitude: gift.latitude + offset * Math.cos(angle),
        longitude: gift.longitude + offset * Math.sin(angle),
      };
    }

    return {
      latitude: gift.latitude,
      longitude: gift.longitude,
    };
  };

  // Animate to region when it changes
  useEffect(() => {
    if (region && mapRef.current) {
      mapRef.current.animateToRegion(region, 500);
    }
  }, [region]);

  // Handle POI (Point of Interest) clicks - these are the Google Maps pins
  const handlePoiClick = (event: PoiClickEvent) => {
    const { placeId, name, coordinate } = event.nativeEvent;

    if (onPoiClick && placeId && name) {
      onPoiClick({
        placeId,
        name,
        coordinate,
      });
    }
  };

  return (
    <MapView
      ref={mapRef}
      style={{ flex: 1 }}
      provider={PROVIDER_GOOGLE}
      initialRegion={{
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
      onRegionChangeComplete={onRegionChangeComplete}
      onPoiClick={handlePoiClick}
    >
      {/* Friend markers with custom view - only show friends with location sharing enabled */}
      {friends
        .filter((friend) => {
          // Filter out friends who have "Location off" as their address
          // This means their location_sharing_enabled is false
          return friend.address !== "Location off";
        })
        .map((friend, index) => {
          const isSelected = selectedFriendId === friend.id;
          const coordinates = getMarkerCoordinates(friend, index);

          return (
            <Marker
              key={friend.id}
              coordinate={coordinates}
              onPress={() => onFriendPress(friend)}
              anchor={{ x: 0.5, y: 1 }}
            >
              <CustomMapPin
                imageSource={friend.icon}
                isSelected={isSelected}
                useInitials={useInitials}
                initials={getInitials(friend)}
              />
            </Marker>
          );
        })}

      {/* User marker */}
      <Marker
        key={"user"}
        coordinate={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }}
        anchor={{ x: 0.5, y: 1 }}
        onPress={() => onUserPress?.()}
      >
        <UserMapPin
          imageSource={
            userIcon || require("../assets/userIcons/hallieicon.png")
          }
          useInitials={showUserInitials}
          initials={userInitials || ""}
          isLocationSharingEnabled={isLocationSharingEnabled}
        />
      </Marker>

      {/* Placed gift markers */}
      {placedGifts.map((gift, index) => {
        const coordinates = getGiftMarkerCoordinates(gift, index);

        // Check if this is a collaborative gift
        const isCollaborative = gift.giftType === "collaborative";
        const giftImage = isCollaborative
          ? require("../assets/images/collab_gift_mini.png")
          : require("../assets/images/gift_mini.png");

        // Different sizes for collaborative vs individual
        const markerSize = isCollaborative ? 80 : 60;
        const profileSize = isCollaborative ? 32 : 24;

        return (
          <Marker
            key={gift.id}
            coordinate={coordinates}
            onPress={() => onGiftPress?.(gift)}
            anchor={{ x: 0.5, y: 1 }}
            zIndex={10}
          >
            <View
              style={[
                styles.giftMarkerContainer,
                { width: markerSize, height: markerSize },
              ]}
            >
              <Image
                source={giftImage}
                style={[
                  styles.giftMarkerImage,
                  { width: markerSize, height: markerSize },
                ]}
                resizeMode="contain"
              />
              <View
                style={[
                  styles.giftMarkerProfilePic,
                  {
                    width: profileSize,
                    height: profileSize,
                    borderRadius: profileSize / 2,
                  },
                ]}
              >
                <Image
                  source={
                    typeof gift.friendIcon === "string"
                      ? { uri: gift.friendIcon }
                      : gift.friendIcon
                  }
                  style={styles.giftMarkerProfilePicImage}
                  resizeMode="cover"
                />
              </View>
            </View>
          </Marker>
        );
      })}

      {/* Received gift markers */}
      {receivedGifts.map((gift, index) => {
        const coordinates = {
          latitude: gift.latitude,
          longitude: gift.longitude,
        };

        // Check if this is a collaborative gift
        const isCollaborative =
          gift.isCollaborative || gift.giftType === "collaborative";
        const giftImage = isCollaborative
          ? require("../assets/images/received_collab_gift__mini.png")
          : require("../assets/images/received_gift_mini.png");

        // Different sizes for collaborative vs individual
        const markerSize = isCollaborative ? 80 : 60;
        const profileSize = isCollaborative ? 40 : 24;

        return (
          <Marker
            key={`received-${gift.id}`}
            coordinate={coordinates}
            onPress={() => onReceivedGiftPress?.(gift)}
            anchor={{ x: 0.5, y: 1 }}
            zIndex={10}
          >
            <View
              style={[
                styles.giftMarkerContainer,
                { width: markerSize, height: markerSize },
              ]}
            >
              <Image
                source={giftImage}
                style={[
                  styles.giftMarkerImage,
                  { width: markerSize, height: markerSize },
                ]}
                resizeMode="contain"
              />
              {isCollaborative &&
              gift.collaboratorIcons &&
              gift.collaboratorIcons.length > 0 ? (
                <View
                  style={[
                    styles.giftMarkerProfilePicNoContainer,
                    { width: profileSize * 1.8, height: profileSize },
                  ]}
                >
                  <OverlappingProfilePics images={gift.collaboratorIcons} />
                </View>
              ) : (
                <View
                  style={[
                    styles.giftMarkerProfilePic,
                    {
                      width: profileSize,
                      height: profileSize,
                      borderRadius: profileSize / 2,
                    },
                  ]}
                >
                  <Image
                    source={
                      typeof gift.senderIcon === "string"
                        ? { uri: gift.senderIcon }
                        : gift.senderIcon
                    }
                    style={styles.giftMarkerProfilePicImage}
                    resizeMode="cover"
                  />
                </View>
              )}
            </View>
          </Marker>
        );
      })}

      {/* Selected gift location - RENDER LAST so it appears on top */}
      {selectedGiftLocation && (
        <Marker
          key={`gift-location-${selectedGiftLocation.latitude}-${selectedGiftLocation.longitude}`}
          coordinate={{
            latitude: selectedGiftLocation.latitude + 0.0001, // Small offset (~10 meters north)
            longitude: selectedGiftLocation.longitude + 0.0001, // Small offset (~10 meters east)
          }}
          anchor={{ x: 0.5, y: 1 }}
          zIndex={10}
        >
          <View style={styles.giftPinContainer}>
            <Image
              source={require("../assets/images/location_icon.png")}
              style={styles.giftPinImage}
              resizeMode="contain"
            />
          </View>
        </Marker>
      )}
    </MapView>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: "center",
  },
  markerContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerContentSelected: {
    backgroundColor: "#FF6B54",
    transform: [{ scale: 1.1 }],
  },
  markerImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  markerImageSelected: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  markerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#212121",
  },
  markerTextSelected: {
    fontSize: 13,
    color: "white",
  },
  markerTriangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "white",
    marginTop: -1,
  },
  markerTriangleSelected: {
    borderTopColor: "#FF6B54",
  },
  emojiMarker: {
    fontSize: 32,
  },
  giftPinContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  giftPinImage: {
    width: 50, // Adjust this to change size
    height: 50, // Adjust this to change size
  },

  giftMarkerContainer: {
    width: 60,
    height: 60,
    position: "relative",
  },
  giftMarkerImage: {
    width: 60,
    height: 60,
  },
  giftMarkerProfilePic: {
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
  giftMarkerProfilePicImage: {
    width: "100%",
    height: "100%",
  },
  overlappingContainer: {
    flexDirection: "row",
    width: 60, // ✅ Changed from 24
    height: 40, // ✅ Changed from 24
    position: "relative",
  },
  overlappingImage: {
    position: "absolute",
    width: 24, // ✅ Changed from 16
    height: 24, // ✅ Changed from 16
    borderRadius: 16, // ✅ Changed from 8
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  giftMarkerProfilePicNoContainer: {
    position: "absolute",
    bottom: -10,
    right: 0,
    // No width/height constraints
    // No border radius
    // No border
    // No overflow hidden
  },
});

export default Map;
