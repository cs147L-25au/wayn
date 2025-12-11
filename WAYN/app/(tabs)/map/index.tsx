import StatusDropdown, { StatusOption } from "@/components/statusDropdown";
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  useFonts,
} from "@expo-google-fonts/poppins";
import BottomSheet from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as ExpoLocation from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  StyleSheet,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Region } from "react-native-maps";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import MiniGiftBoxFall from "../../../components/animations/miniGiftBoxFall";
import { db } from "../../../utils/supabase";

import GiftPopup from "@/components/giftShakePopup";
import GiftReceivedPopupCard from "@/components/popups/giftReceivedPopup";
import GiftContentPopup from "../../../components/popups/giftContentPopup";
import ReceivedGiftDetailOverlay from "../../../components/receivedGiftDetailOverlay";

const LOCATION_SHARING_KEYS = {
  locationEnabled: "location_sharing_enabled",
};

import { LocationCategory, categoryIcons } from "../../../utils/categoryIcons";

import { fetchPlaceDetails } from "../../../utils/googlePlaces";

import BottomCTABar from "../../../components/buttons/bottomCTA";
import FriendDetailOverlay from "../../../components/friendDetailOverlay";
import FriendListOverlay from "../../../components/friendListOverlay";
import GiftDetailOverlay from "../../../components/giftDetailOverlay";
import LocationSelectionOverlay from "../../../components/locationSelectionOverlay";
import Map from "../../../components/map";
import OverlayHeader from "../../../components/navigation/overlayHeader";
import PopupCard from "../../../components/popups/popupImage";

import { theme } from "../../../assets/theme";
import { Friend, Location as LocationType } from "../../../types/index";
import getEnv from "../../../utils/env";

import GiftDraftsButton from "../../../components/buttons/giftDrafts";

import { useAuth } from "../../../contexts/authContext";
import { NudgeData, NudgeService } from "../../../services/nudgeService";
import { UserService } from "../../../services/userService";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const { GOOGLE_MAPS_API_KEY } = getEnv();

const mockLocations: LocationType[] = [
  {
    id: "1",
    locationName: "Blue Bottle Coffee",
    address: "450 Serra Mall, Stanford, CA",
    distance: "0.3 mi away",
    category: "cafe" as LocationCategory,
    categoryIconUrl: categoryIcons.cafe,
  },
  {
    id: "2",
    locationName: "Coupa Café",
    address: "538 Ramona St, Palo Alto, CA",
    distance: "1.2 mi away",
    category: "cafe" as LocationCategory,
    categoryIconUrl: categoryIcons.cafe,
  },
  {
    id: "3",
    locationName: "Green Library",
    address: "557 Escondido Mall, Stanford, CA",
    distance: "0.4 mi away",
    category: "school" as LocationCategory,
    categoryIconUrl: categoryIcons.school,
  },
  {
    id: "4",
    locationName: "Dish Trail",
    address: "Stanford, CA 94305",
    distance: "1.9 mi away",
    category: "outdoors" as LocationCategory,
    categoryIconUrl: categoryIcons.outdoors,
  },
  {
    id: "5",
    locationName: "The Counter",
    address: "369 California Ave, Palo Alto, CA",
    distance: "2.1 mi away",
    category: "restaurant" as LocationCategory,
    categoryIconUrl: categoryIcons.restaurant,
  },
  {
    id: "6",
    locationName: "Stanford Stadium",
    address: "625 Nelson Rd, Stanford, CA",
    distance: "0.8 mi away",
    category: "activity" as LocationCategory,
    categoryIconUrl: categoryIcons.activity,
  },
  {
    id: "7",
    locationName: "Target",
    address: "3601 El Camino Real, Palo Alto, CA",
    distance: "1.5 mi away",
    category: "shopping" as LocationCategory,
    categoryIconUrl: categoryIcons.shopping,
  },
];

// Update mockLocationsWithCoords to include category
const mockLocationsWithCoords = mockLocations.map((loc, index) => ({
  ...loc,
  latitude: 37.422525 + index * 0.01,
  longitude: -122.166915 + index * 0.01,
}));

// Controls which UI display is shown on overlay
type OverlayView =
  | "list"
  | "detail"
  | "locationSelection"
  | "giftDetail"
  | "receivedGiftDetail";

