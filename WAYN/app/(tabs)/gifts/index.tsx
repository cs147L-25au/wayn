import Feather from "@expo/vector-icons/Feather";
import { ComponentProps, useEffect, useMemo, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Defs,
  LinearGradient,
  Rect,
  Stop,
  Svg,
  SvgXml,
} from "react-native-svg";
import { theme } from "../../../assets/theme";
import { getGiftBoxSvg } from "../../../components/pastGifts/svgAssets";
import { TagIconSvg, TagVariant } from "../../../components/TagIconSVG";
import { useAuth } from "../../../contexts/authContext";
import { UserService } from "../../../services/userService";
import { db } from "../../../utils/supabase";


const PinkPlank = ({ 
  width, 
  isReceived = false 
}: { 
  width: number; 
  isReceived?: boolean;
}) => {
  const gradientId = isReceived ? "purplePlankGradient" : "pinkPlankGradient";
  const gradientStart = isReceived ? "#ADB1FF" : "#FFB9AF";
  const gradientEnd = isReceived ? "#626AFF" : "#FF8D84";
  const lightColor = isReceived ? "#E6E8FF" : "#FFE3DF";
  
  return (
    <Svg width={width} height={110} viewBox={`0 0 ${width} 110`} preserveAspectRatio="none">
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={gradientStart} />
          <Stop offset="1" stopColor={gradientEnd} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="28" width={width} height="30" rx="6" fill={`url(#${gradientId})`} />
      <Rect x="0" y="60" width={width} height="22" rx="6" fill={lightColor} />
      <Rect x="0" y="50" width={width} height="12" rx="6" fill="rgba(255,255,255,0.35)" />
      <Rect x="0" y="82" width={width} height="14" rx="6" fill="rgba(0,0,0,0.08)" />
    </Svg>
  );
};

type GiftItem = {
  id: string;
  name: string;
  date: string;
  dateTimestamp?: string; // Store original timestamp for week grouping
  avatar: ImageSourcePropType;
};

type GiftCategory = {
  id: string;
  label: string;
  icon: ComponentProps<typeof Feather>["name"];
  gifts: GiftItem[];
};

// Helper function to map gift_type from DB to category id
const mapGiftTypeToCategory = (giftType: string): string => {
  switch (giftType) {
    case "giftCard":
      return "gift-cards";
    case "audioRecording":
      return "audio-recordings";
    case "letter":
      return "letters";
    case "playlist":
      return "playlists";
    default:
      return "gift-cards";
  }
};

const getVariantForCategory = (categoryId: string): TagVariant => {
  switch (categoryId) {
    case "playlists":
      return "music";
    case "letters":
      return "pen";
    case "gift-cards":
      return "money";
    case "audio-recordings":
      return "sound";
    default:
      return "money";
  }
};

// Helper function to get icon for gift type
const getIconForGiftType = (
  giftType: string
): ComponentProps<typeof Feather>["name"] => {
  switch (giftType) {
    case "giftCard":
      return "gift";
    case "audioRecording":
      return "mic";
    case "letter":
      return "edit-3";
    case "playlist":
      return "music";
    default:
      return "gift";
  }
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

// Helper function to get week key (start of week, Monday as first day)
const getWeekKey = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split("T")[0];
};

