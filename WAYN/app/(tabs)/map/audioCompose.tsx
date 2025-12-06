import React, { useState, useEffect, useRef } from "react";
import * as FileSystem from "expo-file-system";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { theme } from "../../../assets/theme";
import OverlayHeader from "../../../components/navigation/overlayHeader";
import DualBottomCTA from "../../../components/buttons/dualBottomCTA";
import { Feather } from "@expo/vector-icons";
import {
  useAudioPlayer,
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
  useAudioPlayerStatus,
} from "expo-audio";
import { useAuth } from "../../../contexts/authContext";
import { db } from "../../../utils/supabase";

type RecordingState = "idle" | "recording" | "paused" | "stopped";

const AudioRecordingScreen = () => {
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
    collaboratorIds,
    giftCount,
  } = params;

  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [playbackTime, setPlaybackTime] = useState<number>(0);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const player = useAudioPlayer();
  const playerStatus = useAudioPlayerStatus(player);

  // Request microphone permissions on mount
  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert(
          "Permission Required",
          "Permission to access microphone was denied"
        );
      }
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  const handleBack = () => {
    if (recordingState !== "idle") {
      Alert.alert(
        "Discard Recording?",
        "Are you sure you want to go back? Your recording will be lost.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              audioRecorder.stop();
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
    if (recordingState !== "idle") {
      Alert.alert(
        "Discard Recording?",
        "Are you sure you want to close? Your recording will be lost.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              audioRecorder.stop();
              router.push("/(tabs)/map");
            },
          },
        ]
      );
    } else {
      router.push("/(tabs)/map");
    }
  };

  const handleStartRecording = async () => {
    try {
      setRecordingState("recording");
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start recording");
      setRecordingState("idle");
    }
  };

  const handlePause = async () => {
    try {
      setRecordingState("paused");
      await audioRecorder.pause();
    } catch (error) {
      console.error("Failed to pause recording:", error);
    }
  };

  const handleResume = async () => {
    try {
      setRecordingState("recording");
      audioRecorder.record();
    } catch (error) {
      console.error("Failed to resume recording:", error);
    }
  };

  const handleStopRecording = async () => {
    try {
      await audioRecorder.stop();
      setRecordingState("stopped");
      if (recorderState.url) {
        player.replace({ uri: recorderState.url });
        setRecordingUri(recorderState.url);
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Error", "Failed to stop recording");
    }
  };

  // Updates recording time
  useEffect(() => {
    if (recordingState !== "recording") return;

    const seconds = Math.floor((recorderState.durationMillis ?? 0) / 1000);
    setRecordingTime((prev) => (prev !== seconds ? seconds : prev));
  }, [recorderState.durationMillis, recordingState]);

  // Updates playback time
  useEffect(() => {
    if (!playerStatus.isLoaded) return;

    const totalSeconds = Math.floor(playerStatus.duration ?? 0);
    const current = Math.floor(playerStatus.currentTime ?? 0);

    const remaining = totalSeconds - current;

    setPlaybackTime((prev) => (prev !== remaining ? remaining : prev));
  }, [playerStatus.currentTime, playerStatus.duration, playerStatus.isLoaded]);

  const handleRestart = async () => {
    try {
      if (recordingState === "recording" || recordingState === "paused") {
        await audioRecorder.stop();
      }
      if (player.playing) {
        player.pause();
      }
      setRecordingState("idle");
      setRecordingTime(0);
      setPlaybackTime(0);
      setRecordingUri(null);
    } catch (error) {
      console.error("Failed to restart:", error);
    }
  };

  const handlePlayback = async () => {
    try {
      if (!recordingUri) return;
      if (player.playing) {
        player.pause();
      }
      if (!playerStatus.isLoaded) {
        console.log("Waiting for player to load...");
        return;
      }
      console.log("Playing", recordingUri);
      player.seekTo(0);
      player.play();
    } catch (error) {
      console.error("Failed to play recording:", error);
      Alert.alert("Error", "Failed to play recording");
    }
  };

  const handleSendGift = async () => {
    // Stop recording if still recording
    if (recordingState === "recording" || recordingState === "paused") {
      await handleStopRecording();
    }

    if (!recordingUri) {
      Alert.alert("Error", "No recording found");
      return;
    }

    console.log("Send gift pressed");
    console.log("Local recording URI:", recordingUri);

    try {
      // Upload audio file to Supabase Storage
      console.log("📤 Uploading audio file...");

      // Generate unique filename with user folder structure
      const timestamp = Date.now();
      const filename = `${currentUser?.id}/${timestamp}.m4a`;

      console.log("Current user ID:", currentUser?.id);
      console.log("Filename to upload:", filename);

      // Read the file using fetch (modern approach for React Native/Expo)
      console.log("Reading file...");
      const response = await fetch(recordingUri);
      const blob = await response.blob();

      console.log("File read successfully, size:", blob.size);

      // Convert blob to ArrayBuffer
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      });

      console.log("Uploading to Supabase Storage...");
      const { data: uploadData, error: uploadError } = await db.storage
        .from("audio-recordings")
        .upload(filename, arrayBuffer, {
          contentType: "audio/m4a",
          upsert: false,
        });

      if (uploadError) {
        console.error("❌ Upload failed:", uploadError);
        Alert.alert("Error", `Failed to upload audio: ${uploadError.message}`);
        return;
      }

      console.log("✅ Upload successful:", uploadData);

      // Get signed URL (valid for 1 year)
      console.log("Creating signed URL...");
      const { data: urlData, error: urlError } = await db.storage
        .from("audio-recordings")
        .createSignedUrl(filename, 60 * 60 * 24 * 365); // Valid for 1 year

      if (urlError) {
        console.error("❌ Error creating signed URL:", urlError);
        Alert.alert("Error", "Failed to create audio URL");
        return;
      }

      const signedUrl = urlData.signedUrl;
      console.log("🔗 Signed URL created:", signedUrl);

      // Insert gift record into Supabase with the SIGNED URL
      const giftData: any = {
        sender_display_name: currentUser?.display_name,
        receiver_display_name: friendName,
        sender_id: currentUser?.id,
        receiver_id: friendId,
        address: locationAddress,
        gift_type: "audioRecording",
        latitude: parseFloat(locationLatitude as string),
        longitude: parseFloat(locationLongitude as string),
        content: {
          audioUri: signedUrl,
          storagePath: filename,
        },
      };

      console.log("Inserting gift to database...");
      const { data, error } = await db
        .from("sent_gifts")
        .insert([giftData])
        .select();

      if (error) {
        console.error("Error inserting sent_gifts:", error);
        Alert.alert("Error", "Failed to save gift");
        return;
      }

      console.log("Successfully inserted sent_gifts:", data);

      // Generate giftId
      const giftId = data?.[0]?.id;

      // Navigate to gift send animation screen
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
          giftType: "audioRecording",
          giftId,
          audioUri: signedUrl,
        },
      });
    } catch (err) {
      console.error("Unexpected error:", err);
      Alert.alert("Error", `Failed to send gift: ${err.message || err}`);
    }
  };

  const handleAddGift = async () => {
    // Stop recording if still recording
    if (recordingState === "recording" || recordingState === "paused") {
      await handleStopRecording();
    }
    console.log("Add Gift pressed");

    //  Insert gift into gift basket table in supabase
    const giftItemData: any = {
      sender_display_name: currentUser?.display_name,
      receiver_display_name: friendName,
      sender_id: currentUser?.id,
      receiver_id: friendId,
      address: locationAddress,
      gift_type: "audioRecording",
      content: {
        audioRecording: recordingUri,
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
        },
      });
    } catch (err) {
      console.error("Unexpected error inserting collab_gift_basket:", err);
    }
  };

  const handleSaveAndExit = async () => {
    // Stop recording if still recording
    if (recordingState === "recording" || recordingState === "paused") {
      await handleStopRecording();
    }
    console.log("Save & Exit pressed");

    //  Insert draft gift record into Supabase
    const giftDraftData: any = {
      sender_display_name: currentUser?.display_name,
      receiver_display_name: friendName,
      sender_id: currentUser?.id,
      receiver_id: friendId,
      address: locationAddress,
      gift_type: "audioRecording",
      content: {
        audioRecording: recordingUri,
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
        return;
      }
      console.log("Successfully inserted gift_drafts:", data);
      router.push("/(tabs)/map");
    } catch (err) {
      console.error("Unexpected error inserting gift_drafts:", err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  console.log(collaboratorIds);
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <OverlayHeader
        title="Audio Recording"
        onBack={handleBack}
        onClose={handleClose}
      />

      <StatusBar barStyle="dark-content" />

      <View style={styles.container}>
        {/* Content */}
        <View style={styles.content}>
          {/* Suggested Starters Card*/}

          <View style={styles.suggestionsCard}>
            <View style={styles.suggestionsHeader}>
              <Text style={styles.bulbIcon}>💡</Text>
              <Text style={styles.suggestionsTitle}>Suggested starters</Text>
            </View>
            <View style={styles.suggestionsList}>
              <Text style={styles.suggestionText}>
                "Sending you some extra energy for your study session"
              </Text>
              <Text style={styles.suggestionText}>
                "You've been working all day, how are you?"
              </Text>
              <Text style={styles.suggestionText}>
                "Don't forget to take breaks!"
              </Text>
            </View>
          </View>

          {/* Recording Section */}
          <View style={styles.recordingSection}>
            {/* Main Recording Button with Ripple Container */}
            <View style={styles.recordButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.recordButton,
                  recordingState === "recording" && styles.recordButtonActive,
                  recordingState === "paused" && styles.recordButtonPaused,
                  recordingState === "stopped" && styles.recordButtonStopped,
                ]}
                onPress={
                  recordingState === "idle"
                    ? handleStartRecording
                    : recordingState === "recording"
                    ? handlePause
                    : recordingState === "paused"
                    ? handleResume
                    : undefined
                }
                disabled={recordingState === "stopped"}
              >
                <View style={styles.microphoneIcon}>
                  <View style={styles.micBody} />
                  <View style={styles.micBottom} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Recording Label - Only show when idle */}
            {recordingState === "idle" && (
              <Text style={styles.recordingLabel}>Start Recording</Text>
            )}

            {/* Timer - Show when recording or paused */}
            {(recordingState === "recording" ||
              recordingState === "paused") && (
              <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
            )}

            {recordingState === "stopped" && (
              <Text style={styles.timerText}>{formatTime(playbackTime)}</Text>
            )}

            {/* Control Buttons - Show when recording or paused */}
            {(recordingState === "recording" ||
              recordingState === "paused") && (
              <View style={styles.controlButtons}>
                {/* Pause/Resume Button */}
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={
                    recordingState === "recording" ? handlePause : handleResume
                  }
                >
                  <Feather
                    name={recordingState === "recording" ? "pause" : "play"}
                    size={24}
                    color="#FFF"
                  />
                </TouchableOpacity>

                {/* Stop Button */}
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={handleStopRecording}
                >
                  <Feather name="square" size={24} color="#FFF" />
                </TouchableOpacity>

                {/* Restart Button */}
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={handleRestart}
                >
                  <Feather name="rotate-ccw" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}

            {/* Playback Button - Show when stopped */}
            {recordingState === "stopped" && (
              <View style={styles.controlButtons}>
                {/* Playback Button */}
                <TouchableOpacity
                  disabled={!playerStatus.isLoaded}
                  style={[
                    styles.controlButton,
                    styles.playbackButton,
                    !playerStatus.isLoaded && { opacity: 0.5 },
                  ]}
                  onPress={handlePlayback}
                >
                  <Feather
                    name={player.playing ? "pause" : "play"}
                    size={28}
                    color="#FFF"
                  />
                </TouchableOpacity>

                {/* Restart Button */}
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={handleRestart}
                >
                  <Feather name="rotate-ccw" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}

            {recordingState === "stopped" && !playerStatus.isLoaded && (
              <View>
                <Text style={styles.loadingLabel}>
                  Loading your recording...
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Bottom Buttons */}
        {!collaboratorIds && (
          <View style={styles.bottomButtons}>
            <DualBottomCTA
              primaryText="Send Gift"
              secondaryText="Save & Exit"
              onPrimaryPress={handleSendGift}
              onSecondaryPress={handleSaveAndExit}
              primaryDisabled={
                recordingState === "idle" || recordingState === "recording"
              }
              secondaryDisabled={
                recordingState === "idle" || recordingState === "recording"
              }
            />
          </View>
        )}
        {collaboratorIds && (
          <View style={styles.bottomButtons}>
            <DualBottomCTA
              primaryText="Add Gift"
              secondaryText="Save & Exit"
              onPrimaryPress={handleAddGift}
              onSecondaryPress={handleSaveAndExit}
              primaryDisabled={
                recordingState === "idle" || recordingState === "recording"
              }
              secondaryDisabled={
                recordingState === "idle" || recordingState === "recording"
              }
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  suggestionsCard: {
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: theme.colors.waynOrange,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  suggestionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  bulbIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  suggestionsTitle: {
    ...theme.text.body1Bold,
    color: theme.colors.waynOrange,
  },
  suggestionsList: {
    gap: 12,
  },
  suggestionText: {
    ...theme.text.body2,
  },
  recordingSection: {
    alignItems: "center",
    marginTop: 20,
  },
  recordButtonContainer: {
    position: "relative",
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  recordButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: theme.colors.waynOrange,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.waynOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10,
  },
  recordButtonActive: {
    backgroundColor: "#FF5B4B",
  },
  recordButtonPaused: {
    backgroundColor: "#FFB3AB",
  },
  recordButtonStopped: {
    backgroundColor: "#A0A0A0",
  },
  ripple: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: theme.colors.waynOrange,
    opacity: 0.3,
  },
  ripple1: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  ripple2: {
    width: 240,
    height: 240,
    borderRadius: 120,
    opacity: 0.15,
  },
  microphoneIcon: {
    alignItems: "center",
  },
  micBody: {
    width: 40,
    height: 56,
    backgroundColor: "#FFF",
    borderRadius: 20,
  },
  micBottom: {
    width: 50,
    height: 8,
    backgroundColor: "#FFF",
    borderRadius: 4,
    marginTop: 8,
  },
  recordingLabel: {
    marginTop: 24,
    ...theme.text.body1Bold,
  },
  loadingLabel: {
    marginTop: 5,
    ...theme.text.body3,
  },
  timerText: {
    fontSize: 24,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginTop: 24,
    fontVariant: ["tabular-nums"],
  },
  waveformContainer: {
    marginTop: 10,
    paddingHorizontal: 40,
  },
  waveformPlaceholder: {
    fontSize: 16,
    color: "#CCC",
    letterSpacing: 4,
  },
  controlButtons: {
    flexDirection: "row",
    gap: 20,
    marginTop: 18,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.waynOrange,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.waynOrange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  playbackButton: {
    width: 64,
    height: 64,
    borderRadius: 40,
  },
  bottomButtons: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
});

export default AudioRecordingScreen;