export default function App() {
  // Used to trigger automated gift-drop flow when map is opened with params
  const params = useLocalSearchParams();
  const {
    showGiftDrop,
    friendId,
    friendIcon,
    locationLatitude,
    locationLongitude,
    friendName,
    giftType,
    giftId,
    merchantName,
    designId,
    amount,
    locationAddress,
  } = params;

  interface CollabInviteNotification {
    id: string;
    created_at: string;
    receiver_id: string;
    sender_id: string;
    sender_display_name: string;
    sender_icon: string;
    gift_receiver_display_name: string;
    session_id: string;
    payload: {
      createdAt?: string;
      hostName: string;
      hostId: string;
      giftCount: any;
      sessionId: string;
      friendName: string; // receiver display name
      friendId: string;
      locationAddress: string;
      locationName: string;
      collaboratorIds: string[];
    };
  }

  // State for incoming collaboration invites
  const [collabInvite, setCollabInvite] =
    useState<CollabInviteNotification | null>(null);

  const handleAcceptCollab = () => {
    // Alert.alert("Gift collaboration feature coming soon!");
    // return;
    // Navigate to the collaborative gift basket
    console.log("Collab invite payload:", collabInvite?.payload);
    router.push({
      pathname: "/(tabs)/map/collabGiftBasket",
      params: collabInvite?.payload,
    });
    setCollabInvite(null);
  };

  const [showingGiftDrop, setShowingGiftDrop] = useState(false);
  const [giftDropComplete, setGiftDropComplete] = useState(false);
  const [giftDropPosition, setGiftDropPosition] = useState({ x: 0, y: 0 });

  interface PlacedGift {
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
    isCollaborative?: boolean;
  }

  interface ReceivedGift {
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
    content: {
      gifts?: any[]; // For collaborative gifts
      senderDisplayNames?: {
        // For collaborative gifts
        host: string;
        collaborators: string[];
      };
      merchantName?: string;
      designId?: string;
      amount?: string;
      audioUri?: string;
      playlistName?: string;
      songs?: Array<{ id: string; title: string; artist: string }>;
      letter?: Array<{
        id: string;
        type: "text" | "image" | "sticker" | "draw";
        content?: string;
        aspectRatio?: number;
        size?: number;
        x?: number;
        y?: number;
        rotation?: number;
        strokes?: Array<{
          id: string;
          color: string;
          thickness: number;
          points: Array<{ x: number; y: number }>;
        }>;
      }>;
    };
  }

  const [placedGifts, setPlacedGifts] = useState<PlacedGift[]>([]);
  const [selectedGift, setSelectedGift] = useState<PlacedGift | null>(null);

  const [fontsLoaded] = useFonts({
    "Poppins-Regular": Poppins_400Regular,
    "Poppins-SemiBold": Poppins_600SemiBold,
  });
  const [userStatus, setUserStatus] = useState<StatusOption | null>(null);
  const [location, setLocation] = useState<ExpoLocation.LocationObject | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [locationSharingEnabled, setLocationSharingEnabled] = useState(true);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [70, 300, 600], []);
  const [sheetIndex, setSheetIndex] = useState(0);
  const locationSnapPoints = useMemo(() => [150, 550, 750], []);

  const [receivedGifts, setReceivedGifts] = useState<ReceivedGift[]>([]);
  const [selectedReceivedGift, setSelectedReceivedGift] =
    useState<ReceivedGift | null>(null);
  const [showGiftReceivedPopup, setShowGiftReceivedPopup] = useState(false);
  const [showArrivedPopup, setShowArrivedPopup] = useState(false);
  const [showGiftContentPopup, setShowGiftContentPopup] = useState(false);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const loadLocationSharingStatus = useCallback(async () => {
    try {
      const value = await AsyncStorage.getItem(
        LOCATION_SHARING_KEYS.locationEnabled
      );
      if (value !== null) {
        setLocationSharingEnabled(JSON.parse(value));
      }
    } catch (error) {
      console.error("Error loading location sharing setting:", error);
    }
  }, []);

  useEffect(() => {
    loadLocationSharingStatus();
  }, [loadLocationSharingStatus]);

  // Reload location sharing status when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadLocationSharingStatus();
    }, [loadLocationSharingStatus])
  );

  const [mapRegion, setMapRegion] = useState<Region | undefined>(undefined);
  const [defaultRegion, setDefaultRegion] = useState<Region | undefined>(
    undefined
  );

  const { currentUser } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);

  const [overlayView, setOverlayView] = useState<OverlayView>("list");
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<
    (LocationType & { latitude: number; longitude: number }) | null
  >(null);

  const [incomingNudge, setIncomingNudge] = useState<NudgeData | null>(null);
  const [outgoingNudge, setOutgoingNudge] = useState<Friend | null>(null);
  const [currentNudgeId, setCurrentNudgeId] = useState<string | null>(null);

  // New state for POI-selected location
  const [poiSelectedLocation, setPoiSelectedLocation] = useState<
    (LocationType & { latitude: number; longitude: number }) | null
  >(null);
  const [loadingPlaceDetails, setLoadingPlaceDetails] = useState(false);
  const [useInitials, setUseInitials] = useState(false);

  const getUserInitials = (displayName?: string) => {
    if (!displayName) return "";
    const parts = displayName.trim().split(" ");
    const firstInitial = parts[0]?.[0]?.toUpperCase() || "";
    const secondInitial = parts.slice(1).join(" ")?.[0]?.toUpperCase() || "";
    return `${firstInitial}${secondInitial}`.trim().slice(0, 2);
  };

  // Load friends from backend
  const loadFriends = async () => {
    if (!currentUser) return;

    setLoadingFriends(true);
    const result = await UserService.getFriends(currentUser.id);
    if (result.success && result.friends) {
      setFriends(result.friends);
    } else {
      console.error("Failed to load friends:", result.error);
    }
    setLoadingFriends(false);
  };

  // Handle status change
  const handleStatusChange = async (status: StatusOption) => {
    if (!currentUser) return;

    setUserStatus(status);
    const result = await UserService.updateStatus(currentUser.id, status);
    if (!result.success) {
      console.error("Failed to update status:", result.error);
    }
  };

  // Update location in backend
  const updateLocationInBackend = async (
    latitude: number,
    longitude: number,
    address: string
  ) => {
    if (!currentUser) return;

    const result = await UserService.updateLocation(
      currentUser.id,
      latitude,
      longitude,
      address
    );
    if (!result.success) {
      console.error("Failed to update location:", result.error);
    }
  };

  // Handle incoming nudge
  // Replace your existing nudge handlers with these:

  const clearIncomingNudge = async () => {
    if (incomingNudge) {
      await NudgeService.markNudgeAsSeen(incomingNudge.id);
    }
    setIncomingNudge(null);
  };

  const handleNudgeBack = async () => {
    if (!currentUser || !incomingNudge) return;

    // Clear incoming nudge FIRST
    const senderId = incomingNudge.sender_id;
    await clearIncomingNudge();

    // Wait a moment for the modal to fully close
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Then find the friend and send nudge back
    const friend = friends.find((f) => f.id === senderId);
    if (friend) {
      const result = await NudgeService.sendNudge(currentUser.id, friend.id);
      if (result.success) {
        console.log("Nudge back to:", friend.firstName);
        setOutgoingNudge(friend);
        if (result.nudge) {
          setCurrentNudgeId(result.nudge.id);
        }
      } else {
        console.error("Failed to send nudge:", result.error);
      }
    }
  };

  // Handler for sending nudge
  const handleSendNudge = async (friend: Friend) => {
    if (!currentUser) return;

    // Clear any existing popups first
    setIncomingNudge(null);
    setOutgoingNudge(null);

    // Wait a moment
    await new Promise((resolve) => setTimeout(resolve, 100));

    const result = await NudgeService.sendNudge(currentUser.id, friend.id);
    if (result.success) {
      console.log("Nudge sent to:", friend.firstName);
      setOutgoingNudge(friend);
      if (result.nudge) {
        setCurrentNudgeId(result.nudge.id);
      }
    } else {
      console.error("Failed to send nudge:", result.error);
    }
  };

  // Handler for undoing nudge
  const handleUndoNudge = async () => {
    if (currentNudgeId) {
      const result = await NudgeService.undoNudge(currentNudgeId);
      if (result.success) {
        console.log("Nudge undone");
      } else {
        console.error("Failed to undo nudge:", result.error);
      }
    }
    setOutgoingNudge(null);
    setCurrentNudgeId(null);
  };

  // Subscribe to friend updates
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = NudgeService.subscribeToNudges(
      currentUser.id,
      (nudge) => {
        console.log("Incoming nudge received - replacing any current popup");

        // These all happen in one batch, so no freeze
        setOutgoingNudge(null);
        setCurrentNudgeId(null);
        setIncomingNudge(nudge);
      }
    );

    return unsubscribe;
  }, [currentUser?.id, locationSharingEnabled]);

  // Subscribe to real-time collaboration invites
  useEffect(() => {
    if (!currentUser) return;

    const channel = db
      .channel("collab-invites")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sent_invites",
          filter: `receiver_id=eq.${currentUser.id}`,
        },
        (payload) => {
          console.log("Collaboration invite received:", payload.new);
          setCollabInvite(payload.new);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUser?.id]);

  // Load friends when component mounts
  useEffect(() => {
    if (currentUser) {
      loadFriends();
    }
  }, [currentUser?.id]);

  // Subscribe to real-time status updates
  useEffect(() => {
    if (!currentUser || friends.length === 0) return;

    const unsubscribe = UserService.subscribeToFriendStatuses(
      currentUser.id,
      (friendId, newStatus) => {
        console.log(`Updating friend ${friendId} status to:`, newStatus);

        setFriends((prevFriends) =>
          prevFriends.map((friend) =>
            friend.id === friendId ? { ...friend, status: newStatus } : friend
          )
        );
      }
    );

    return unsubscribe;
  }, [currentUser?.id, friends.length]); // Re-subscribe when friends list changes

  // Refresh friend statuses when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const refreshStatuses = async () => {
        if (!currentUser || friends.length === 0) return;

        const friendIds = friends.map((f) => f.id);
        const result = await UserService.refreshFriendStatuses(
          currentUser.id,
          friendIds
        );

        if (result.success && result.statuses) {
          console.log("Refreshed statuses:", result.statuses);

          setFriends((prevFriends) =>
            prevFriends.map((friend) => ({
              ...friend,
              status: result.statuses[friend.id] ?? friend.status,
            }))
          );
        }
      };

      refreshStatuses();
    }, [currentUser?.id, friends.length])
  );

  // Add a new state to track if gift drop is actively running
  const isGiftDropActiveRef = useRef(
    showGiftDrop === "true" && !!locationLatitude && !!locationLongitude
  );
  const [isGiftDropActive, setIsGiftDropActive] = useState(
    isGiftDropActiveRef.current
  );

  // Update the gift drop trigger effect
  useEffect(() => {
    if (showGiftDrop === "true" && locationLatitude && locationLongitude) {
      const lat = parseFloat(locationLatitude as string);
      const lon = parseFloat(locationLongitude as string);

      console.log("Gift drop triggered! Location:", lat, lon);

      // Update BOTH ref and state
      isGiftDropActiveRef.current = true;
      setIsGiftDropActive(true); // ← This triggers re-render!

      const giftRegion: Region = {
        latitude: lat,
        longitude: lon,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setMapRegion(giftRegion);

      setTimeout(() => {
        setGiftDropPosition({
          x: SCREEN_WIDTH / 2 - 30,
          y: SCREEN_HEIGHT / 2 - 78,
        });
        setShowingGiftDrop(true);
      }, 500);
    }
  }, [showGiftDrop, locationLatitude, locationLongitude]);

  const handleGiftDropComplete = () => {
    console.log("Gift drop completed at:", locationLatitude, locationLongitude);
    setShowingGiftDrop(false);
    setGiftDropComplete(true);

    // Update BOTH ref and state
    isGiftDropActiveRef.current = false;
    setIsGiftDropActive(false);

    // Add the gift to the map permanently
    if (friendId && locationLatitude && locationLongitude) {
      const friend = friends.find((f) => f.id === friendId);
      const isCollab = params.isCollaborative === "true";

      const newGift: PlacedGift = {
        id: Array.isArray(giftId) ? giftId[0] : giftId,
        friendId: Array.isArray(friendId) ? friendId[0] : friendId,
        friendName:
          (friendName as string) ||
          (friend ? `${friend.firstName} ${friend.lastName}` : "Friend"),
        friendIcon: getFriendIcon(friendId as string),
        latitude: parseFloat(locationLatitude as string),
        longitude: parseFloat(locationLongitude as string),
        giftType: isCollab
          ? "collaborative"
          : (giftType as string) || "giftCard",
        merchantName: (merchantName as string) || "Merchant",
        designId: (designId as string) || "design1",
        amount: (amount as string) || "0",
        dateSent: new Date().toLocaleDateString(),
        address: (locationAddress as string) || "Unknown Location",
        isCollaborative: isCollab, // ADD THIS
      };
      setPlacedGifts((prev) => [...prev, newGift]);
    }

    // Clear the params
    router.setParams({
      showGiftDrop: undefined,
      friendId: undefined,
      friendIcon: undefined,
      locationLatitude: undefined,
      locationLongitude: undefined,
      friendName: undefined,
      giftType: undefined,
      giftId: undefined,
      merchantName: undefined,
      designId: undefined,
      amount: undefined,
      locationAddress: undefined,
      isCollaborative: undefined, // ADD THIS
    });
  };

  const getFriendIcon = (friendId: string) => {
    const friend = friends.find((f) => f.id === friendId);
    return friend?.icon || require("../../../assets/userIcons/jillicon.png");
  };

  // Load accessibility setting when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadAccessibilitySetting = async () => {
        try {
          const value = await AsyncStorage.getItem(
            "accessibility_initials_enabled"
          );
          if (value !== null) {
            setUseInitials(JSON.parse(value));
          }
        } catch (error) {
          console.error("Error loading accessibility setting:", error);
        }
      };
      loadAccessibilitySetting();
    }, [])
  );

  // Handle friend selection from route params (e.g., from profile page)
  useFocusEffect(
    useCallback(() => {
      // Don't auto-select friend if we're doing a gift drop
      if (showGiftDrop === "true") {
        return;
      }

      if (params.friendId && friends.length > 0) {
        const friend = friends.find((f) => f.id === params.friendId);
        if (friend) {
          handleSelectFriend(friend);
          setTimeout(() => {
            bottomSheetRef.current?.snapToIndex(1);
          }, 100);
        }
      }
    }, [params.friendId, showGiftDrop]) // Add showGiftDrop to dependencies
  );
  const lastGeocodeRef = useRef<{
    lat: number;
    lon: number;
    time: number;
  } | null>(null);
  const GEOCODE_THROTTLE_MS = 60000; // Only geocode once per minute
  const GEOCODE_DISTANCE_THRESHOLD = 0.001; // ~100 meters

  useEffect(() => {
    (async () => {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission denied");
        setLoading(false);
        return;
      }

      const current = await ExpoLocation.getCurrentPositionAsync({});
      setLocation(current);
      setLoading(false);

      if (currentUser && locationSharingEnabled) {
        const now = Date.now();
        const lastGeocode = lastGeocodeRef.current;

        // Only geocode if:
        // 1. We haven't geocoded before, OR
        // 2. It's been more than GEOCODE_THROTTLE_MS since last geocode, OR
        // 3. We've moved more than GEOCODE_DISTANCE_THRESHOLD
        const shouldGeocode =
          !lastGeocode ||
          now - lastGeocode.time > GEOCODE_THROTTLE_MS ||
          Math.abs(current.coords.latitude - lastGeocode.lat) >
            GEOCODE_DISTANCE_THRESHOLD ||
          Math.abs(current.coords.longitude - lastGeocode.lon) >
            GEOCODE_DISTANCE_THRESHOLD;

        if (shouldGeocode) {
          try {
            const address = await ExpoLocation.reverseGeocodeAsync({
              latitude: current.coords.latitude,
              longitude: current.coords.longitude,
            });
            lastGeocodeRef.current = {
              lat: current.coords.latitude,
              lon: current.coords.longitude,
              time: now,
            };
            updateLocationInBackend(
              current.coords.latitude,
              current.coords.longitude,
              address[0]?.street || address[0]?.name || "Unknown Address"
            );
          } catch (error: any) {
            // If rate limited, just use coordinates without geocoding
            if (error.message?.includes("rate limit")) {
              updateLocationInBackend(
                current.coords.latitude,
                current.coords.longitude,
                `${current.coords.latitude.toFixed(
                  4
                )}, ${current.coords.longitude.toFixed(4)}`
              );
            }
          }
        } else {
          // Update location without geocoding if we're throttled
          updateLocationInBackend(
            current.coords.latitude,
            current.coords.longitude,
            `${current.coords.latitude.toFixed(
              4
            )}, ${current.coords.longitude.toFixed(4)}`
          );
        }
      }
    })();
  }, [currentUser?.id]);

  // Store the default region when location loads
  useEffect(() => {
    if (location && !defaultRegion && !isGiftDropActiveRef.current) {
      const region: Region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setDefaultRegion(region);
      setMapRegion(region);
    } else if (isGiftDropActiveRef.current) {
      console.log("Skipping default region - gift drop pending");
    }
  }, [location, defaultRegion]);

  // Reset overlay state when returning for gift drop
  useEffect(() => {
    if (showGiftDrop === "true") {
      // Reset to list view when gift drop is triggered
      setOverlayView("list");
      setSelectedFriend(null);
      setSelectedGift(null);
      setSelectedLocation(null);
      setPoiSelectedLocation(null);
    }
  }, [showGiftDrop]);

  const handleSelectFriend = (friend: Friend) => {
    setSelectedFriend(friend);
    setOverlayView("detail");
    setSelectedLocation(null);
    setPoiSelectedLocation(null);

    // Zoom to friend's location
    const zoomedRegion: Region = {
      latitude: friend.latitude,
      longitude: friend.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setMapRegion(zoomedRegion);
  };

  const handleSelectGift = (gift: PlacedGift) => {
    setSelectedGift(gift);
    setSelectedFriend(null);
    setOverlayView("giftDetail");
    setSelectedLocation(null);
    setPoiSelectedLocation(null);

    // Zoom to gift's location
    const zoomedRegion: Region = {
      latitude: gift.latitude,
      longitude: gift.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setMapRegion(zoomedRegion);

    // Expand bottom sheet
    setTimeout(() => {
      bottomSheetRef.current?.expand();
    }, 100);
  };

  // Load existing received gifts on mount
  useEffect(() => {
    const loadReceivedGifts = async () => {
      if (!currentUser) return;

      try {
        // Load individual gifts
        const { data: individualGifts, error: individualError } = await db
          .from("sent_gifts")
          .select("*")
          .eq("receiver_id", currentUser.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (individualError) {
          console.error("Error fetching received gifts:", individualError);
          return;
        }
        // Load collaborative gifts
        const { data: collabGifts, error: collabError } = await db
          .from("sent_gifts_collab")
          .select("*")
          .eq("receiver_id", currentUser.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (collabError) {
          console.error("Error fetching collab gifts:", collabError);
        }

        const allGifts = [...(individualGifts || []), ...(collabGifts || [])];

        if (allGifts.length === 0) {
          console.log("No received gifts found");
          return;
        }

        // Process all gifts
        const giftsWithAvatars = await Promise.all(
          allGifts.map(async (gift) => {
            const isCollab = !!gift.sender_ids;

            let senderIcon;
            let senderName;
            let collaboratorIcons = [];

            if (isCollab) {
              // For collaborative gifts, get all sender icons
              const allSenderIds = [
                gift.sender_ids.host,
                ...(gift.sender_ids.collaborators || []),
              ];

              // Fetch icons for up to 3 senders
              collaboratorIcons = await Promise.all(
                allSenderIds.slice(0, 3).map(async (id) => {
                  const { user } = await UserService.getUserById(id);
                  return user?.profile_icon_url
                    ? { uri: user.profile_icon_url }
                    : require("../../../assets/userIcons/jillicon.png");
                })
              );

              // Primary sender info from host
              const { user: hostUser } = await UserService.getUserById(
                gift.sender_ids.host
              );
              senderIcon = hostUser?.profile_icon_url
                ? { uri: hostUser.profile_icon_url }
                : require("../../../assets/userIcons/jillicon.png");
              senderName = gift.sender_display_names.host;
            } else {
              // Individual gift
              const { user } = await UserService.getUserById(gift.sender_id);
              senderIcon = user?.profile_icon_url
                ? { uri: user.profile_icon_url }
                : require("../../../assets/userIcons/jillicon.png");
              senderName = gift.sender_display_name;
            }

            return {
              id: gift.id.toString(),
              senderId: isCollab ? gift.sender_ids.host : gift.sender_id,
              senderName: senderName,
              senderIcon: senderIcon,
              latitude: parseFloat(gift.latitude) || 0,
              longitude: parseFloat(gift.longitude) || 0,
              giftType: isCollab ? "collaborative" : gift.gift_type,
              dateSent: new Date(gift.created_at).toLocaleDateString(),
              address: gift.address,
              content: gift.content || {},
              isCollaborative: isCollab,
              collaboratorIcons: isCollab ? collaboratorIcons : undefined,
            };
          })
        );

        setReceivedGifts(giftsWithAvatars);
        console.log("Loaded received gifts:", giftsWithAvatars.length);
      } catch (err) {
        console.error("Unexpected error loading received gifts:", err);
      }
    };

    loadReceivedGifts();
  }, [currentUser?.id]);

  // Load existing placed gifts on mount
  // In your loadPlacedGifts useEffect (around line 680 in document 4)
  useEffect(() => {
    const loadPlacedGifts = async () => {
      if (!currentUser) return;

      try {
        // Load individual gifts
        const { data: individualGifts, error: individualError } = await db
          .from("sent_gifts")
          .select("*")
          .eq("sender_id", currentUser.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (individualError) {
          console.error("Error fetching placed gifts:", individualError);
          return;
        }

        // Load collaborative gifts - FIX THIS PART
        const { data: collabGifts, error: collabError } = await db
          .from("sent_gifts_collab")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (collabError) {
          console.error("Error fetching collab gifts:", collabError);
        }

        // Filter collaborative gifts in JavaScript instead of SQL
        const userCollabGifts = (collabGifts || []).filter(
          (gift) => gift.sender_ids?.host === currentUser.id
        );

        const allGifts = [...(individualGifts || []), ...userCollabGifts];

        // ... rest of your code
      } catch (err) {
        console.error("Unexpected error loading placed gifts:", err);
      }
    };

    loadPlacedGifts();
  }, [currentUser?.id]);

  const handleUnsendGift = async (giftId: string) => {
    console.log("Unsending gift:", giftId);
    const giftId_num = Number(giftId);
    console.log("giftId raw:", giftId, typeof giftId, typeof giftId_num);

    // Mark as deleted instead of actually deleting (for history)
    const { error, data, count } = await db
      .from("sent_gifts")
      .update({ status: "deleted" })
      .eq("id", giftId_num);

    console.log("update result:", { error, data, count });

    // Animate the gift removal (fade out)
    const fadeAnim = new Animated.Value(1);

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Remove from placed gifts
      setPlacedGifts((prev) => prev.filter((g) => g.id !== giftId));

      // Return to list view
      handleBackToList();
      bottomSheetRef.current?.snapToIndex(1);
    });
  };

  // Subscribe to gift deletions/unsends (for recipients)
  useEffect(() => {
    if (!currentUser) return;

    const channel = db
      .channel("sent_gifts_unsends")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sent_gifts",
          filter: `receiver_id=eq.${currentUser.id}`,
        },
        (payload) => {
          console.log("Gift updated (received):", payload);
          const updatedGift = payload.new;

          // If gift was unsent, remove from map
          if (updatedGift.status === "deleted") {
            const giftId = updatedGift.id.toString();
            setReceivedGifts((prev) => prev.filter((g) => g.id !== giftId));

            // Close any open overlays if this was the selected gift
            if (selectedReceivedGift?.id === giftId) {
              setSelectedReceivedGift(null);
              setShowGiftContentPopup(false);
              setShowArrivedPopup(false);
              setOverlayView("list");
              bottomSheetRef.current?.snapToIndex(0);
            }
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUser?.id, selectedReceivedGift?.id]);

  // Subscribe to gift status updates (for senders - when recipient opens gift)
  useEffect(() => {
    if (!currentUser) return;

    const channel = db
      .channel("sent_gifts_status_updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sent_gifts",
          filter: `sender_id=eq.${currentUser.id}`,
        },
        (payload) => {
          console.log("Gift status updated:", payload);
          const updatedGift = payload.new;

          // If gift was marked as opened, remove from map
          if (updatedGift.status === "opened") {
            const giftId = updatedGift.id.toString();
            setPlacedGifts((prev) => prev.filter((g) => g.id !== giftId));

            // Close overlay if this was the selected gift
            if (selectedGift?.id === giftId) {
              setSelectedGift(null);
              setOverlayView("list");
              bottomSheetRef.current?.snapToIndex(0);
            }
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUser?.id, selectedGift?.id]);

  // Subscribe to gift deletions (for senders - when recipient "saves")
  useEffect(() => {
    if (!currentUser) return;

    const channel = db
      .channel("sent_gifts_deletes_sender")
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "sent_gifts",
          filter: `sender_id=eq.${currentUser.id}`,
        },
        (payload) => {
          console.log("Gift deleted (sent):", payload);
          const deletedGiftId = payload.old.id.toString();

          // Remove from placed gifts
          setPlacedGifts((prev) => prev.filter((g) => g.id !== deletedGiftId));

          // Close any open overlays if this was the selected gift
          if (selectedGift?.id === deletedGiftId) {
            setSelectedGift(null);
            setOverlayView("list");
            bottomSheetRef.current?.snapToIndex(0);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUser?.id, selectedGift?.id]);

  // Subscribe to COLLABORATIVE gifts
  // Subscribe to COLLABORATIVE gifts
  useEffect(() => {
    if (!currentUser) return;

    const channel = db
      .channel(`collab_gifts_for_${currentUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sent_gifts_collab",
          filter: `receiver_id=eq.${currentUser.id}`,
        },
        async (payload) => {
          console.log("New COLLABORATIVE gift received:", payload);
          const newGift = payload.new;

          // Fetch all sender icons
          const allSenderIds = [
            newGift.sender_ids.host,
            ...(newGift.sender_ids.collaborators || []),
          ];

          const collaboratorIcons = await Promise.all(
            allSenderIds.slice(0, 3).map(async (id) => {
              const { user } = await UserService.getUserById(id);
              return user?.profile_icon_url
                ? { uri: user.profile_icon_url }
                : require("../../../assets/userIcons/jillicon.png");
            })
          );

          const senderIcon = collaboratorIcons[0]; // Host is first in the array

          const receivedGift: ReceivedGift = {
            id: newGift.id.toString(),
            senderId: newGift.sender_ids.host,
            senderName: newGift.sender_display_names.host,
            senderIcon: senderIcon,
            latitude: parseFloat(newGift.latitude) || 0,
            longitude: parseFloat(newGift.longitude) || 0,
            giftType: "collaborative",
            dateSent: new Date(newGift.created_at).toLocaleDateString(),
            address: newGift.address,
            content: {
              ...newGift.content,
              senderDisplayNames: newGift.sender_display_names,
            },
            isCollaborative: true,
            collaboratorIcons: collaboratorIcons,
          };

          setReceivedGifts((prev) => [...prev, receivedGift]);
          setSelectedReceivedGift(receivedGift);
          setShowGiftReceivedPopup(true);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUser?.id]);

  // Add this helper function to calculate distance
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 5280; // Convert to feet
  };

  // Add handlers for received gifts
  const handleReceivedGiftPress = (gift: ReceivedGift) => {
    setSelectedReceivedGift(gift);

    // Check if user is within 500 ft
    if (location) {
      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        gift.latitude,
        gift.longitude
      );

      if (distance <= 500) {
        // Show arrived popup
        setShowArrivedPopup(true);
        return;
      }
    }

    // Show details overlay
    setOverlayView("receivedGiftDetail");

    // Zoom to gift's location
    const zoomedRegion: Region = {
      latitude: gift.latitude,
      longitude: gift.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setMapRegion(zoomedRegion);

    setTimeout(() => {
      bottomSheetRef.current?.expand();
    }, 100);
  };

  const handleOpenGift = () => {
    setShowArrivedPopup(false);
    setShowGiftContentPopup(true);
  };

  const handleGiftContentComplete = async () => {
    // Mark gift as opened in database
    if (selectedReceivedGift) {
      console.log("Marking gift as opened:", selectedReceivedGift.id);
      const giftId_num = Number(selectedReceivedGift.id);

      const { error } = await db
        .from("sent_gifts")
        .update({ status: "opened" })
        .eq("id", giftId_num);

      if (error) {
        console.error("Error updating gift status:", error);
      } else {
        console.log("Gift successfully marked as opened");
      }

      // Remove from local map state (subscription will also handle this for sender)
      setReceivedGifts((prev) =>
        prev.filter((g) => g.id !== selectedReceivedGift.id)
      );
    }

    setSelectedReceivedGift(null);
    setOverlayView("list");
    bottomSheetRef.current?.snapToIndex(0);
  };

  // Subscribe to received gifts (add this with your other useEffects)
  useEffect(() => {
    if (!currentUser) return;

    const channel = db
      .channel(`gifts_all_events_${currentUser.id}`) // Unique channel name
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sent_gifts",
          filter: `receiver_id=eq.${currentUser.id}`,
        },
        async (payload) => {
          console.log("New gift received:", payload);
          const newGift = payload.new;

          // Fetch sender's profile picture
          const { success, user } = await UserService.getUserById(
            newGift.sender_id
          );
          const senderIcon = user?.profile_icon_url
            ? { uri: user.profile_icon_url }
            : require("../../../assets/userIcons/jillicon.png");

          const receivedGift: ReceivedGift = {
            id: newGift.id.toString(),
            senderId: newGift.sender_id,
            senderName: newGift.sender_display_name,
            senderIcon: senderIcon,
            latitude: parseFloat(newGift.latitude) || 0,
            longitude: parseFloat(newGift.longitude) || 0,
            giftType: newGift.gift_type,
            dateSent: new Date(newGift.created_at).toLocaleDateString(),
            address: newGift.address,
            content: newGift.content || {},
          };

          setReceivedGifts((prev) => [...prev, receivedGift]);
          setSelectedReceivedGift(receivedGift);

          // Check if user is within 500 ft of the gift
          if (location) {
            const distance = calculateDistance(
              location.coords.latitude,
              location.coords.longitude,
              receivedGift.latitude,
              receivedGift.longitude
            );

            if (distance <= 500) {
              setShowArrivedPopup(true);
            } else {
              setShowGiftReceivedPopup(true);
            }
          } else {
            setShowGiftReceivedPopup(true);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sent_gifts",
          filter: `receiver_id=eq.${currentUser.id}`,
        },
        (payload) => {
          console.log("Gift updated (received):", payload);
          const updatedGift = payload.new;

          // If gift was unsent, remove from map
          if (updatedGift.status === "deleted") {
            const giftId = updatedGift.id.toString();
            setReceivedGifts((prev) => prev.filter((g) => g.id !== giftId));

            if (selectedReceivedGift?.id === giftId) {
              setSelectedReceivedGift(null);
              setShowGiftContentPopup(false);
              setShowArrivedPopup(false);
              setOverlayView("list");
              bottomSheetRef.current?.snapToIndex(0);
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sent_gifts",
          filter: `sender_id=eq.${currentUser.id}`,
        },
        (payload) => {
          console.log("Gift status updated (sent):", payload);
          const updatedGift = payload.new;

          // If gift was opened, remove from map
          if (updatedGift.status === "opened") {
            const giftId = updatedGift.id.toString();
            setPlacedGifts((prev) => prev.filter((g) => g.id !== giftId));

            if (selectedGift?.id === giftId) {
              setSelectedGift(null);
              setOverlayView("list");
              bottomSheetRef.current?.snapToIndex(0);
            }
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUser?.id, location, selectedReceivedGift?.id, selectedGift?.id]);

  const handleBackToList = () => {
    setSelectedFriend(null);
    setSelectedLocation(null);
    setPoiSelectedLocation(null);
    setOverlayView("list");
  };

  const handleSendGift = () => {
    setOverlayView("locationSelection");
    setPoiSelectedLocation(null); // Reset POI selection when entering location selection
  };

  const handleBackFromLocationSelection = () => {
    setSelectedLocation(null);
    setPoiSelectedLocation(null);
    setOverlayView("detail");
  };

  const handleLocationSelect = (
    location: LocationType & { latitude: number; longitude: number }
  ) => {
    setSelectedLocation(location);
    setPoiSelectedLocation(null); // Clear POI selection when manually selecting from list
  };

  // New handler for POI clicks on the map
  const handlePoiClick = async (placeData: {
    placeId: string;
    name: string;
    coordinate: { latitude: number; longitude: number };
  }) => {
    // Only handle POI clicks when in location selection mode
    if (overlayView !== "locationSelection" || !location) {
      return;
    }

    console.log("POI clicked:", placeData.name);
    setLoadingPlaceDetails(true);

    try {
      // Fetch full place details from Google Places API
      const placeDetails = await fetchPlaceDetails(placeData.placeId, {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (placeDetails) {
        // Convert to our location format
        const locationData = {
          id: placeDetails.id,
          locationName: placeDetails.name,
          address: placeDetails.address,
          distance: placeDetails.distance || "",
          categoryIconUrl:
            placeDetails.categoryIconUrl ||
            require("../../../assets/images/placeholderIcon.png"),
          latitude: placeDetails.latitude,
          longitude: placeDetails.longitude,
        };

        // Set as the POI-selected location
        setPoiSelectedLocation(locationData);
        setSelectedLocation(locationData);

        // Zoom to the selected location
        const zoomedRegion: Region = {
          latitude: placeDetails.latitude,
          longitude: placeDetails.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setMapRegion(zoomedRegion);

        console.log("Place details loaded:", placeDetails.name);
        console.log("Selected location set:", locationData);
      }
    } catch (error) {
      console.error("Error loading place details:", error);
    } finally {
      setLoadingPlaceDetails(false);
    }
  };

  const handleNextToGiftSelection = () => {
    if (selectedFriend && selectedLocation) {
      router.push({
        pathname: "/(tabs)/map/giftSelection",
        params: {
          friendName: `${selectedFriend.firstName} ${selectedFriend.lastName}`,
          friendId: selectedFriend.id,
          friendIcon: "", // Can't serialize require(), will use friendId to look up
          locationName: selectedLocation.locationName,
          locationAddress: selectedLocation.address,
          locationLatitude: selectedLocation.latitude.toString(),
          locationLongitude: selectedLocation.longitude.toString(),
          // No animation param needed, will default to slide_from_right
        },
      });
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  if (loading || !location || loadingFriends) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // Determine which locations to show in the overlay
  const getLocationsToShow = () => {
    if (poiSelectedLocation) {
      return [poiSelectedLocation]; // Show only the POI-selected location
    }

    // Add friend's current location as first option if in location selection mode
    if (overlayView === "locationSelection" && selectedFriend) {
      const friendLocation = {
        id: `friend-location-${selectedFriend.id}`,
        locationName: `${selectedFriend.firstName}'s current location`,
        address: selectedFriend.address,
        distance: "", // No distance needed
        categoryIconUrl: require("../../../assets/images/placeholderIcon.png"),
        latitude: selectedFriend.latitude,
        longitude: selectedFriend.longitude,
      };
      return [friendLocation, ...mockLocationsWithCoords];
    }

    return selectedFriend?.favoriteLocations; // Show all mock locations
  };

  const locationsToShow = getLocationsToShow();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          {/* Dynamic Header */}
          {overlayView === "detail" && selectedFriend ? (
            <OverlayHeader
              title={`${selectedFriend.firstName} ${selectedFriend.lastName}`}
              onBack={handleBackToList}
            />
          ) : overlayView === "giftDetail" && selectedGift ? (
            <OverlayHeader
              title={`Gift to ${selectedGift.friendName}`}
              onBack={handleBackToList}
            />
          ) : overlayView === "receivedGiftDetail" && selectedReceivedGift ? (
            <OverlayHeader
              title={`Gift from ${selectedReceivedGift.senderName}`}
              onBack={handleBackToList}
              isCollaborative={selectedReceivedGift.isCollaborative}
              primarySenderName={
                selectedReceivedGift.content?.senderDisplayNames?.host
              }
            />
          ) : overlayView === "locationSelection" && selectedFriend ? (
            <OverlayHeader
              title={`${selectedFriend.firstName} ${selectedFriend.lastName}`}
              onBack={handleBackFromLocationSelection}
              onClose={handleBackToList}
            />
          ) : (
            <View style={styles.transparentHeader} />
          )}

          {/* Map */}
          <View style={styles.mapContainer}>
            <Map
              location={location}
              friends={friends}
              region={mapRegion}
              onRegionChangeComplete={
                isGiftDropActive ? undefined : setMapRegion
              }
              selectedFriendId={selectedFriend?.id || null}
              onFriendPress={(friend) => {
                handleSelectFriend(friend);
                bottomSheetRef.current?.expand();
              }}
              onPoiClick={handlePoiClick}
              selectedGiftLocation={
                selectedLocation && overlayView === "locationSelection"
                  ? {
                      latitude: selectedLocation.latitude,
                      longitude: selectedLocation.longitude,
                    }
                  : null
              }
              placedGifts={placedGifts}
              onGiftPress={handleSelectGift}
              receivedGifts={receivedGifts}
              onReceivedGiftPress={handleReceivedGiftPress}
              useInitials={useInitials}
              userIcon={currentUser?.profile_icon_url || undefined}
              userInitials={getUserInitials(currentUser?.display_name)}
              showUserInitials={useInitials || !currentUser?.profile_icon_url}
              isLocationSharingEnabled={locationSharingEnabled}
            />

            <View style={styles.floatingButtonsContainer}>
              <View style={styles.floatingButton}>
                <GiftDraftsButton
                  onPress={() => {
                    router.push("/(tabs)/map/giftDrafts");
                  }}
                />
              </View>
              {/* <View style={styles.floatingButton2}>
                <MapInboxButton
                  onPress={() => {
                    router.push("/(tabs)/map/giftDrafts");
                  }}
                />
              </View> */}
            </View>

            {/* Status Dropdown - overlays the map */}
            {overlayView === "list" && (
              <View style={styles.statusDropdownOverlay}>
                <StatusDropdown
                  selectedStatus={userStatus}
                  onStatusChange={handleStatusChange}
                />
              </View>
            )}

            {/* Loading indicator for place details */}
            {loadingPlaceDetails && overlayView === "locationSelection" && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator
                  size="small"
                  color={theme.colors.waynOrange}
                />
              </View>
            )}
          </View>

          {/* Conditionally render overlays */}
          {overlayView === "list" && (
            <FriendListOverlay
              bottomSheetRef={bottomSheetRef}
              snapPoints={snapPoints}
              handleSheetChanges={handleSheetChanges}
              friends={friends}
              onSelectFriend={handleSelectFriend}
            />
          )}

          {overlayView === "detail" && selectedFriend && (
            <FriendDetailOverlay
              bottomSheetRef={bottomSheetRef}
              snapPoints={snapPoints}
              handleSheetChanges={handleSheetChanges}
              friend={selectedFriend}
              locations={selectedFriend.favoriteLocations}
              onBack={handleBackToList}
              onViewProfile={() => handleSendNudge(selectedFriend)}
              onSendGift={handleSendGift}
              onLocationPress={(location) =>
                console.log("Location pressed:", location.locationName)
              }
            />
          )}

          {overlayView === "giftDetail" && selectedGift && (
            <GiftDetailOverlay
              bottomSheetRef={bottomSheetRef}
              snapPoints={snapPoints}
              handleSheetChanges={handleSheetChanges}
              gift={selectedGift}
              onBack={handleBackToList}
              onUnsend={() => handleUnsendGift(selectedGift.id)}
            />
          )}

          {overlayView === "receivedGiftDetail" && selectedReceivedGift && (
            <ReceivedGiftDetailOverlay
              bottomSheetRef={bottomSheetRef}
              snapPoints={snapPoints}
              handleSheetChanges={handleSheetChanges}
              gift={selectedReceivedGift}
              onBack={handleBackToList}
            />
          )}

          {overlayView === "locationSelection" && selectedFriend && (
            <>
              <LocationSelectionOverlay
                bottomSheetRef={bottomSheetRef}
                snapPoints={locationSnapPoints}
                handleSheetChanges={handleSheetChanges}
                locations={locationsToShow}
                selectedLocationId={selectedLocation?.id || null}
                onLocationSelect={handleLocationSelect}
                friendName={selectedFriend.firstName}
                isPOISelected={!!poiSelectedLocation}
              />
              <BottomCTABar
                buttonText="Next"
                onPress={handleNextToGiftSelection}
                disabled={!selectedLocation}
              />
            </>
          )}

          {showingGiftDrop && (
            <View
              style={styles.giftDropOverlay}
              pointerEvents={giftDropComplete ? "none" : "box-only"}
            >
              <MiniGiftBoxFall
                recipientImage={getFriendIcon(friendId as string)}
                onAnimationComplete={handleGiftDropComplete}
                targetPosition={giftDropPosition}
                isCollaborative={params.isCollaborative === "true"}
              />
            </View>
          )}

          {/* Incoming nudge popup */}
          <PopupCard
            visible={!!incomingNudge}
            onClose={clearIncomingNudge}
            title={
              incomingNudge
                ? `${incomingNudge.sender_display_name} nudged you!`
                : "You were nudged!"
            }
            subtitle={
              incomingNudge
                ? `${incomingNudge.sender_display_name} pinged you to check in.`
                : "Someone pinged you to check in."
            }
            imageSource={
              incomingNudge?.sender_icon
                ? { uri: incomingNudge.sender_icon }
                : undefined
            }
            buttonText="Nudge Back"
            onButtonPress={handleNudgeBack}
          />

          {/* Outgoing nudge confirmation */}
          <PopupCard
            visible={!!outgoingNudge}
            onClose={() => setOutgoingNudge(null)}
            title={
              outgoingNudge
                ? `You nudged ${outgoingNudge.firstName}!`
                : "You nudged a friend!"
            }
            subtitle={
              outgoingNudge
                ? `Nudge successful! ${outgoingNudge.firstName} will be notified.`
                : "Nudge successful!"
            }
            imageSource={outgoingNudge?.icon}
            buttonText="Undo"
            onButtonPress={handleUndoNudge}
          />

          {/* Collaboration Invite Popup */}
          <PopupCard
            visible={!!collabInvite}
            onClose={() => setCollabInvite(null)}
            title={
              collabInvite
                ? `${collabInvite.sender_display_name} invited you to collaborate!`
                : "Collaboration Invite"
            }
            subtitle={`Join in on a group gift for ${collabInvite?.payload?.friendName}.`}
            imageSource={
              collabInvite?.sender_icon
                ? { uri: collabInvite.sender_icon }
                : undefined
            }
            buttonText="View Gift Basket"
            onButtonPress={handleAcceptCollab}
          />

          {/* Gift received popup */}
          <GiftReceivedPopupCard
            visible={showGiftReceivedPopup}
            onClose={() => setShowGiftReceivedPopup(false)}
            title={
              selectedReceivedGift
                ? `${selectedReceivedGift.senderName} sent you a gift!`
                : "You received a gift!"
            }
            subtitle="A gift is waiting for you on the map."
            buttonText="View"
            onButtonPress={() => {
              setShowGiftReceivedPopup(false);
              if (selectedReceivedGift) {
                handleReceivedGiftPress(selectedReceivedGift);
              }
            }}
            isCollaborative={selectedReceivedGift?.isCollaborative} // ADD THIS
          />

          {/* Arrived at gift popup */}
          <GiftPopup
            visible={showArrivedPopup}
            onClose={() => setShowArrivedPopup(false)}
            title={
              selectedReceivedGift
                ? `Open ${selectedReceivedGift.senderName}'s gift!`
                : "You've arrived at your gift!"
            }
            subtitle="Time to see what's inside"
            imageSource={require("../../../assets/images/received_gift.png")}
            buttonText="Open"
            onButtonPress={handleOpenGift}
            showShakingGift
            isCollaborative={selectedReceivedGift?.isCollaborative} // ADD THIS
          />

          {/* Gift content popup */}
          {selectedReceivedGift && (
            <GiftContentPopup
              visible={showGiftContentPopup}
              onClose={() => setShowGiftContentPopup(false)}
              giftType={selectedReceivedGift.giftType}
              senderName={selectedReceivedGift.senderName}
              dateSent={selectedReceivedGift.dateSent}
              senderDisplayNames={
                selectedReceivedGift.content.senderDisplayNames
              }
              content={selectedReceivedGift.content}
              onComplete={handleGiftContentComplete}
            />
          )}
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  transparentHeader: {
    backgroundColor: "transparent",
    height: 0,
  },
  statusDropdownOverlay: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
    pointerEvents: "box-none",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  giftPinContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingOverlay: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  giftDropOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    pointerEvents: "box-none",
  },
  floatingButtonsContainer: {
    position: "absolute",
    right: 20,
    top: 140, // adjust as needed to move up/down
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    zIndex: 10,
  },
  floatingButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    flex: 0.5,
  },
  floatingButton2: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    flex: 0.5,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  arrivedPopup: {
    width: "85%",
    padding: theme.spacing.lg,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "#E8E8E9",
    backgroundColor: theme.colors.white,
  },
  arrivedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
  },
});
