import { Feather } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Polyline } from "react-native-svg";
import { StickerKey, stickers } from "../../assets/stickers";
import { theme } from "../../assets/theme";
import PrimaryButton from "../buttons/primaryButtonMed";
import GiftCardRenderer from "../giftCardRenderer";

interface GiftContentPopupProps {
  visible: boolean;
  onClose: () => void;
  giftType: string;
  senderName: string;
  dateSent: string;
  senderDisplayNames?: {
    host: string;
    collaborators: string[];
  };
  content: {
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
    // ADD THIS:
    gifts?: Array<{
      id: number;
      created_at: string;
      session_id: string;
      receiver: string;
      sender_profile: string;
      sender_id: string;
      sender: string;
      type: string;
      gift_type?: string;
      content: {
        merchant?: string;
        merchantName?: string;
        amount?: string;
        designId?: string;
        audioRecording?: string;
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
      address: string;
    }>;
  };
  onComplete: () => void;
  viewOnly?: boolean;
}

const GiftContentPopup: React.FC<GiftContentPopupProps> = ({
  visible,
  onClose,
  giftType,
  senderName,
  dateSent,
  senderDisplayNames,
  content,
  onComplete,
  viewOnly = false,
}) => {
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [playingCollabAudioId, setPlayingCollabAudioId] = useState<
    number | null
  >(null);
  const player = useAudioPlayer();
  const playerStatus = useAudioPlayerStatus(player);

  const getFromNames = () => {
    if (
      !senderDisplayNames ||
      !senderDisplayNames.collaborators ||
      senderDisplayNames.collaborators.length === 0
    ) {
      return senderName;
    }

    const allNames = [
      senderDisplayNames.host,
      ...senderDisplayNames.collaborators,
    ];

    if (allNames.length > 2) {
      return `${allNames.slice(0, 2).join(", ")} and ${
        allNames.length - 2
      } others`;
    }

    return allNames.join(" and ");
  };

  // Load audio when popup becomes visible and it's an audio gift
  useEffect(() => {
    if (visible && giftType === "audioRecording" && content.audioUri) {
      console.log("🎵 Loading audio:", content.audioUri);
      setAudioLoading(true);

      try {
        player.replace({ uri: content.audioUri });
        console.log("✅ Audio player.replace called");

        // Wait a moment for it to load
        setTimeout(() => {
          setAudioLoading(false);
          console.log("⏱️ Audio should be loaded now");
          console.log("Player status:", {
            isLoaded: playerStatus.isLoaded,
            duration: playerStatus.duration,
          });
        }, 1000);
      } catch (error) {
        console.error("❌ Error loading audio:", error);
        setAudioLoading(false);
      }
    }

    // Cleanup when popup closes
    return () => {
      // Use try-catch and check if player is still valid before accessing
      try {
        if (player && playerStatus.isLoaded) {
          console.log("🛑 Pausing audio on cleanup");
          player.pause();
        }
      } catch (error) {
        // Ignore errors during cleanup - player might already be destroyed
        console.log("Cleanup: Player already disposed");
      }
    };
  }, [visible, content.audioUri, giftType]);

  // Auto-reset when audio finishes playing
  useEffect(() => {
    if (!playerStatus.isLoaded) return;

    // Check if audio has finished playing (current time equals duration)
    if (
      playerStatus.currentTime !== undefined &&
      playerStatus.duration !== undefined &&
      Math.abs(playerStatus.currentTime - playerStatus.duration) < 0.1 &&
      !player.playing
    ) {
      console.log("🔄 Audio finished, resetting to beginning");
      try {
        player.seekTo(0);
      } catch (error) {
        console.log("Could not seek to beginning:", error);
      }
    }
  }, [playerStatus.isLoaded, playerStatus.currentTime, playerStatus.duration]);

  const getGiftTypeTitle = () => {
    switch (giftType) {
      case "giftCard":
        return "Gift Card";
      case "audioRecording":
        return "Audio Recording";
      case "letter":
        return "Letter";
      case "playlist":
        return "Playlist";
      case "collaborative":
        return "Collaborative Gift";
      default:
        return "Gift";
    }
  };

  const handleMainAction = () => {
    // Stop audio if playing
    try {
      if (player && playerStatus.isLoaded && player.playing) {
        player.pause();
      }
    } catch (error) {
      console.log("Error pausing audio:", error);
    }
    setShowSuccessPopup(true);
  };

  const handleSuccessClose = () => {
    setShowSuccessPopup(false);
    onClose();
    onComplete();
  };

  const handlePlayAudio = async () => {
    console.log("🎵 Play button pressed");
    console.log("Content:", content);
    console.log("Audio URI:", content.audioUri);
    console.log("Player status:", {
      isLoaded: playerStatus.isLoaded,
      playing: player.playing,
      duration: playerStatus.duration,
      currentTime: playerStatus.currentTime,
    });

    if (!content.audioUri) {
      console.error("❌ No audio URI!");
      return;
    }

    try {
      if (player.playing) {
        console.log("⏸️ Pausing audio");
        player.pause();
      } else {
        if (!playerStatus.isLoaded) {
          console.log("🔄 Audio not loaded, loading now...");
          player.replace({ uri: content.audioUri });
          // Wait a bit for it to load
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        // Reset to beginning if we're at or near the end
        if (playerStatus.currentTime && playerStatus.duration) {
          const isNearEnd =
            playerStatus.currentTime >= playerStatus.duration - 0.1;
          if (isNearEnd) {
            console.log("🔄 Resetting to beginning");
            player.seekTo(0);
            setPlayingCollabAudioId(null);
            // Give it a moment to seek
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }

        console.log("▶️ Playing audio");
        player.play();
      }
    } catch (error) {
      console.error("❌ Failed to play audio:", error);
    }
  };

  const renderGiftContent = () => {
    if (giftType === "giftCard") {
      return (
        <View style={styles.giftCardContainer}>
          <GiftCardRenderer
            designId={content.designId || "design1"}
            amount={content.amount || "0"}
            merchantName={
              content.merchantName || (content as any).merchant || "Merchant"
            }
          />
        </View>
      );
    }

    if (giftType === "audioRecording") {
      console.log("🎨 Rendering audio controls");
      console.log("Audio URI:", content.audioUri);
      console.log("Audio loading:", audioLoading);
      console.log("Player loaded:", playerStatus.isLoaded);

      if (!content.audioUri) {
        return (
          <View style={styles.audioContainer}>
            <Text style={[theme.text.body2, { color: "red" }]}>
              ❌ No audio file available
            </Text>
          </View>
        );
      }

      return (
        <View style={styles.audioContainer}>
          {audioLoading ? (
            <>
              <ActivityIndicator size="large" color={theme.colors.waynOrange} />
              <Text style={[theme.text.body3, styles.audioText]}>
                Loading audio...
              </Text>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[
                  styles.audioPlayButton,
                  !playerStatus.isLoaded && styles.audioPlayButtonDisabled,
                ]}
                onPress={handlePlayAudio}
                disabled={!playerStatus.isLoaded}
              >
                <Feather
                  name={player.playing ? "pause" : "play"}
                  size={32}
                  color="#FFF"
                />
              </TouchableOpacity>
              <Text style={[theme.text.body2, styles.audioText]}>
                {!playerStatus.isLoaded
                  ? "Audio not loaded yet..."
                  : player.playing
                  ? "Tap to pause recording"
                  : "Tap to play recording"}
              </Text>
            </>
          )}
        </View>
      );
    }

    if (giftType === "playlist") {
      const playlistName = content.playlistName || "Playlist";
      const songs = content.songs || [];

      return (
        <View style={styles.playlistContainer}>
          <Text style={[theme.text.headline4, styles.playlistName]}>
            {playlistName}
          </Text>
          {songs.length > 0 ? (
            <ScrollView style={styles.playlistSongsList}>
              {songs.map((song, index) => (
                <View key={song.id || index} style={styles.playlistSongItem}>
                  <View style={styles.playlistAlbumArt} />
                  <View style={styles.playlistSongInfo}>
                    <Text style={[theme.text.body2, styles.playlistSongTitle]}>
                      {song.title}
                    </Text>
                    <Text style={[theme.text.body3, styles.playlistSongArtist]}>
                      {song.artist}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={[theme.text.body3, styles.playlistEmpty]}>
              No songs in this playlist
            </Text>
          )}
        </View>
      );
    }

    if (giftType === "letter") {
      // Handle both direct letter array and nested letter object
      const letterBlocks = Array.isArray(content.letter)
        ? content.letter
        : (content as any).letterBlocks || [];

      if (letterBlocks.length === 0) {
        return (
          <View style={styles.letterContainer}>
            <View style={styles.letterBox}>
              <Text style={styles.letterEmpty}>
                No content in this letter. Content structure:{" "}
                {JSON.stringify(Object.keys(content))}
              </Text>
            </View>
          </View>
        );
      }

      return (
        <View style={styles.letterContainer}>
          <ScrollView
            style={styles.letterScrollView}
            contentContainerStyle={styles.letterScrollContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            <View style={styles.letterBox}>
              <>
                {/* Regular blocks (text, image) */}
                {letterBlocks
                  .filter((b) => b.type !== "sticker" && b.type !== "draw")
                  .map((block) => {
                    if (block.type === "text") {
                      return (
                        <View key={block.id} style={styles.letterTextBlock}>
                          <Text style={styles.letterText}>
                            {block.content || ""}
                          </Text>
                        </View>
                      );
                    }
                    if (block.type === "image" && block.content) {
                      return (
                        <Image
                          key={block.id}
                          source={{ uri: block.content }}
                          style={[
                            styles.letterImage,
                            block.aspectRatio && {
                              aspectRatio: block.aspectRatio,
                            },
                          ]}
                          resizeMode="contain"
                        />
                      );
                    }
                    return null;
                  })}

                {/* Stickers overlay - positioned absolutely */}
                {letterBlocks
                  .filter((b) => b.type === "sticker")
                  .map((block) => {
                    if (block.type === "sticker") {
                      return (
                        <View
                          key={block.id}
                          style={[
                            styles.letterSticker,
                            {
                              left: block.x || 0,
                              top: block.y || 0,
                              width: block.size || 120,
                              height: block.size || 120,
                              transform: [
                                { rotate: `${block.rotation || 0}rad` },
                              ],
                            },
                          ]}
                        >
                          <Image
                            source={stickers[block.content as StickerKey]}
                            style={styles.letterStickerImage}
                            resizeMode="contain"
                          />
                        </View>
                      );
                    }
                    return null;
                  })}

                {/* Draw blocks overlay */}
                {letterBlocks
                  .filter((b) => b.type === "draw")
                  .map((block) => {
                    if (block.type === "draw" && block.strokes) {
                      return (
                        <View key={block.id} style={styles.letterDrawContainer}>
                          <Svg
                            style={StyleSheet.absoluteFill}
                            width="100%"
                            height="100%"
                          >
                            {block.strokes.map((stroke) => (
                              <Polyline
                                key={stroke.id}
                                points={stroke.points
                                  .map((p) => `${p.x},${p.y}`)
                                  .join(" ")}
                                fill="none"
                                stroke={stroke.color}
                                strokeWidth={stroke.thickness}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            ))}
                          </Svg>
                        </View>
                      );
                    }

                    return null;
                  })}
              </>
            </View>
          </ScrollView>
        </View>
      );
    }
    if (giftType === "collaborative") {
      const gifts = content.gifts || [];

      if (gifts.length === 0) {
        return (
          <View style={styles.playlistContainer}>
            <Text style={[theme.text.body3, styles.playlistEmpty]}>
              No gifts in this collaboration
            </Text>
          </View>
        );
      }

      return (
        <ScrollView
          style={styles.collaborativeGiftsScroll}
          contentContainerStyle={styles.collaborativeGiftsContent}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          {gifts.map((gift: any, index: number) => {
            const giftType = gift.type || gift.gift_type;
            const giftContent = gift.content || {};

            return (
              <View key={gift.id || index} style={styles.collaborativeGiftItem}>
                {/* Header showing sender */}
                <View style={styles.collaborativeGiftHeader}>
                  {gift.sender_profile && (
                    <Image
                      source={{ uri: gift.sender_profile }}
                      style={styles.collaborativeSenderIcon}
                      resizeMode="cover"
                    />
                  )}
                  <Text
                    style={[
                      theme.text.body2Bold,
                      styles.collaborativeSenderName,
                    ]}
                  >
                    {gift.sender}
                  </Text>
                </View>

                {/* Gift content based on type */}
                {giftType === "giftCard" && (
                  <View style={styles.giftCardContainer}>
                    <GiftCardRenderer
                      designId={giftContent.designId || "design1"}
                      amount={giftContent.amount || "0"}
                      merchantName={
                        giftContent.merchant ||
                        giftContent.merchantName ||
                        "Merchant"
                      }
                    />
                  </View>
                )}

                {giftType === "audioRecording" &&
                  (giftContent.audioUri || giftContent.audioRecording) && (
                    <View style={styles.audioContainer}>
                      {giftContent.audioUri ? (
                        <>
                          <TouchableOpacity
                            style={styles.audioPlayButton}
                            onPress={async () => {
                              try {
                                // Check if this specific audio is currently playing
                                const isThisAudioPlaying =
                                  playingCollabAudioId === gift.id &&
                                  player.playing;

                                if (isThisAudioPlaying) {
                                  // Pause this audio
                                  console.log("⏸️ Pausing collaborative audio");
                                  player.pause();
                                  setPlayingCollabAudioId(null);
                                } else {
                                  // Load and play this audio
                                  console.log(
                                    "🔄 Loading collaborative audio:",
                                    giftContent.audioUri
                                  );
                                  if (player.playing) {
                                    player.pause();
                                  }
                                  player.replace({ uri: giftContent.audioUri });
                                  setPlayingCollabAudioId(gift.id);

                                  // Wait for it to load
                                  await new Promise((resolve) =>
                                    setTimeout(resolve, 800)
                                  );

                                  console.log("▶️ Playing collaborative audio");
                                  player.play();
                                }
                              } catch (error) {
                                console.error(
                                  "❌ Failed to play collaborative audio:",
                                  error
                                );
                                setPlayingCollabAudioId(null);
                              }
                            }}
                          >
                            <Feather
                              name={
                                playingCollabAudioId === gift.id &&
                                player.playing
                                  ? "pause"
                                  : "play"
                              }
                              size={24}
                              color="#FFF"
                            />
                          </TouchableOpacity>
                          <Text style={[theme.text.body3, styles.audioText]}>
                            🎵 Audio recording from {gift.sender}
                          </Text>
                          <Text
                            style={[
                              theme.text.body3,
                              {
                                color: theme.colors.textSecondary,
                                fontStyle: "italic",
                                fontSize: 11,
                              },
                            ]}
                          >
                            {playingCollabAudioId === gift.id && player.playing
                              ? "Tap to pause"
                              : "Tap to play"}
                          </Text>
                        </>
                      ) : (
                        <>
                          <View style={styles.audioPlayButtonDisabled}>
                            <Feather
                              name="alert-circle"
                              size={24}
                              color="#FFF"
                            />
                          </View>
                          <Text
                            style={[
                              theme.text.body3,
                              styles.audioText,
                              { color: theme.colors.textSecondary },
                            ]}
                          >
                            Legacy audio format - please re-record
                          </Text>
                        </>
                      )}
                    </View>
                  )}
                {giftType === "playlist" && (
                  <View style={styles.playlistContainer}>
                    <Text style={[theme.text.headline4, styles.playlistName]}>
                      {giftContent.playlistName || "Playlist"}
                    </Text>
                    {giftContent.songs && giftContent.songs.length > 0 ? (
                      <View style={styles.playlistSongsList}>
                        {giftContent.songs
                          .slice(0, 3)
                          .map((song: any, songIndex: number) => (
                            <View
                              key={song.id || songIndex}
                              style={styles.playlistSongItem}
                            >
                              <View style={styles.playlistAlbumArt} />
                              <View style={styles.playlistSongInfo}>
                                <Text
                                  style={[
                                    theme.text.body3,
                                    styles.playlistSongTitle,
                                  ]}
                                >
                                  {song.title}
                                </Text>
                                <Text
                                  style={[
                                    theme.text.body3,
                                    styles.playlistSongArtist,
                                  ]}
                                >
                                  {song.artist}
                                </Text>
                              </View>
                            </View>
                          ))}
                        {giftContent.songs.length > 3 && (
                          <Text
                            style={[
                              theme.text.body3,
                              { color: theme.colors.textSecondary },
                            ]}
                          >
                            +{giftContent.songs.length - 3} more songs
                          </Text>
                        )}
                      </View>
                    ) : (
                      <Text style={[theme.text.body3, styles.playlistEmpty]}>
                        No songs in this playlist
                      </Text>
                    )}
                  </View>
                )}

                {giftType === "letter" && giftContent.letter && (
                  <View style={styles.letterBox}>
                    {giftContent.letter
                      .filter(
                        (b: any) => b.type !== "sticker" && b.type !== "draw"
                      )
                      .map((block: any) => {
                        if (block.type === "text") {
                          return (
                            <View key={block.id} style={styles.letterTextBlock}>
                              <Text style={styles.letterText}>
                                {block.content || ""}
                              </Text>
                            </View>
                          );
                        }
                        if (block.type === "image" && block.content) {
                          return (
                            <Image
                              key={block.id}
                              source={{ uri: block.content }}
                              style={[
                                styles.letterImage,
                                block.aspectRatio && {
                                  aspectRatio: block.aspectRatio,
                                },
                              ]}
                              resizeMode="contain"
                            />
                          );
                        }
                        return null;
                      })}

                    {/* Stickers overlay */}
                    {giftContent.letter
                      .filter((b: any) => b.type === "sticker")
                      .map((block: any) => (
                        <View
                          key={block.id}
                          style={[
                            styles.letterSticker,
                            {
                              left: block.x || 0,
                              top: block.y || 0,
                              width: block.size || 120,
                              height: block.size || 120,
                              transform: [
                                { rotate: `${block.rotation || 0}rad` },
                              ],
                            },
                          ]}
                        >
                          <Image
                            source={stickers[block.content as StickerKey]}
                            style={styles.letterStickerImage}
                            resizeMode="contain"
                          />
                        </View>
                      ))}

                    {/* Draw blocks overlay */}
                    {giftContent.letter
                      .filter((b: any) => b.type === "draw")
                      .map((block: any) => {
                        if (block.strokes) {
                          return (
                            <View
                              key={block.id}
                              style={styles.letterDrawContainer}
                            >
                              <Svg
                                style={StyleSheet.absoluteFill}
                                width="100%"
                                height="100%"
                              >
                                {block.strokes.map((stroke: any) => (
                                  <Polyline
                                    key={stroke.id}
                                    points={stroke.points
                                      .map((p: any) => `${p.x},${p.y}`)
                                      .join(" ")}
                                    fill="none"
                                    stroke={stroke.color}
                                    strokeWidth={stroke.thickness}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                ))}
                              </Svg>
                            </View>
                          );
                        }
                        return null;
                      })}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      );
    }
    return null;
  };

  const getButtonText = () => {
    switch (giftType) {
      case "giftCard":
        return "Add to Wallet";
      case "audioRecording":
        return "Save";
      case "playlist":
        return "Save";
      case "letter":
        return "Save";
      case "collaborative":
        return "Save All";
      default:
        return "Done";
    }
  };

  const getSuccessMessage = () => {
    switch (giftType) {
      case "giftCard":
        return {
          title: "Gift Card Added!",
          subtitle: "Gift card has been added to your wallet.",
        };
      case "audioRecording":
        return {
          title: "Audio Saved!",
          subtitle: "Recording has been saved to your files.",
        };
      case "playlist":
        return {
          title: "Playlist Saved!",
          subtitle: "Playlist has been saved to your library.",
        };
      case "letter":
        return {
          title: "Letter Saved!",
          subtitle: "Letter has been saved to your photos.",
        };
      case "collaborative":
        return {
          title: "Gifts Saved!",
          subtitle: "All gifts have been saved.",
        };
      default:
        return {
          title: "Success!",
          subtitle: "Gift has been saved.",
        };
    }
  };

  return (
    <>
      <Modal
        visible={visible && !showSuccessPopup}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.popupCard}>
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={[theme.text.headline3, styles.title]}>
                  {getGiftTypeTitle()} from {getFromNames()}
                </Text>
                <Text style={[theme.text.body3, styles.subtitle]}>
                  {dateSent}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {renderGiftContent()}

            {/* Only show button if not in view-only mode */}
            {!viewOnly && (
              <View style={styles.buttonContainer}>
                <PrimaryButton
                  title={getButtonText()}
                  onPress={handleMainAction}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Success Popup */}
      <Modal
        visible={showSuccessPopup}
        transparent
        animationType="fade"
        onRequestClose={handleSuccessClose}
      >
        <View style={styles.overlay}>
          <View style={styles.successPopup}>
            <View style={styles.successHeader}>
              <View style={styles.headerText}>
                <Text style={[theme.text.headline3, styles.title]}>
                  {getSuccessMessage().title}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleSuccessClose}
                style={styles.closeButton}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={[theme.text.body2, styles.successSubtitle]}>
              {getSuccessMessage().subtitle}
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  popupCard: {
    width: "90%",
    padding: theme.spacing.lg,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "#E8E8E9",
    backgroundColor: theme.colors.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    alignSelf: "stretch",
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    paddingRight: theme.spacing.sm,
  },
  subtitle: {
    color: theme.colors.textSecondary,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  closeIcon: {
    fontSize: 20,
    color: theme.colors.iconPrimary,
    fontWeight: "400",
  },
  buttonContainer: {
    width: "100%",
  },
  giftCardContainer: {
    width: "100%",
    aspectRatio: 1.586,
    borderRadius: theme.borderRadius.sm,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  audioContainer: {
    width: "100%",
    padding: theme.spacing.xl,
    alignItems: "center",
    gap: theme.spacing.md,
  },
  audioPlayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.waynOrange,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.waynOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  audioPlayButtonDisabled: {
    opacity: 0.5,
    backgroundColor: "#CCC",
  },
  audioText: {
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  successPopup: {
    width: "85%",
    padding: theme.spacing.lg,
    flexDirection: "column",
    gap: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "#E8E8E9",
    backgroundColor: theme.colors.white,
  },
  successHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  successSubtitle: {
    color: theme.colors.textPrimary,
  },
  playlistContainer: {
    width: "100%",
    gap: theme.spacing.md,
  },
  playlistName: {
    marginBottom: theme.spacing.sm,
  },
  playlistSongsList: {
    maxHeight: 300,
  },
  playlistSongItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  playlistAlbumArt: {
    width: 48,
    height: 48,
    backgroundColor: "#D1D5DB",
    borderRadius: theme.borderRadius.sm,
  },
  playlistSongInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  playlistSongTitle: {
    color: theme.colors.textPrimary,
  },
  playlistSongArtist: {
    color: theme.colors.textSecondary,
  },
  playlistEmpty: {
    color: theme.colors.textSecondary,
    textAlign: "center",
    padding: theme.spacing.lg,
  },
  letterContainer: {
    width: "100%",
    maxHeight: 400,
    minHeight: 300,
  },
  letterScrollView: {
    width: "100%",
    maxHeight: 500,
  },
  letterScrollContent: {
    padding: theme.spacing.sm,
  },
  letterBox: {
    backgroundColor: "#FCFCFC",
    borderWidth: 1,
    borderColor: "#EFEFEF",
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    minHeight: 400,
    position: "relative",
  },
  letterEmpty: {
    color: theme.colors.textSecondary,
    textAlign: "center",
    padding: theme.spacing.xl,
  },
  letterTextBlock: {
    marginBottom: theme.spacing.md,
  },
  letterText: {
    fontSize: 20,
    color: "#222",
    fontFamily: "PatrickHand",
    lineHeight: 28,
  },
  letterImage: {
    width: "100%",
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
  letterSticker: {
    position: "absolute",
    zIndex: 10,
  },
  letterStickerImage: {
    width: "100%",
    height: "100%",
  },
  letterDrawContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
    pointerEvents: "none",
  },
  collaborativeGiftsScroll: {
    width: "100%",
    maxHeight: 500,
  },
  collaborativeGiftsContent: {
    paddingBottom: theme.spacing.md,
  },
  collaborativeGiftItem: {
    marginBottom: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  collaborativeGiftHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  collaborativeSenderIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.waynOrange,
  },
  collaborativeSenderName: {
    color: theme.colors.textPrimary,
  },
});

export default GiftContentPopup;
