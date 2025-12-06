import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ScrollView,
  Image,
  TextInput,
} from "react-native";
import { UserService } from "../../../services/userService";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { theme } from "../../../assets/theme";
import { Feather } from "@expo/vector-icons";
import { db } from "../../../utils/supabase";
import { useAuth } from "../../../contexts/authContext";
import { Friend } from "../../../types";

export default function AddCollaboratorsScreen() {
  const { currentUser } = useAuth();
  const params = useLocalSearchParams();
  const {
    friendName,
    friendId,
    friendIcon,
    locationName,
    locationAddress,
    locationLatitude,
    locationLongitude,
    giftId,
    giftType,
    audioUri,
    sessionId,
    giftCount,
  } = params;

  const [searchText, setSearchText] = useState("");
  const [allFriends, setAllFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  const getInitialIds = () => {
    if (params.collaboratorIds && typeof params.collaboratorIds === "string") {
      try {
        return JSON.parse(params.collaboratorIds);
      } catch (e) {
        /* fall through */
      }
    }
    return [];
  };

  const [addedCollaboratorIds, setAddedCollaboratorIds] =
    useState<string[]>(getInitialIds);

  // loads list of collaborators
  useEffect(() => {
    const loadCollaborators = async () => {
      if (!currentUser) return;

      setLoading(true);
      const result = await UserService.getFriends(currentUser.id);
      if (result.success && result.friends) {
        setAllFriends(result.friends);
      } else {
        console.error("Failed to load friends:", result.error);
      }
      setLoading(false);
    };

    loadCollaborators();
  }, [currentUser?.id, params.friendId]);

  const filteredCollaborators = useMemo(() => {
    return allFriends
      .filter(
        // Always exclude the gift recipient
        (friend) => friend.id !== params.friendId
      )
      .filter((friend) => {
        // Filter by search text
        const fullName = `${friend.firstName} ${friend.lastName}`.toLowerCase();
        return fullName.includes(searchText.toLowerCase());
      });
  }, [allFriends, params.friendId, searchText]);

  const handleToggleCollaborator = (id: string) => {
    setAddedCollaboratorIds((prev) =>
      prev.includes(id)
        ? prev.filter((collabId) => collabId !== id)
        : [...prev, id]
    );
  };

  const handleBack = () => {
    console.log("Back pressed");
    // Navigate back while passing the selected IDs, same as handleDone.
    router.navigate({
      pathname: "/(tabs)/map/giftSelection",
      params: {
        ...params,
        collaboratorIds: JSON.stringify(addedCollaboratorIds),
        giftCount,
        transition: "slide_from_left",
        // sessionId is already in params, so it's passed back automatically
      },
    });
  };

  const handleClose = () => {
    console.log("Close pressed");
    router.push("/(tabs)/map");
  };

  const handleDone = async () => {
    console.log("Done pressed");

    // Send a notification to each added collaborator
    if (currentUser && params.sessionId && addedCollaboratorIds.length > 0) {
      const notifications = addedCollaboratorIds.map((collaboratorId) => ({
        receiver_id: collaboratorId,
        sender_id: currentUser.id,
        sender_display_name: currentUser.display_name,
        sender_icon: currentUser.profile_icon_url,
        gift_receiver_display_name: Array.isArray(params.friendName)
          ? params.friendName[0]
          : params.friendName,
        session_id: Array.isArray(params.sessionId)
          ? params.sessionId[0]
          : params.sessionId,
        payload: {
          sessionId: Array.isArray(params.sessionId)
            ? params.sessionId[0]
            : params.sessionId,
          friendName: Array.isArray(params.friendName)
            ? params.friendName[0]
            : params.friendName,
        },
      }));

      const { error } = await db.from("sent_invites").insert(notifications);

      if (error) {
        console.error("Error sending collaboration invites:", error);
      }
    }

    // we can update its params and get the desired "back" animation.
    router.navigate({
      pathname: "/(tabs)/map/giftSelection",
      params: {
        ...params,
        collaboratorIds: JSON.stringify(addedCollaboratorIds),
        giftCount,
        transition: "slide_from_left",
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Add Collaborators</Text>

        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Feather name="x" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather
          name="search"
          size={20}
          color="#FF6B52"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search text..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Collaborators List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {filteredCollaborators.map((collab) => {
          const isAdded = addedCollaboratorIds.includes(collab.id);
          return (
            <View key={collab.id} style={styles.collaboratorItem}>
              <View style={styles.collaboratorInfo}>
                {collab.icon ? (
                  <Image
                    source={
                      typeof collab.icon === "string"
                        ? { uri: collab.icon }
                        : collab.icon
                    }
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Feather name="user" size={32} color="#CCC" />
                  </View>
                )}

                <View style={styles.textContainer}>
                  <Text style={styles.name}>{collab.firstName}</Text>
                  <Text style={styles.activity}>{collab.status}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isAdded ? styles.removeButton : styles.addButton,
                ]}
                onPress={() => handleToggleCollaborator(collab.id)}
              >
                <Text
                  style={[
                    styles.actionButtonText,
                    isAdded ? styles.removeButtonText : styles.addButtonText,
                  ]}
                >
                  {isAdded ? "Remove" : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* Done Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.doneButton,
            addedCollaboratorIds.length === 0 && styles.doneButtonDisabled,
          ]}
          onPress={handleDone}
          disabled={addedCollaboratorIds.length === 0}
        >
          <Text style={styles.doneButtonText}>Done Adding</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    width: 40,
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    flex: 1,
    textAlign: "center",
  },
  closeButton: {
    width: 40,
    alignItems: "flex-end",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: 25,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  collaboratorItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  collaboratorInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F0F0F0",
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  activity: {
    fontSize: 14,
    color: "#999",
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 90,
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#FF6B52",
  },
  removeButton: {
    backgroundColor: "#FF6B52",
    borderWidth: 2,
    borderColor: "#FF6B52",
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  addButtonText: {
    color: "#FF6B52",
  },
  removeButtonText: {
    color: "#FFF",
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 30,
  },
  doneButton: {
    backgroundColor: "#FF6B52",
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#FF6B52",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  doneButtonDisabled: {
    backgroundColor: "#FFB3AB", // Lighter shade of brand orange
    shadowOpacity: 0,
    elevation: 0,
  },
  doneButtonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
