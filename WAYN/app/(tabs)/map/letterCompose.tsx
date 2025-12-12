import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StickerKey, stickers } from "../../../assets/stickers";
import { theme } from "../../../assets/theme";
import DualBottomCTA from "../../../components/buttons/dualBottomCTA";
import OverlayHeader from "../../../components/navigation/overlayHeader";
import { useAuth } from "../../../contexts/authContext";
import type { DrawBlock, LetterBlock } from "../../../types/types";
import { db } from "../../../utils/supabase";
import DrawOverlay from "./drawOverlay";
import StickerOverlay from "./stickerOverlay";

/* ----------------------------------------------------- */
/* MAIN COMPONENT                                         */
/* ----------------------------------------------------- */

export default function LetterComposeScreen() {
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
    sessionId,
    collaboratorIds,
    giftCount,
    hostId,
  } = params;

  const [letterBlocks, setLetterBlocks] = useState<LetterBlock[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [startEditingId, setStartEditingId] = useState<string | null>(null);

  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  // drawing state
  const [showDrawMenu, setShowDrawMenu] = useState(false);
  const [drawColor, setDrawColor] = useState("#000000");
  const [drawThickness, setDrawThickness] = useState(4);
  const [isErasing, setIsErasing] = useState(false);

  const [activeTool, setActiveTool] = useState<
    "image" | "text" | "sticker" | "draw" | "erase" | null
  >(null);

  const makeId = () => Math.floor(Math.random() * 1_000_000_000).toString();

  useEffect(() => {
    if (startEditingId !== null) setStartEditingId(null);
  }, [startEditingId]);

  /* ---------------- ADD TEXT ---------------- */
  const handleAddText = () => {
    const id = makeId();
    setLetterBlocks((prev) => [...prev, { id, type: "text", content: "" }]);
    setSelectedId(id);
    setStartEditingId(id);
  };

  /* ---------------- ADD IMAGE ---------------- */
  const handleAddImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled) return;

    const { width, height, uri } = result.assets[0];
    const id = makeId();

    setLetterBlocks((prev) => [
      ...prev,
      {
        id,
        type: "image",
        content: uri,
        aspectRatio: width / height,
      },
    ]);
  };

  /* ---------------- ADD STICKER ---------------- */
  const handleAddSticker = (key: StickerKey) => {
    const id = makeId();
    setLetterBlocks((prev) => [
      ...prev,
      {
        id,
        type: "sticker",
        content: key,
        size: 120,
        x: 140,
        y: 140,
        rotation: 0,
      },
    ]);
    setSelectedId(id);
  };

  /* ---------------- START DRAWING ---------------- */
  const handleStartDrawing = () => {
    setIsErasing(false);

    const id = makeId();
    const newBlock: DrawBlock = {
      id,
      type: "draw",
      strokes: [],
    };

    setLetterBlocks((prev) => [...prev, newBlock]);
    setSelectedId(id);
    setShowDrawMenu(true);
  };

  /* ---------------- BUTTON ACTIONS ---------------- */
  const handleBack = () => {
    if (letterBlocks.length !== 0) {
      Alert.alert(
        "Discard Letter?",
        "Are you sure you want to go back? Your letter will be lost.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else router.back();
  };

  const handleClose = handleBack;

  const handleSendGift = async () => {
    console.log("Send gift pressed");

    const giftData: any = {
      sender_display_name: currentUser?.display_name,
      receiver_display_name: friendName,
      sender_id: currentUser?.id,
      receiver_id: friendId,
      address: locationAddress,
      gift_type: "letter",
      latitude: parseFloat(locationLatitude as string),
      longitude: parseFloat(locationLongitude as string),
      content: { letter: letterBlocks },
    };

    const { data, error } = await db
      .from("sent_gifts")
      .insert([giftData])
      .select();

    if (error) {
      console.error("Error inserting sent_gifts:", error);
      return;
    }

    const giftId = data?.[0]?.id;

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
        giftType: "letter",
        giftId,
        letterBlock: JSON.stringify(letterBlocks),
      },
    });
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
      gift_type: "letter",
      content: {
        letter: letterBlocks,
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
          giftCount: count,
          collaboratorIds,
          hostId,
        },
      });
    } catch (err) {
      console.error("Unexpected error inserting collab_gift_basket:", err);
    }
  };

  console.log(giftCount);
  const handleSaveAndExit = async () => {
    const draft = {
      sender_display_name: currentUser?.display_name,
      receiver_display_name: friendName,
      sender_id: currentUser?.id,
      receiver_id: friendId,
      address: locationAddress,
      gift_type: "letter",
      content: { letter: letterBlocks },
    };

    const { error } = await db.from("gift_drafts").upsert(draft);
    if (error) console.error("Error inserting draft:", error);

    router.push("/(tabs)/map");
  };

  /* ----------------------------------------------------- */
  /* RENDER                                                */
  /* ----------------------------------------------------- */

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        {/* HEADER */}
        <View style={styles.header}>
          <OverlayHeader
            title="Letter"
            onBack={handleBack}
            onClose={handleClose}
          />
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Craft your letter</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 250 }}
          keyboardShouldPersistTaps="always"
          scrollEnabled={scrollEnabled}
        >
          {/* RELATIVE WRAPPER */}
          <View style={{ position: "relative" }}>
            {/* LETTER CONTENT */}
            <View style={styles.letterBox}>
              {letterBlocks.filter((b) => b.type !== "sticker").length ===
                0 && (
                <Text style={styles.placeholder}>
                  Start writing or add elements below...
                </Text>
              )}

              {letterBlocks.map((block) => {
                const isSelected = block.id === selectedId;

                if (block.type === "text") {
                  return (
                    <EditableTextBlock
                      key={block.id}
                      id={block.id}
                      content={block.content}
                      isSelected={isSelected}
                      shouldStartEditing={startEditingId === block.id}
                      onChange={(txt: string) =>
                        setLetterBlocks((prev) =>
                          prev.map((b) =>
                            b.id === block.id && b.type === "text"
                              ? { ...b, content: txt }
                              : b
                          )
                        )
                      }
                      onSelect={() => {
                        Keyboard.dismiss();
                        setSelectedId(block.id);
                        setIsErasing(false);
                      }}
                      onDelete={() =>
                        setLetterBlocks((prev) =>
                          prev.filter((b) => b.id !== block.id)
                        )
                      }
                    />
                  );
                }

                if (block.type === "image") {
                  return (
                    <TouchableOpacity
                      key={block.id}
                      onPress={() => {
                        Keyboard.dismiss();
                        setSelectedId(block.id);
                        setIsErasing(false);
                      }}
                      activeOpacity={1}
                      style={[
                        styles.blockWrapper,
                        isSelected && styles.selectedOutline,
                      ]}
                    >
                      <Image
                        source={{ uri: block.content }}
                        style={{
                          width: "100%",
                          aspectRatio: block.aspectRatio,
                          borderRadius: 10,
                        }}
                      />

                      {isSelected && (
                        <TouchableOpacity
                          onPress={() =>
                            setLetterBlocks((prev) =>
                              prev.filter((b) => b.id !== block.id)
                            )
                          }
                          style={styles.deleteIcon}
                        >
                          <Feather name="trash" size={18} color="white" />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  );
                }

                return null;
              })}

              {/* Add text area */}
              <TouchableOpacity
                activeOpacity={1}
                style={{ height: 140 }}
                onPress={() => {
                  Keyboard.dismiss();
                  const last = letterBlocks[letterBlocks.length - 1];
                  if (!last || last.type !== "text") return handleAddText();
                  setSelectedId(last.id);
                  setStartEditingId(last.id);
                }}
              />
            </View>

            {/* OVERLAY AREA — constrained to letterBox */}
            <View
              pointerEvents="box-none"
              style={{
                position: "absolute",
                top: 20,
                left: 20,
                right: 20,
                bottom: 40,
                zIndex: 100,
              }}
            >
              {/* STICKERS FIRST */}
              {letterBlocks.map((block) =>
                block.type === "sticker" ? (
                  <StickerOverlay
                    key={block.id}
                    block={block}
                    isSelected={selectedId === block.id}
                    onSelect={() => {
                      setSelectedId(block.id);
                      setIsErasing(false);
                    }}
                    onDelete={() =>
                      setLetterBlocks((prev) =>
                        prev.filter((b) => b.id !== block.id)
                      )
                    }
                    onUpdate={(patch) =>
                      setLetterBlocks((prev) =>
                        prev.map((b) =>
                          b.id === block.id && b.type === "sticker"
                            ? { ...b, ...patch }
                            : b
                        )
                      )
                    }
                  />
                ) : null
              )}

              {/* DRAWINGS ON TOP (per your choice) */}
              {letterBlocks.map((block) =>
                block.type === "draw" ? (
                  <DrawOverlay
                    key={block.id}
                    block={block}
                    color={drawColor}
                    thickness={drawThickness}
                    setScrollEnabled={setScrollEnabled}
                    isSelected={selectedId === block.id}
                    isActive={
                      selectedId === block.id && showDrawMenu && !isErasing
                    }
                    // isErasing={isErasing && selectedId === block.id}
                    isErasing={isErasing}
                    onSelect={() => setSelectedId(block.id)}
                    onDelete={() =>
                      setLetterBlocks((prev) =>
                        prev.filter((b) => b.id !== block.id)
                      )
                    }
                    onUpdate={(patch) =>
                      setLetterBlocks((prev) =>
                        prev.map((b) =>
                          b.id === block.id && b.type === "draw"
                            ? { ...b, ...patch }
                            : b
                        )
                      )
                    }
                  />
                ) : null
              )}
            </View>
          </View>

          {/* TOOLBAR */}
          <View style={styles.toolbar}>
            <ToolbarItem
              icon="image"
              label="Image"
              active={activeTool === "image"}
              onPress={() => {
                setActiveTool("image");
                setIsErasing(false);
                handleAddImage();
              }}
            />

            <ToolbarItem
              icon="type"
              label="Text"
              active={activeTool === "text"}
              onPress={() => {
                setActiveTool("text");
                setIsErasing(false);
                handleAddText();
              }}
            />

            <ToolbarItem
              icon="smile"
              label="Sticker"
              active={activeTool === "sticker"}
              onPress={() => {
                setActiveTool("sticker");
                setIsErasing(false);
                setShowStickerPicker(true);
              }}
            />

            <ToolbarItem
              icon="edit-3"
              label="Draw"
              active={activeTool === "draw"}
              onPress={() => {
                setActiveTool("draw");
                setIsErasing(false);
                handleStartDrawing();
              }}
            />

            <ToolbarItem
              icon="eraser"
              label="Erase"
              iconComponent={MaterialCommunityIcons}
              active={activeTool === "erase"}
              onPress={() => {
                setActiveTool("erase");
                setIsErasing(true);
                setShowDrawMenu(false);
              }}
            />
          </View>

          {/* STICKER PICKER */}
          {showStickerPicker && (
            <View style={styles.stickerSheet}>
              <View style={styles.stickerContent}>
                {Object.keys(stickers).map((key) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => {
                      handleAddSticker(key as StickerKey);
                      setShowStickerPicker(false);
                    }}
                  >
                    <Image
                      source={stickers[key as StickerKey]}
                      style={{ width: 70, height: 70, margin: 10 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.closeIcon}
                onPress={() => setShowStickerPicker(false)}
              >
                <Feather name="x" size={28} color="#444" />
              </TouchableOpacity>
            </View>
          )}

          {/* DRAW MENU */}
          {showDrawMenu && (
            <View style={styles.drawMenu}>
              <Text
                style={{ fontWeight: "700", fontSize: 16, marginBottom: 10 }}
              >
                Drawing Tools
              </Text>

              {/* Colors */}
              <View style={styles.row}>
                {["#000", "#F44336", "#2196F3", "#4CAF50", "#FFEB3B"].map(
                  (c) => (
                    <TouchableOpacity
                      key={c}
                      onPress={() => setDrawColor(c)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 28,
                        backgroundColor: c,
                        marginHorizontal: 6,
                        borderWidth: drawColor === c ? 3 : 1,
                        borderColor: drawColor === c ? "#333" : "#ccc",
                      }}
                    />
                  )
                )}
              </View>

              {/* Thickness */}
              <View style={styles.row}>
                {[2, 4, 6, 8, 12].map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setDrawThickness(t)}
                    style={{
                      padding: 8,
                      borderWidth: 1,
                      borderColor: drawThickness === t ? "#4A90E2" : "#ccc",
                      borderRadius: 8,
                      marginHorizontal: 4,
                    }}
                  >
                    <View
                      style={{
                        width: t * 2,
                        height: t,
                        backgroundColor: "#444",
                        borderRadius: 20,
                      }}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => setShowDrawMenu(false)}
                style={{ marginTop: 10 }}
              >
                <Feather name="x" size={24} />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* BOTTOM CTA */}
        <View style={styles.bottomButtons}>
          <DualBottomCTA
            primaryText="Send Gift"
            secondaryText="Save & Exit"
            onPrimaryPress={handleSendGift}
            onSecondaryPress={handleSaveAndExit}
            primaryDisabled={letterBlocks.length === 0}
            secondaryDisabled={letterBlocks.length === 0}
          />
          {/* Bottom Buttons */}
          {!collaboratorIds && (
            <DualBottomCTA
              primaryText="Send Gift"
              secondaryText="Save & Exit"
              onPrimaryPress={handleSendGift}
              onSecondaryPress={handleSaveAndExit}
              primaryDisabled={letterBlocks.length === 0}
              secondaryDisabled={letterBlocks.length === 0}
            />
          )}
          {collaboratorIds && (
            <DualBottomCTA
              primaryText="Add Gift"
              secondaryText="Save & Exit"
              onPrimaryPress={handleAddGift}
              onSecondaryPress={handleSaveAndExit}
              primaryDisabled={letterBlocks.length === 0}
              secondaryDisabled={letterBlocks.length === 0}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

/* ----------------------------------------------------- */
/* TOOLBAR ITEM                                           */
/* ----------------------------------------------------- */

function ToolbarItem({ icon, label, onPress, active, iconComponent }: any) {
  const color = active ? "#F27052" : "#444";
  const Icon = iconComponent || Feather;

  return (
    <TouchableOpacity style={styles.toolbarItem} onPress={onPress}>
      <Icon name={icon} size={20} color={color} />
      <Text style={[styles.toolbarLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ----------------------------------------------------- */
/* EDITABLE TEXT BLOCK                                    */
/* ----------------------------------------------------- */

function EditableTextBlock({
  id,
  content,
  isSelected,
  shouldStartEditing,
  onChange,
  onSelect,
  onDelete,
}: any) {
  const inputRef = useRef<TextInput | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (shouldStartEditing) setIsEditing(true);
  }, [shouldStartEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onSelect}
      style={[styles.blockWrapper, isSelected && styles.selectedOutline]}
    >
      {isEditing ? (
        <TextInput
          ref={inputRef}
          value={content}
          multiline
          autoFocus
          onChangeText={onChange}
          onBlur={() => setIsEditing(false)}
          style={styles.textInput}
          onSubmitEditing={() => {
            Keyboard.dismiss();
            setIsEditing(false);
          }}
          blurOnSubmit={true}
        />
      ) : (
        <Text style={styles.textBlock}>{content || "Start typing..."}</Text>
      )}

      {isSelected && (
        <View style={styles.editRow}>
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Feather name="edit-2" size={18} color="#4A90E2" />
          </TouchableOpacity>

          <TouchableOpacity onPress={onDelete} style={{ marginLeft: 12 }}>
            <Feather name="trash" size={18} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

/* ----------------------------------------------------- */
/* STYLES                                                 */
/* ----------------------------------------------------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white" },

  scroll: { flex: 1 },

  drawMenu: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    zIndex: 1000,
  },

  row: {
    flexDirection: "row",
    marginVertical: 10,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  titleContainer: {
    paddingLeft: 23,
    paddingBottom: 10,
  },

  title: {
    ...theme.text.body1Bold,
  },

  letterBox: {
    backgroundColor: "#FCFCFC",
    borderWidth: 1,
    borderColor: "#EFEFEF",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    minHeight: 500,
    paddingBottom: 40,
  },

  placeholder: {
    color: "#AAA",
    textAlign: "center",
    marginTop: 20,
  },

  blockWrapper: {
    marginBottom: 16,
    padding: 4,
    borderRadius: 10,
  },

  selectedOutline: {
    borderWidth: 2,
    borderColor: "#4A90E2",
  },

  deleteIcon: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 6,
    borderRadius: 20,
  },

  editRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },

  textInput: {
    fontSize: 20,
    color: "#222",
    fontFamily: "PatrickHand",
  },

  textBlock: {
    fontSize: 20,
    color: "#222",
    fontFamily: "PatrickHand",
  },

  toolbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderColor: "#ECECEC",
    paddingVertical: 12,
    marginTop: 20,
  },

  toolbarItem: { alignItems: "center" },

  toolbarLabel: { fontSize: 12, marginTop: 4, color: "#666" },

  stickerSheet: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    backgroundColor: "white",
    paddingVertical: 20,
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#eee",
    zIndex: 1000,
  },

  stickerContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "80%",
  },

  closeIcon: {
    position: "absolute",
    top: 10,
    right: 20,
  },

  bottomButtons: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
});
