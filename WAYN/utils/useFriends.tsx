// utils/useFriends.ts
import { useMemo } from "react";
import { Friend } from "../types";

// Use your real icons
const jillIcon = require("../assets/userIcons/jillicon.png");
const katIcon = require("../assets/userIcons/katicon.png");
const leoIcon = require("../assets/userIcons/leoicon.png");

const MOCK_FRIENDS: Friend[] = [
  {
    id: "1",
    firstName: "Jill",
    lastName: "C.",
    icon: jillIcon,
    latitude: 37.5483,
    longitude: -121.9886,
    address: "Freemont, CA",
    timestamp: "Since 2:30 PM",
  },
  {
    id: "2",
    firstName: "Katherine",
    lastName: "S.",
    icon: katIcon,
    latitude: 37.7749,
    longitude: -122.4194,
    address: "San Francisco, CA",
    timestamp: "Since 1:15 PM",
  },
  {
    id: "3",
    firstName: "Leo",
    lastName: "S.",
    icon: leoIcon,
    latitude: 37.422525,
    longitude: -122.166915,
    address: "450 Serra Mall, Stanford, CA",
    timestamp: "Since 4:00 PM",
  },
];

export function useFriends() {
    // later replace with const { data: friends } = useQuery(["friends"], fetchFriendsFromApi);
  const friends = useMemo(() => MOCK_FRIENDS, []);

  return {
    friends,
    isLoading: false,
    error: null,
  };
}
