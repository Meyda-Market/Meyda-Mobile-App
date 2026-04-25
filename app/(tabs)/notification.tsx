// ==========================================================
// 🚀 ምዕራፍ 1: መእተዊ (Imports)
// ==========================================================
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useContext, useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";

const API_BASE_URL = "https://meyda-app.onrender.com";

export default function NotificationScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);

  // ==========================================================
  // 🚀 ምዕራፍ 2: መኽዘን ኩነታት (State Management)
  // ==========================================================
  const [allNotifications, setAllNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [currentFilter, setCurrentFilter] = useState("all");
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  // ==========================================================
  // 🚀 ምዕራፍ 3: ህያው ማጂክ (Fetch Dynamic Data)
  // ==========================================================
  // 💡 ማጂክ: ፔጅ ምስ ተኸፍተት ኩሉግዜ ሓዱሽ ዳታ ተምጽእ
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [user]),
  );

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const myId = user._id || user.id;

      // 1️⃣ ካብ Message ዳታቤዝ (ላይክ: ኮሜንት: ሜሰጅ) ንስሕብ
      const msgRes = await fetch(`${API_BASE_URL}/api/messages/${myId}`);
      let notifsData = [];
      if (msgRes.ok) {
        notifsData = await msgRes.json();
      }

      // 2️⃣ ካብ News ዳታቤዝ (ወግዓውያን ሓበሬታታት) ንስሕብ
      const newsRes = await fetch(`${API_BASE_URL}/api/news`);
      if (newsRes.ok) {
        const allNews = await newsRes.json();
        const officialNews = allNews.filter(
          (n: any) => n.category === "ወግዓዊ" || n.isPinned,
        );

        // ንዜናታት ናብ ፎርማት ናይ ኖቲፊኬሽን ንቕይሮም
        const newsNotifs = officialNews.map((n: any) => ({
          _id: n._id,
          id: n._id,
          type: "system",
          isRead: true, // ዜና ኩሉግዜ ዝተነበበ ኮይኑ እዩ ዝመጽእ
          senderId: "admin",
          senderName: "Meyda",
          text: n.title || "ሓዱሽ ሓበሬታ ካብ Meyda",
          createdAt: n.createdAt,
          productId: null,
          isNewsItem: true, // 💡 ማጂክ: ናብ ዜና ፔጅ ምእንቲ ክንመርሖ
        }));
        notifsData = [...notifsData, ...newsNotifs];
      }

      // 3️⃣ ብግዜኦም (Date) ንሰርዓዮም (ሓደስቲ ኣብ ላዕሊ)
      notifsData.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setAllNotifications(notifsData);
    } catch (error) {
      console.log("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
  }, [user]);

  // ==========================================================
  // 🚀 ምዕራፍ 4: Smart Time Grouping & Filtering
  // ==========================================================
  const getGroupedNotifications = () => {
    let filtered = allNotifications;
    if (currentFilter === "unread")
      filtered = allNotifications.filter((n) => !n.isRead);
    else if (currentFilter === "message")
      filtered = allNotifications.filter((n) => n.type === "message");

    const today: any[] = [];
    const yesterday: any[] = [];
    const thisWeek: any[] = [];
    const older: any[] = [];

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    const yesterdayStart = todayStart - 86400000;
    const thisWeekStart = todayStart - 86400000 * 7;

    filtered.forEach((n) => {
      const nTime = new Date(n.createdAt).getTime();
      if (nTime >= todayStart) today.push(n);
      else if (nTime >= yesterdayStart) yesterday.push(n);
      else if (nTime >= thisWeekStart) thisWeek.push(n);
      else older.push(n);
    });

    const sections = [];
    if (today.length) sections.push({ title: "ሎሚ (Today)", data: today });
    if (yesterday.length)
      sections.push({ title: "ትማሊ (Yesterday)", data: yesterday });
    if (thisWeek.length)
      sections.push({ title: "ኣብዚ ሰሙን (This Week)", data: thisWeek });
    if (older.length) sections.push({ title: "ዝጸንሑ (Older)", data: older });

    return sections;
  };

  const groupedData = getGroupedNotifications();

  // ==========================================================
  // 🚀 ምዕራፍ 5: ተግባራት (Actions: Read & Deep Link)
  // ==========================================================
  const markAllAsRead = async () => {
    if (!user) return;
    const myId = user._id || user.id;
    const updated = allNotifications.map((n) => ({ ...n, isRead: true }));
    setAllNotifications(updated);
    try {
      await fetch(`${API_BASE_URL}/api/messages/user/${myId}/readAll`, {
        method: "PUT",
      });
    } catch (e) {
      console.log("Error marking all read", e);
    }
  };

  const handleNotificationClick = async (notif: any) => {
    // 1️⃣ ጌና ዘይተነበበ እንተኾይኑ፡ ንሰርቨር ነግሪኻ ነታ ቀይሕ ባጅ ኣጥፍኣያ
    if (!notif.isRead && !notif.isNewsItem) {
      const updated = allNotifications.map((n) =>
        (n._id || n.id) === (notif._id || notif.id)
          ? { ...n, isRead: true }
          : n,
      );
      setAllNotifications(updated);
      try {
        await fetch(
          `${API_BASE_URL}/api/messages/${notif._id || notif.id}/read`,
          {
            method: "PUT",
          },
        );
      } catch (e) {
        console.log("Error marking read", e);
      }
    }

    // 2️⃣ ናብቲ ትኽክለኛ ፔጅ ውሰዶ
    if (notif.isNewsItem) {
      router.push("/(tabs)/news" as any); // Meyda Update ናብ ዜና
    } else if (notif.type === "message") {
      router.push(`/chat/${notif.senderId}` as any); // ሜሰጅ ናብ ቻት
    } else if (notif.type === "like" || notif.type === "comment") {
      if (notif.productId)
        router.push(`/product/${notif.productId}` as any); // ላይክ/ኮሜንት ናብ ዕዳጋ
      else router.push(`/(tabs)/news` as any); // እንተዘየለ ናብ ዜና
    } else {
      router.push(`/(tabs)/home` as any);
    }
  };

  // ==========================================================
  // 🚀 ምዕራፍ 6: ዲዛይን (Render UI)
  // ==========================================================
  const renderHeader = () => (
    <View
      style={[
        styles.headerWrapper,
        {
          backgroundColor: isDarkMode ? "#1E1E1E" : "#fff",
          shadowOpacity: isDarkMode ? 0.3 : 0.05,
        },
      ]}
    >
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <Text
            style={[
              styles.headerTitle,
              { color: isDarkMode ? "#FFF" : "#1a1a1a" },
            ]}
          >
            ኖቲፊኬሽን
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[
              styles.markReadBtn,
              {
                backgroundColor: isDarkMode
                  ? "rgba(2, 158, 255, 0.15)"
                  : "rgba(2, 158, 255, 0.1)",
              },
            ]}
            onPress={markAllAsRead}
          >
            <Ionicons name="checkmark-done" size={18} color="#029eff" />
            <Text style={styles.markReadText}> ኩሉ ኣንብብ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsSoundEnabled(!isSoundEnabled)}
            style={{ marginLeft: 15 }}
          >
            <Ionicons
              name={isSoundEnabled ? "volume-medium" : "volume-mute"}
              size={22}
              color={isSoundEnabled ? "#029eff" : isDarkMode ? "#666" : "#ccc"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        {["all", "unread", "message"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, currentFilter === tab && styles.tabActive]}
            onPress={() => setCurrentFilter(tab)}
          >
            <Text
              style={[
                styles.tabText,
                { color: isDarkMode ? "#AAA" : "#888" },
                currentFilter === tab && styles.tabTextActive,
              ]}
            >
              {tab === "all"
                ? "ኩሉ (All)"
                : tab === "unread"
                  ? "ዘይተነበበ"
                  : "መልእኽቲ"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const getIconConfig = (type: string, text: string = "") => {
    // 💡 ማጂክ: ን "Meyda" Update ፍሉይ ምልክት (Megaphone) የርኢ
    if (type === "system" && text.includes("Meyda")) {
      return {
        name: "megaphone",
        color: "#f39c12",
        bg: "rgba(243, 156, 18, 0.15)",
      };
    }
    switch (type) {
      case "message":
        return {
          name: "chatbubble-ellipses",
          color: "#3498db",
          bg: "rgba(52, 152, 219, 0.15)",
        };
      case "like":
        return {
          name: "heart",
          color: "#e74c3c",
          bg: "rgba(231, 76, 60, 0.15)",
        };
      case "comment":
        return {
          name: "chatbox-ellipses",
          color: "#2ecc71",
          bg: "rgba(46, 204, 113, 0.15)",
        };
      case "system":
        return {
          name: "notifications",
          color: "#f1c40f",
          bg: "rgba(241, 196, 15, 0.15)",
        };
      default:
        return {
          name: "notifications",
          color: "#95a5a6",
          bg: "rgba(149, 165, 166, 0.15)",
        };
    }
  };

  const renderNotificationItem = ({ item }: any) => {
    const iconConfig = getIconConfig(item.type, item.senderName);
    const dateObj = new Date(item.createdAt);
    const timeString = dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <TouchableOpacity
        style={[
          styles.notifItem,
          { backgroundColor: isDarkMode ? "#1E1E1E" : "#fff" },
          !item.isRead && [
            styles.notifItemUnread,
            {
              backgroundColor: isDarkMode
                ? "rgba(2, 158, 255, 0.1)"
                : "#eef7fd",
              borderColor: isDarkMode ? "#029eff" : "rgba(2, 158, 255, 0.2)",
            },
          ],
        ]}
        activeOpacity={0.7}
        onPress={() => handleNotificationClick(item)}
      >
        <View style={styles.iconContainer}>
          <View
            style={[styles.iconWrapper, { backgroundColor: iconConfig.bg }]}
          >
            <Ionicons
              name={iconConfig.name as any}
              size={20}
              color={iconConfig.color}
            />
          </View>
          {!item.isRead && (
            <View
              style={[
                styles.unreadBadge,
                { borderColor: isDarkMode ? "#1E1E1E" : "#eef7fd" },
              ]}
            />
          )}
        </View>

        <View style={styles.notifContent}>
          <Text
            style={[styles.notifText, { color: isDarkMode ? "#CCC" : "#444" }]}
          >
            <Text
              style={[
                styles.senderName,
                { color: isDarkMode ? "#FFF" : "#111" },
              ]}
            >
              {item.senderName}{" "}
            </Text>
            {item.text}
          </Text>
          <Text
            style={[
              styles.notifTime,
              { color: isDarkMode ? "#888" : "#999" },
              !item.isRead && styles.notifTimeNew,
            ]}
          >
            {timeString}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section: { title } }: any) => (
    <View style={styles.sectionHeader}>
      <Text
        style={[
          styles.sectionTitle,
          { color: isDarkMode ? "#888" : "#95a5a6" },
        ]}
      >
        {title}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#121212" : "#f9fbfd" },
      ]}
    >
      {renderHeader()}
      {loading ? (
        <View
          style={[
            styles.container,
            { backgroundColor: isDarkMode ? "#121212" : "#f9fbfd" },
          ]}
        >
          {/* Skeleton Loaders */}
          <View
            style={[
              styles.notifItem,
              {
                height: 80,
                backgroundColor: isDarkMode ? "#333" : "#e1e4e8",
                opacity: 0.5,
                marginVertical: 10,
              },
            ]}
          />
          <View
            style={[
              styles.notifItem,
              {
                height: 80,
                backgroundColor: isDarkMode ? "#333" : "#e1e4e8",
                opacity: 0.5,
                marginVertical: 10,
              },
            ]}
          />
        </View>
      ) : (
        <SectionList
          sections={groupedData}
          keyExtractor={(item) => item._id || item.id}
          renderItem={renderNotificationItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#029eff"]}
              tintColor={isDarkMode ? "#029eff" : undefined}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <View
                style={[
                  styles.emptyIconBg,
                  { backgroundColor: isDarkMode ? "#1E1E1E" : "#f0f2f5" },
                ]}
              >
                <Ionicons
                  name="notifications-off-outline"
                  size={50}
                  color={isDarkMode ? "#555" : "#ccc"}
                />
              </View>
              <Text
                style={[
                  styles.emptyTextTitle,
                  { color: isDarkMode ? "#FFF" : "#333" },
                ]}
              >
                ዛጊት ኖቲፊኬሽን የለን
              </Text>
              <Text
                style={[
                  styles.emptyTextSub,
                  { color: isDarkMode ? "#AAA" : "#888" },
                ]}
              >
                ሓዱሽ ሓበሬታ ምስ ዝህሉ ኣብዚ ክመጸኩም እዩ።
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

// ==========================================================
// 🚀 ምዕራፍ 7: ዲዛይን (Styles)
// ==========================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fbfd" },

  headerWrapper: {
    backgroundColor: "#fff",
    zIndex: 100,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 4,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: 24, fontWeight: "900", color: "#1a1a1a" },

  headerActions: { flexDirection: "row", alignItems: "center" },
  markReadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(2, 158, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  markReadText: {
    color: "#029eff",
    fontSize: 13,
    fontWeight: "bold",
    marginLeft: 4,
  },

  tabsContainer: { flexDirection: "row", paddingHorizontal: 10 },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 3,
    borderColor: "transparent",
    marginRight: 10,
  },
  tabActive: { borderColor: "#029eff" },
  tabText: { fontSize: 15, fontWeight: "600", color: "#888" },
  tabTextActive: { color: "#029eff", fontWeight: "bold" },

  sectionHeader: { paddingHorizontal: 15, paddingTop: 20, paddingBottom: 5 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#95a5a6",
    textTransform: "uppercase",
  },

  notifItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 16,
    marginHorizontal: 15,
    marginTop: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  notifItemUnread: {
    backgroundColor: "#eef7fd",
    borderWidth: 1,
    borderColor: "rgba(2, 158, 255, 0.2)",
  },

  iconContainer: { position: "relative", marginRight: 15 },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#029eff",
    borderWidth: 2,
    borderColor: "#eef7fd",
  },

  notifContent: { flex: 1, justifyContent: "center", minHeight: 48 },
  notifText: { fontSize: 14, color: "#444", lineHeight: 22 },
  senderName: { fontWeight: "bold", color: "#111" },

  notifTime: { fontSize: 12, color: "#999", marginTop: 4 },
  notifTimeNew: { color: "#029eff", fontWeight: "bold" },

  emptyState: { alignItems: "center", padding: 40, marginTop: 50 },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0f2f5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTextTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptyTextSub: { fontSize: 14, color: "#888", textAlign: "center" },
});
