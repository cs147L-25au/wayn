import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../../assets/theme";
import DualBottomCTA from "../../../components/buttons/dualBottomCTA";
import OverlayHeader from "../../../components/navigation/overlayHeader";
import SearchBar from "../../../components/searchBar";
import { useAuth } from "../../../contexts/authContext";
import { db } from "../../../utils/supabase";

interface Song {
  id: string;
  title: string;
  artist: string;
  albumArt?: string;
}

type RecommendationFilter = "location" | "weather" | "status";

// Hardcoded song library
const SONG_LIBRARY: Song[] = [
  {
    id: "lib1",
    title: "Midnight Espresso",
    artist: "Elias Vance",
    albumArt: require("../../../assets/images/midnightexpress.jpeg"),
  },
  {
    id: "lib2",
    title: "Rio Nights",
    artist: "Victor Feldman",
    albumArt: require("../../../assets/images/rionights.jpeg"),
  },
  {
    id: "lib3",
    title: "Endless Summer",
    artist: "The Beach Boys",
    albumArt: require("../../../assets/images/endlesssummer.jpg"),
  },
  {
    id: "lib4",
    title: "Lazy Sunday",
    artist: "Lofi Dreams",
    albumArt: require("../../../assets/images/lazysunday.jpg"),
  },
  {
    id: "lib5",
    title: "Concentration",
    artist: "Brian Eno",
    albumArt: require("../../../assets/images/concentration.jpg"),
  },
  {
    id: "lib6",
    title: "Vienna",
    artist: "Billy Joel",
    albumArt: require("../../../assets/images/vienna.jpg"),
  },
  {
    id: "lib7",
    title: "Don't Know Why",
    artist: "Norah Jones",
    albumArt: require("../../../assets/images/dontknowwhy.jpg"),
  },
  {
    id: "lib8",
    title: "The Scientist",
    artist: "Coldplay",
    albumArt: require("../../../assets/images/thescientist.png"),
  },
  {
    id: "lib9",
    title: "Blinding Lights",
    artist: "The Weeknd",
    albumArt: require("../../../assets/images/blindinglights.png"),
  },
  {
    id: "lib10",
    title: "Industry Baby",
    artist: "Lil Nas X",
    albumArt: require("../../../assets/images/industrybaby.png"),
  },
  {
    id: "lib11",
    title: "Go Your Own Way",
    artist: "Fleetwood Mac",
    albumArt: require("../../../assets/images/goyourownway.jpeg"),
  },
  {
    id: "lib12",
    title: "Nocturne",
    artist: "Chopin",
    albumArt: require("../../../assets/images/noctures.jpg"),
  },
];