// Helper function to get week label with date range
const getWeekLabel = (dateString: string): string => {
  const date = new Date(dateString);
  const weekStart = new Date(getWeekKey(dateString));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6); // Sunday of the same week

  const startMonth = weekStart.toLocaleDateString("en-US", { month: "short" });
  const startDay = weekStart.getDate();
  const endMonth = weekEnd.toLocaleDateString("en-US", { month: "short" });
  const endDay = weekEnd.getDate();

  // If same month, only show month once
  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${startMonth} ${startDay} - ${endDay}`;
  } else {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  }
};

const RECEIVED_CATEGORIES: GiftCategory[] = [
  {
    id: "letters",
    label: "Letters",
    icon: "edit-3",
    gifts: [
      {
        id: "sam",
        name: "Sam L.",
        date: "7/28/2025",
        avatar: require("../../../assets/userIcons/hallieicon.png"),
      },
      {
        id: "milo",
        name: "Milo A.",
        date: "7/20/2025",
        avatar: require("../../../assets/userIcons/jillicon.png"),
      },
      {
        id: "emily",
        name: "Emily B.",
        date: "7/10/2025",
        avatar: require("../../../assets/userIcons/katicon.png"),
      },
    ],
  },
  {
    id: "playlists",
    label: "Playlists",
    icon: "music",
    gifts: [
      {
        id: "karen",
        name: "Karen D.",
        date: "7/12/2025",
        avatar: require("../../../assets/userIcons/katicon.png"),
      },
      {
        id: "leo",
        name: "Leo S.",
        date: "7/06/2025",
        avatar: require("../../../assets/userIcons/leoicon.png"),
      },
    ],
  },
  {
    id: "gift-cards",
    label: "Gift Cards",
    icon: "gift",
    gifts: [
      {
        id: "avery",
        name: "Avery L.",
        date: "6/28/2025",
        avatar: require("../../../assets/userIcons/katicon.png"),
      },
      {
        id: "noah",
        name: "Noah T.",
        date: "6/20/2025",
        avatar: require("../../../assets/userIcons/jillicon.png"),
      },
    ],
  },
  {
    id: "audio-recordings",
    label: "Audio Recordings",
    icon: "mic",
    gifts: [
      {
        id: "maya",
        name: "Maya R.",
        date: "6/12/2025",
        avatar: require("../../../assets/userIcons/hallieicon.png"),
      },
      {
        id: "leon",
        name: "Leon H.",
        date: "6/05/2025",
        avatar: require("../../../assets/userIcons/leoicon.png"),
      },
    ],
  },
];

const TAB_OPTIONS = [
  { id: "received", label: "Received Gifts" },
  { id: "sent", label: "Sent Gifts" },
] as const;

const SORT_OPTIONS = ["recency", "sender", "item"] as const;
type SortKey = (typeof SORT_OPTIONS)[number];
const SORT_LABELS: Record<SortKey, string> = {
  item: "Item",
  sender: "Sender",
  recency: "Recency",
};

const SORT_MENU_WIDTH = 150;

const TRACK_HEIGHT = 3;

const CARD_WIDTH = 180;

const getSortLabel = (option: SortKey, activeTab: "received" | "sent") => {
  if (option === "sender" && activeTab === "sent") {
    return "Receiver";
  }
  return SORT_LABELS[option];
};

const ITEM_SORT_PRIORITY: Record<string, number> = {
  "gift-cards": 0,
  letters: 1,
  playlists: 2,
  "audio-recordings": 3,
};

const GiftCard = ({
  gift,
  variant,
  isReceived = false,
}: {
  gift: GiftItem;
  variant: TagVariant;
  isReceived?: boolean;
}) => (
  <View style={styles.giftCardWrapper}>
    <SvgXml 
      xml={getGiftBoxSvg(isReceived ? theme.colors.waynBlue : theme.colors.waynOrange)} 
      width={150} 
      height={175} 
      style={styles.giftBoxSvg} 
    />
    <View style={styles.giftInfo}>
      <Image source={gift.avatar} style={styles.avatar} />
      <Text style={styles.giftName}>{gift.name}</Text>
      <Text style={styles.giftDate}>{gift.date}</Text>
    </View>

      <View style={styles.tagIcon}>
        <TagIconSvg 
          variant={variant} 
          width={55} 
          color={isReceived ? theme.colors.waynBlue : theme.colors.waynOrange}
        />
      </View>
  </View>
);

export default function PastGiftsScreen() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"received" | "sent">("sent");
  const [sort, setSort] = useState<SortKey>("recency");
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [sentGifts, setSentGifts] = useState<GiftCategory[]>([]);
  const [receivedGifts, setReceivedGifts] = useState<GiftCategory[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch received gifts from Supabase
  useEffect(() => {
    if (!currentUser || activeTab !== "received") {
      if (activeTab !== "received") {
        setReceivedGifts([]);
      }
      return;
    }

    const fetchReceivedGifts = async () => {
      setLoading(true);
      try {
        const { data, error } = await db
          .from("sent_gifts")
          .select("*")
          .eq("receiver_id", currentUser.id)
          .in("status", ["pending", "opened"])
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching received gifts:", error);
          setLoading(false);
          setReceivedGifts([]);
          return;
        }

        if (!data || data.length === 0) {
          setReceivedGifts([]);
          setLoading(false);
          return;
        }

        // Group gifts by category
        const giftsByCategory: Record<string, GiftItem[]> = {};

        // Fetch avatars for all senders
        const resolvedGifts = await Promise.all(
          data.map(async (gift) => {
            const { success, user } = await UserService.getUserById(
              gift.sender_id
            );
            let avatar = user?.profile_icon_url
              ? { uri: user.profile_icon_url }
              : require("../../../assets/userIcons/jillicon.png");

            // Handle timestamp - try created_at first, fallback to other timestamp fields
            const timestamp =
              gift.created_at ||
              (gift as any).createdAt ||
              new Date().toISOString();

            return {
              id: gift.id.toString(),
              name: gift.sender_display_name,
              date: formatDate(timestamp),
              dateTimestamp: timestamp, // Store original timestamp for week grouping
              avatar,
            };
          })
        );

        // Group by category
        resolvedGifts.forEach((giftItem, index) => {
          const gift = data[index];
          const categoryId = mapGiftTypeToCategory(gift.gift_type);

          if (!giftsByCategory[categoryId]) {
            giftsByCategory[categoryId] = [];
          }
          giftsByCategory[categoryId].push(giftItem);
        });

        // Convert to GiftCategory array
        const categories: GiftCategory[] = Object.entries(giftsByCategory).map(
          ([categoryId, gifts]) => {
            const firstGift = data.find(
              (g) => mapGiftTypeToCategory(g.gift_type) === categoryId
            );
            return {
              id: categoryId,
              label:
                categoryId === "gift-cards"
                  ? "Gift Cards"
                  : categoryId === "audio-recordings"
                  ? "Audio Recordings"
                  : categoryId === "letters"
                  ? "Letters"
                  : "Playlists",
              icon: firstGift
                ? getIconForGiftType(firstGift.gift_type)
                : "gift",
              gifts,
            };
          }
        );

        setReceivedGifts(categories);
      } catch (err) {
        console.error("Unexpected error fetching received gifts:", err);
        setReceivedGifts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReceivedGifts();
  }, [currentUser, activeTab]);

  // Fetch sent gifts from Supabase
  useEffect(() => {
    if (!currentUser || activeTab !== "sent") {
      if (activeTab !== "sent") {
        setSentGifts([]);
      }
      return;
    }

    const fetchSentGifts = async () => {
      setLoading(true);
      try {
        const { data, error } = await db
          .from("sent_gifts")
          .select("*")
          .eq("sender_id", currentUser.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching sent gifts:", error);
          setLoading(false);
          setSentGifts([]);
          return;
        }

        if (!data || data.length === 0) {
          setSentGifts([]);
          setLoading(false);
          return;
        }

        // Group gifts by category
        const giftsByCategory: Record<string, GiftItem[]> = {};

        // Fetch avatars for all receivers
        const resolvedGifts = await Promise.all(
          data.map(async (gift) => {
            const { success, user } = await UserService.getUserById(
              gift.receiver_id
            );
            let avatar = user?.profile_icon_url
              ? { uri: user.profile_icon_url }
              : require("../../../assets/userIcons/jillicon.png");

            // Handle timestamp - try created_at first, fallback to other timestamp fields
            const timestamp =
              gift.created_at ||
              (gift as any).createdAt ||
              new Date().toISOString();

            return {
              id: gift.id.toString(),
              name: gift.receiver_display_name,
              date: formatDate(timestamp),
              dateTimestamp: timestamp, // Store original timestamp for week grouping
              avatar,
            };
          })
        );

        // Group by category
        resolvedGifts.forEach((giftItem, index) => {
          const gift = data[index];
          const categoryId = mapGiftTypeToCategory(gift.gift_type);

          if (!giftsByCategory[categoryId]) {
            giftsByCategory[categoryId] = [];
          }
          giftsByCategory[categoryId].push(giftItem);
        });

        // Convert to GiftCategory array
        const categories: GiftCategory[] = Object.entries(giftsByCategory).map(
          ([categoryId, gifts]) => {
            const firstGift = data.find(
              (g) => mapGiftTypeToCategory(g.gift_type) === categoryId
            );
            return {
              id: categoryId,
              label:
                categoryId === "gift-cards"
                  ? "Gift Cards"
                  : categoryId === "audio-recordings"
                  ? "Audio Recordings"
                  : categoryId === "letters"
                  ? "Letters"
                  : "Playlists",
              icon: firstGift
                ? getIconForGiftType(firstGift.gift_type)
                : "gift",
              gifts,
            };
          }
        );

        setSentGifts(categories);
      } catch (err) {
        console.error("Unexpected error fetching sent gifts:", err);
        setSentGifts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSentGifts();
  }, [currentUser, activeTab]);

  const timeline = useMemo(
    () => (activeTab === "sent" ? sentGifts : receivedGifts),
    [activeTab, sentGifts, receivedGifts]
  );

  const sortedTimeline = useMemo(() => {
    if (sort === "sender") {
      const groupedBySender: Record<
        string,
        { gifts: GiftItem[]; icon: ComponentProps<typeof Feather>["name"] }
      > = {};

      timeline.forEach((category) => {
        category.gifts.forEach((gift) => {
          if (!groupedBySender[gift.name]) {
            groupedBySender[gift.name] = { gifts: [], icon: category.icon };
          }
          groupedBySender[gift.name].gifts.push(gift);
        });
      });

      return Object.entries(groupedBySender)
        .map(([name, { gifts, icon }], index) => {
          const sortedGifts = [...gifts].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
          return {
            id: `sender-${slug || index}`,
            label: name,
            icon,
            gifts: sortedGifts,
          };
        })
        .sort((a, b) => a.label.localeCompare(b.label));
    }

    if (sort === "recency") {
      // Group all gifts by week (no per-category grouping)
      const giftsByWeek: Record<
        string,
        { weekLabel: string; weekStart: Date; gifts: GiftItem[] }
      > = {};
    
      timeline.forEach((category) => {
        category.gifts.forEach((gift) => {
          // Use original timestamp if available, otherwise parse from formatted date
          const giftDate = gift.dateTimestamp
            ? new Date(gift.dateTimestamp)
            : (() => {
                const [month, day, year] = gift.date.split("/").map(Number);
                return new Date(year, month - 1, day);
              })();
    
          const iso = giftDate.toISOString();
          const weekKey = getWeekKey(iso);
          const weekLabel = getWeekLabel(iso);
          const weekStart = new Date(getWeekKey(iso));
    
          if (!giftsByWeek[weekKey]) {
            giftsByWeek[weekKey] = {
              weekLabel,
              weekStart,
              gifts: [],
            };
          }
    
          giftsByWeek[weekKey].gifts.push(gift);
        });
      });
    
      // One GiftCategory (i.e., one shelf) per week, newest → oldest
      const weeklyCategories: GiftCategory[] = Object.entries(giftsByWeek)
        .sort((a, b) => b[1].weekStart.getTime() - a[1].weekStart.getTime())
        .map(([weekKey, weekData]) => {
          const sortedGifts = [...weekData.gifts].sort((a, b) => {
            const [monthA, dayA, yearA] = a.date.split("/").map(Number);
            const [monthB, dayB, yearB] = b.date.split("/").map(Number);
            const dateA = new Date(yearA, monthA - 1, dayA);
            const dateB = new Date(yearB, monthB - 1, dayB);
            return dateB.getTime() - dateA.getTime();
          });
    
          return {
            id: weekKey,
            label: weekData.weekLabel, // one date range per shelf
            icon: "gift",              // icon not rendered for recency anyway
            gifts: sortedGifts,
          };
        });
    
      return weeklyCategories;
    }
    
    const sorted = timeline.map((category) => {
      const gifts = [...category.gifts];
      return { ...category, gifts };
    });

    if (sort === "item") {
      return sorted.sort((a, b) => {
        const priorityA = ITEM_SORT_PRIORITY[a.id] ?? Number.MAX_SAFE_INTEGER;
        const priorityB = ITEM_SORT_PRIORITY[b.id] ?? Number.MAX_SAFE_INTEGER;
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        return a.label.localeCompare(b.label);
      });
    }

    return sorted;
  }, [sort, timeline]);

  const handleSortPress = () => setSortMenuVisible((prev) => !prev);

  const { width } = useWindowDimensions();
  const horizontalPadding = theme.spacing.lg * 2;
  const tabStripWidth = Math.max(0, width - horizontalPadding);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Past Gifts</Text>
          <View style={styles.sortMenuWrapper}>
            <Pressable style={styles.sortButton} onPress={handleSortPress}>
              <Text style={styles.sortLabel}>
                {getSortLabel(sort, activeTab)}
              </Text>
              <Feather
                name="chevron-down"
                size={18}
                color={theme.colors.black}
              />
            </Pressable>
            {sortMenuVisible && (
              <View style={styles.sortMenu}>
                {SORT_OPTIONS.map((option) => {
                  const isActive = sort === option;
                  const activeColor = activeTab === "received" ? theme.colors.waynBlue : theme.colors.waynOrange;
                  const activeBgColor = activeTab === "received" ? theme.colors.waynBlueLight : "#FFE7E2";
                  return (
                    <Pressable
                      key={option}
                      style={[
                        styles.sortMenuItem,
                        isActive && { backgroundColor: activeBgColor },
                      ]}
                      onPress={() => {
                        setSort(option);
                        setSortMenuVisible(false);
                      }}
                    >
                          <Text
                            style={[
                              styles.sortMenuItemText,
                              isActive ? { color: activeColor } : undefined,
                            ]}
                          >
                            {getSortLabel(option, activeTab)}
                          </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        <View style={[styles.tabsRow, { width: tabStripWidth }]}>
          {TAB_OPTIONS.map((tab) => {
            const selected = tab.id === activeTab;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[
                  styles.tabOptionContainer,
                  { width: tabStripWidth / TAB_OPTIONS.length },
                ]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: selected ? theme.colors.black : "#9CA3AF",
                      fontWeight: selected
                        ? theme.typography.weights.semibold
                        : theme.typography.weights.regular,
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.tabTrack, { width: tabStripWidth }]}>
          <View style={styles.tabTrackBackground} />
          <View
            style={[
              styles.tabTrackActive,
              {
                left:
                  activeTab === "received"
                    ? 0
                    : tabStripWidth / TAB_OPTIONS.length,
                width: tabStripWidth / TAB_OPTIONS.length,
                backgroundColor: activeTab === "received" ? theme.colors.waynBlue : theme.colors.waynOrange,
              },
            ]}
          />
        </View>

        {loading && (
          <View style={{ padding: theme.spacing.xl, alignItems: "center" }}>
            <Text style={{ color: theme.colors.textSecondary }}>
              Loading gifts...
            </Text>
          </View>
        )}

        {!loading && sortedTimeline.length === 0 && activeTab === "sent" && (
          <View style={{ padding: theme.spacing.xl, alignItems: "center" }}>
            <Text style={{ color: theme.colors.textSecondary }}>
              No sent gifts yet. Send a gift to see it here!
            </Text>
          </View>
        )}

        {!loading &&
          sortedTimeline.length === 0 &&
          activeTab === "received" && (
            <View style={{ padding: theme.spacing.xl, alignItems: "center" }}>
              <Text style={{ color: theme.colors.textSecondary }}>
                No received gifts yet. Gifts sent to you will appear here!
              </Text>
            </View>
          )}

        {sortedTimeline.map((category) => {
          const baseWidth =
            category.gifts.length * (CARD_WIDTH + theme.spacing.xl);
          const shelfWidth = Math.max(496, baseWidth + theme.spacing.lg * 2);
          const chipLabel =
            sort === "sender" && category.gifts[0]?.name
              ? category.gifts[0].name
              : category.label;

          return (
            <View key={category.id} style={styles.categorySection}>
              <View style={styles.chipRow}>
                <View style={styles.chip}>
                  <Text style={styles.chipText}>{chipLabel}</Text>
                  {sort !== "sender" && sort !== "recency" && (
                    <Feather
                      name={category.icon}
                      size={16}
                      color={theme.colors.black}
                    />
                  )}
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                <View
                  style={[
                    styles.shelfRow,
                    { width: shelfWidth + theme.spacing.lg },
                  ]}
                >
                  <View
                    style={[
                      styles.shelfGraphic,
                      {
                        width: shelfWidth,
                        left: 0,
                      },
                    ]}
                  >
                    <PinkPlank width={shelfWidth} isReceived={activeTab === "received"} />
                  </View>
                  <View style={[styles.cardsRow, { width: shelfWidth }]}>
                  {category.gifts.map((gift) => (
                    <View key={gift.id} style={styles.cardContainer}>
                      <GiftCard
                        gift={gift}
                        variant={getVariantForCategory(category.id)}
                        isReceived={activeTab === "received"}
                      />
                    </View>
                  ))}
                  </View>
                </View>
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing.lg,
  },
  title: {
    fontSize: theme.text.headline1.fontSize,
    fontWeight: theme.text.headline1.fontWeight,
    fontFamily: theme.text.headline1.fontFamily,
    color: theme.text.headline1.color,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.black,
    borderRadius: theme.borderRadius.round,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  sortLabel: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: theme.typography.weights.semibold,
    marginRight: 2,
  },
  sortMenu: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    paddingVertical: 0,
    overflow: "hidden",
    width: SORT_MENU_WIDTH,
    left: "50%",
    transform: [{ translateX: -SORT_MENU_WIDTH / 2 }],
    zIndex: 10,
  },
  sortMenuItem: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  sortMenuItemText: {
    fontSize: 16,
    color: "#091420",
  },
  sortMenuWrapper: {
    position: "relative",
    alignItems: "center",
  },
  tabsRow: {
    flexDirection: "row",
    marginTop: theme.spacing.md,
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  tabOptionContainer: {
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 16,
    marginBottom: theme.spacing.xs,
    lineHeight: 22,
    fontFamily: theme.text.headline4.fontFamily,
    fontWeight: theme.text.headline4.fontWeight,
  },
  tabTrack: {
    marginTop: theme.spacing.xs,
    height: TRACK_HEIGHT,
    position: "relative",
  },
  tabTrackBackground: {
    position: "absolute",
    width: "100%",
    height: TRACK_HEIGHT,
    borderRadius: 999,
    backgroundColor: "#D1D5DB",
  },
  tabTrackActive: {
    position: "absolute",
    top: 0,
    height: TRACK_HEIGHT,
    borderRadius: 999,
  },
  categorySection: {
    marginTop: theme.spacing.md,
  },
  chipRow: {
    flexDirection: "row",
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 2,
    borderColor: theme.colors.black,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  chipText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: theme.typography.weights.semibold,
    marginRight: theme.spacing.sm,
  },
  scrollContent: {
    paddingTop: theme.spacing.lg,
    paddingBottom: 0,
    paddingLeft: theme.spacing.sm,
  },
  shelfRow: {
    height: 220,
    position: "relative",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  cardsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    position: "absolute",
    bottom: 0,
    left: theme.spacing.sm,
    paddingLeft: 0,
    zIndex: 1,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: 200,
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
  },
  giftCardWrapper: {
    position: "absolute",
    bottom: 60,
    width: 150,
    height: 175,
    alignItems: "center",
    justifyContent: "center",
  },
  giftBoxSvg: {
    position: "absolute",
    top: 0,
  },
  giftInfo: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: theme.colors.white,
    marginBottom: theme.spacing.sm,
  },
  giftName: {
    fontSize: 16,
    fontWeight: theme.typography.weights.semibold,
    fontFamily: theme.text.body1Bold.fontFamily,
    lineHeight: 20,
    color: theme.colors.textPrimary,
  },
  giftDate: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
  tagIcon: {
    position: "absolute",
    right: 16,
    top: 50,

    transform: [{ rotate: "20deg" }],
  },
  shelfGraphic: {
    position: "absolute",
    bottom: 0,
    left: 0,
    zIndex: 0,
  },
});