export default function PlaylistComposeScreen() {
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
    sessionId,
    collaboratorIds,
    giftCount,
    hostId,
  } = params;

  const [playlistName, setPlaylistName] = useState("Playlist Name");
  const [isEditingName, setIsEditingName] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [playlistSongs, setPlaylistSongs] = useState<Song[]>([]);
  const [recommendedFilter, setRecommendedFilter] =
    useState<RecommendationFilter>("location");
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);

  // Load draft if giftId is provided
  useEffect(() => {
    if (giftId && currentUser) {
      const loadDraft = async () => {
        const { data, error } = await db
          .from("gift_drafts")
          .select("*")
          .eq("id", giftId)
          .eq("sender_id", currentUser.id)
          .single();

        if (!error && data && data.content) {
          if (data.content.playlistName) {
            setPlaylistName(data.content.playlistName);
          }
          if (data.content.songs && Array.isArray(data.content.songs)) {
            setPlaylistSongs(data.content.songs);
          }
        }
      };
      loadDraft();
    }
  }, [giftId, currentUser]);

  // Get recommended songs based on filter (subset of library)
  useEffect(() => {
    // In a real app, this would fetch from an API based on location/weather/status
    // For now, return a subset of the library based on filter
    const getRecommendedByFilter = (): Song[] => {
      switch (recommendedFilter) {
        case "location":
          return SONG_LIBRARY.slice(0, 4); // Cafe Jazz, Bossa Song, etc.
        case "weather":
          return SONG_LIBRARY.slice(4, 8); // Summer Vibes, Chill Beats, etc.
        case "status":
          return SONG_LIBRARY.slice(8, 12); // Evening Walk, Morning Energy, etc.
        default:
          return SONG_LIBRARY.slice(0, 4);
      }
    };
    setRecommendedSongs(getRecommendedByFilter());
  }, [recommendedFilter]);

  // Filter song library based on search query
  const searchResults = searchQuery.trim()
    ? SONG_LIBRARY.filter(
        (song) =>
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Determine what to show: search results or default view
  const showSearchResults = searchQuery.trim().length > 0;

  const handleBack = () => {
    if (playlistSongs.length > 0) {
      Alert.alert(
        "Discard Playlist?",
        "Are you sure you want to go back? Your playlist will be lost.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleClose = () => {
    if (playlistSongs.length > 0) {
      Alert.alert(
        "Discard Playlist?",
        "Are you sure you want to go back? Your playlist will be lost.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              router.push("/(tabs)/map");
            },
          },
        ]
      );
    } else {
      router.push("/(tabs)/map");
    }
  };

  const handleRemoveSong = (songId: string) => {
    setPlaylistSongs(playlistSongs.filter((song) => song.id !== songId));
  };

  const handleAddSong = (song: Song) => {
    // Check if song already exists in playlist
    if (!playlistSongs.find((s) => s.id === song.id)) {
      setPlaylistSongs([...playlistSongs, song]);
      // Clear search after adding
      setSearchQuery("");
    }
  };

  const handleSendGift = async () => {
    if (playlistSongs.length === 0) {
      Alert.alert("Error", "Please add at least one song to your playlist");
      return;
    }

    console.log("Send gift pressed");

    const giftData: any = {
      sender_display_name: currentUser?.display_name,
      receiver_display_name: friendName,
      sender_id: currentUser?.id,
      receiver_id: friendId,
      address: locationAddress,
      gift_type: "playlist",
      latitude: parseFloat(locationLatitude as string),
      longitude: parseFloat(locationLongitude as string),
      content: {
        playlistName,
        songs: playlistSongs,
      },
    };

    try {
      const { data, error } = await db
        .from("sent_gifts")
        .insert([giftData])
        .select();

      if (error) {
        console.error("Error inserting sent_gifts:", error);
        Alert.alert("Error", "Failed to send gift");
        return;
      }

      console.log("Successfully inserted sent_gifts:", data);
      const newGiftId = data?.[0]?.id;

      router.push({
        pathname: "/(tabs)/map/giftSendAnimation",
        params: {
          friendName,
          friendId,
          friendIcon,
          locationName,
          locationAddress,
          locationLatitude,
          locationLongitude,
          giftType: "playlist",
          giftId: newGiftId,
        },
      });
    } catch (err) {
      console.error("Unexpected error inserting sent_gifts:", err);
      Alert.alert("Error", "Failed to send gift");
    }
  };

  const handleAddGift = async () => {
    console.log("Add Gift pressed");

    //  Insert gift into gift basket table in supabase
    const giftItemData: any = {
      sender_display_name: currentUser?.display_name,
      receiver_display_name: friendName,
      sender_id: currentUser?.id,
      receiver_id: friendId,
      address: locationAddress,
      gift_type: "playlist",
      content: {
        playlistName,
        songs: playlistSongs,
      },
      session_id: sessionId,
    };
    try {
      const { data, error } = await db
        .from("collab_gift_basket")
        .upsert(giftItemData, {
          onConflict: "session_id, sender_id, receiver_id, gift_type, address",
        })
        .select();
      if (error) {
        console.error("Error inserting collab_gift_basket:", error);
        // Even if upsert fails, try to get the latest count
      }

      // Fetch the latest gift count for the session
      const { count, error: countError } = await db
        .from("collab_gift_basket")
        .select("*", { count: "exact", head: true })
        .eq("session_id", sessionId);

      if (countError) {
        console.error("Error fetching gift count:", countError);
        return;
      }

      console.log("Successfully inserted collab_gift_basket:", data);
      router.push({
        pathname: "/(tabs)/map/giftSelection",
        params: {
          friendName,
          friendId,
          friendIcon,
          locationName,
          locationAddress,
          locationLatitude,
          locationLongitude,
          sessionId,
          giftCount: Number(giftCount) + 1,
          collaboratorIds,
          hostId,
        },
      });
    } catch (err) {
      console.error("Unexpected error inserting collab_gift_basket:", err);
    }
  };

  const handleSaveAndExit = async () => {
    console.log("Save & Exit pressed");

    const giftDraftData: any = {
      sender_display_name: currentUser?.display_name,
      receiver_display_name: friendName,
      sender_id: currentUser?.id,
      receiver_id: friendId,
      address: locationAddress,
      gift_type: "playlist",
      content: {
        playlistName,
        songs: playlistSongs,
      },
    };

    try {
      const { data, error } = await db
        .from("gift_drafts")
        .upsert(giftDraftData, {
          onConflict: "id, sender_id, receiver_id, gift_type, address",
        })
        .select();

      if (error) {
        console.error("Error inserting gift_drafts:", error);
        Alert.alert("Error", "Failed to save draft");
        return;
      }

      console.log("Successfully inserted gift_drafts:", data);
      router.push("/(tabs)/map");
    } catch (err) {
      console.error("Unexpected error inserting gift_drafts:", err);
      Alert.alert("Error", "Failed to save draft");
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <OverlayHeader
            title="Playlist"
            onBack={handleBack}
            onClose={handleClose}
          />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Playlist Name */}
          <View style={styles.playlistNameContainer}>
            <TouchableOpacity
              style={styles.playlistNameRow}
              onPress={() => setIsEditingName(true)}
            >
              {isEditingName ? (
                <TextInput
                  style={styles.playlistNameInput}
                  value={playlistName}
                  onChangeText={setPlaylistName}
                  onBlur={() => setIsEditingName(false)}
                  autoFocus
                  onSubmitEditing={() => setIsEditingName(false)}
                />
              ) : (
                <>
                  <Text style={styles.playlistNameText}>{playlistName}</Text>
                  <Feather
                    name="edit-2"
                    size={16}
                    color={theme.colors.waynOrange}
                  />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Find a song..."
            />
          </View>

          {showSearchResults ? (
            /* Search Results */
            <View style={styles.section}>
              {searchResults.length > 0 ? (
                searchResults.map((song) => (
                  <View key={song.id} style={styles.songItem}>
                    {song.albumArt ? (
                      <Image
                        source={
                          typeof song.albumArt === "string" &&
                          song.albumArt.startsWith("http")
                            ? { uri: song.albumArt }
                            : typeof song.albumArt === "string"
                            ? require("../../../assets/images/image_placeholder.png")
                            : song.albumArt
                        }
                        style={styles.albumArt}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.albumArtPlaceholder} />
                    )}
                    <View style={styles.songInfo}>
                      <Text style={styles.songTitle}>{song.title}</Text>
                      <Text style={styles.songArtist}>{song.artist}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => handleAddSong(song)}
                    >
                      <Feather
                        name="plus"
                        size={14}
                        color={theme.colors.waynOrange}
                      />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No songs found</Text>
              )}
            </View>
          ) : (
            <>
              {/* Playlist Songs */}
              {playlistSongs.length > 0 && (
                <View style={styles.section}>
                  {playlistSongs.map((song) => (
                    <View key={song.id} style={styles.songItem}>
                      {song.albumArt ? (
                        <Image
                          source={
                            typeof song.albumArt === "string" &&
                            song.albumArt.startsWith("http")
                              ? { uri: song.albumArt }
                              : typeof song.albumArt === "string"
                              ? require("../../../assets/images/image_placeholder.png")
                              : song.albumArt
                          }
                          style={styles.albumArt}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.albumArtPlaceholder} />
                      )}
                      <View style={styles.songInfo}>
                        <Text style={styles.songTitle}>{song.title}</Text>
                        <Text style={styles.songArtist}>{song.artist}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveSong(song.id)}
                      >
                        <Feather
                          name="x"
                          size={14}
                          color={theme.colors.waynOrange}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Recommended Songs */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Recommended Songs By Friend's:
                </Text>

                {/* Filter Pills */}
                <View style={styles.filterContainer}>
                  {(
                    ["location", "weather", "status"] as RecommendationFilter[]
                  ).map((filter) => (
                    <TouchableOpacity
                      key={filter}
                      style={[
                        styles.filterPill,
                        recommendedFilter === filter && styles.filterPillActive,
                      ]}
                      onPress={() => setRecommendedFilter(filter)}
                    >
                      <Text
                        style={[
                          styles.filterText,
                          recommendedFilter === filter &&
                            styles.filterTextActive,
                        ]}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Recommended Songs List */}
                {recommendedSongs.map((song) => (
                  <View key={song.id} style={styles.songItem}>
                    {song.albumArt ? (
                      <Image
                        source={
                          typeof song.albumArt === "string" &&
                          song.albumArt.startsWith("http")
                            ? { uri: song.albumArt }
                            : typeof song.albumArt === "string"
                            ? require("../../../assets/images/image_placeholder.png")
                            : song.albumArt
                        }
                        style={styles.albumArt}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.albumArtPlaceholder} />
                    )}
                    <View style={styles.songInfo}>
                      <Text style={styles.songTitle}>{song.title}</Text>
                      <Text style={styles.songArtist}>{song.artist}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => handleAddSong(song)}
                    >
                      <Feather
                        name="plus"
                        size={14}
                        color={theme.colors.waynOrange}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>

        {/* Bottom Buttons */}
        {!collaboratorIds && (
          <DualBottomCTA
            primaryText="Send Gift"
            secondaryText="Save & Exit"
            onPrimaryPress={handleSendGift}
            onSecondaryPress={handleSaveAndExit}
            primaryDisabled={playlistSongs.length === 0}
            secondaryDisabled={playlistSongs.length === 0}
          />
        )}

        {collaboratorIds && (
          <View style={styles.bottomButtons}>
            <DualBottomCTA
              primaryText="Add Gift"
              secondaryText="Save & Exit"
              onPrimaryPress={handleAddGift}
              onSecondaryPress={handleSaveAndExit}
              primaryDisabled={playlistSongs.length === 0}
              secondaryDisabled={playlistSongs.length === 0}
            />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 200,
  },
  playlistNameContainer: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  playlistNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  playlistNameText: {
    ...theme.text.headline3,
    textDecorationLine: "underline",
    width: "auto",
  },
  playlistNameInput: {
    ...theme.text.headline3,
    textDecorationLine: "underline",
    flex: 1,
  },
  searchContainer: {
    marginBottom: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    ...theme.text.body1Bold,
    marginBottom: theme.spacing.md,
  },
  filterContainer: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  filterPill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
  },
  filterPillActive: {
    backgroundColor: theme.colors.black,
  },
  filterText: {
    ...theme.text.body3,
    color: theme.colors.textPrimary,
  },
  filterTextActive: {
    color: theme.colors.white,
  },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  albumArtPlaceholder: {
    width: 48,
    height: 48,
    backgroundColor: "#D1D5DB",
    borderRadius: theme.borderRadius.sm,
  },
  albumArt: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.sm,
  },
  songInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  songTitle: {
    ...theme.text.body3Bold,
  },
  songArtist: {
    ...theme.text.body3,
    color: theme.colors.textSecondary,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.waynOrange,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.waynOrange,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    ...theme.text.body2,
    color: theme.colors.textSecondary,
    textAlign: "center",
    paddingVertical: theme.spacing.xl,
  },
});
