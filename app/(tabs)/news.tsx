// ==========================================================
// 🚀 ምዕራፍ 1: መእተዊ (Imports)
// ==========================================================
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext"; // 💡 ሓዱሽ: ዳርክ ሞድ ሓንጎል መጸውዒ

const API_BASE_URL = "https://meyda-app.onrender.com";

export default function NewsScreen() {
  const router = useRouter();

  // ==========================================================
  // 🚀 ምዕራፍ 2: መኽዘን ኩነታት (State Management)
  // ==========================================================
  const { user } = useContext(AuthContext);
  // 💡 ማጂክ: ዳርክ ሞድ ሓንጎል ንጽውዕ
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const isGodMode = user && (user.role === "admin" || user.role === "owner");

  const [allNews, setAllNews] = useState<any[]>([]);
  const [filteredNews, setFilteredNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentFilter, setCurrentFilter] = useState("all");

  const [allowPublicPosting, setAllowPublicPosting] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<
    string | null
  >(null);

  const [postCategory, setPostCategory] = useState("Announcement");
  const [postTitle, setPostTitle] = useState("");
  const [postDesc, setPostDesc] = useState("");
  const [postMediaUri, setPostMediaUri] = useState<string | null>(null);
  const [postIsPinned, setPostIsPinned] = useState(false);

  const [commentInput, setCommentInput] = useState("");

  // ==========================================================
  // 🚀 ምዕራፍ 3: መበገሲ ማጂክ (Fetch Real API & Settings)
  // ==========================================================
  useEffect(() => {
    fetchNewsAndSettings();
  }, []);

  const fetchNewsAndSettings = async () => {
    try {
      const settingsRes = await fetch(`${API_BASE_URL}/api/admin/stats`);
      if (settingsRes.ok) {
        const statsData = await settingsRes.json();
        setAllowPublicPosting(statsData.allowPublicPosting || false);
      }

      const newsRes = await fetch(`${API_BASE_URL}/api/news`);
      if (newsRes.ok) {
        const newsData = await newsRes.json();
        const sortedNews = newsData.sort((a: any, b: any) => {
          if (a.isPinned === b.isPinned)
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          return a.isPinned ? -1 : 1;
        });
        setAllNews(sortedNews);
        setFilteredNews(sortedNews);
      }
    } catch (error) {
      console.log("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNewsAndSettings();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (currentFilter === "all") setFilteredNews(allNews);
    else setFilteredNews(allNews.filter((n) => n.category === currentFilter));
  }, [currentFilter, allNews]);

  const getImageUrl = (imgStr: string | null) => {
    if (!imgStr) return "https://via.placeholder.com/150";
    if (imgStr.startsWith("http")) return imgStr;
    return `${API_BASE_URL}${imgStr.startsWith("/") ? "" : "/"}${imgStr}`;
  };

  // ==========================================================
  // 🚀 ምዕራፍ 4: ፋንክሽናት ናይ ኣክሽን (Action Functions)
  // ==========================================================
  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setPostMediaUri(result.assets[0].uri);
  };

  const submitPost = async () => {
    if (!postDesc.trim()) {
      Alert.alert("ጌጋ", "በጃኹም መግለጺ (Caption) ጽሓፉ!");
      return;
    }
    if (!user) return Alert.alert("መዘኻኸሪ", "መጀመርታ ሎግ-ኢን ግበሩ!");

    try {
      const token = await AsyncStorage.getItem("meydaToken");
      const formData = new FormData();
      formData.append("authorId", user._id || user.id);
      formData.append("authorName", user.name || "User");
      formData.append("authorPic", user.profilePic || "");
      formData.append("category", postCategory);
      formData.append("title", postTitle);
      formData.append("description", postDesc);
      formData.append("isPinned", String(postIsPinned));

      if (postMediaUri) {
        const filename = postMediaUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename || "");
        const type = match ? `image/${match[1]}` : `image`;
        formData.append("media", {
          uri: postMediaUri,
          name: filename,
          type,
        } as any);
      }

      const res = await fetch(`${API_BASE_URL}/api/news`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        Alert.alert("ዕዉት", "ዜናኹም ብዓወት ተለጢፉ ኣሎ!");
        setShowCreateModal(false);
        setPostTitle("");
        setPostDesc("");
        setPostMediaUri(null);
        setPostIsPinned(false);
        fetchNewsAndSettings();
      } else {
        Alert.alert("ጌጋ", "ፖስት ምግባር ኣይተኻእለን።");
      }
    } catch (error) {
      console.log("Post Error:", error);
    }
  };

  const toggleLike = async (newsId: string) => {
    if (!user) return Alert.alert("መዘኻኸሪ", "መጀመርታ ሎግ-ኢን ግበሩ!");
    const myId = user._id || user.id;

    setAllNews((prev) =>
      prev.map((n) => {
        if (n._id === newsId) {
          const hasLiked = n.likes?.includes(myId);
          return {
            ...n,
            likes: hasLiked
              ? n.likes.filter((id: string) => id !== myId)
              : [...(n.likes || []), myId],
          };
        }
        return n;
      }),
    );

    try {
      const token = await AsyncStorage.getItem("meydaToken");
      await fetch(`${API_BASE_URL}/api/news/${newsId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: myId }),
      });
    } catch (error) {
      console.log(error);
    }
  };

  const submitComment = async (newsId: string) => {
    if (!commentInput.trim() || !user) return;
    try {
      const token = await AsyncStorage.getItem("meydaToken");
      const res = await fetch(`${API_BASE_URL}/api/news/${newsId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user._id || user.id,
          userName: user.name,
          userPic: user.profilePic,
          text: commentInput,
        }),
      });
      if (res.ok) {
        setCommentInput("");
        fetchNewsAndSettings();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deleteNews = async (newsId: string) => {
    Alert.alert("መጠንቀቕታ", "ነዚ ፖስት ብርግጽ ክትድምስሶ ትደሊ ዲኻ?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "ደምስስ (Delete)",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("meydaToken");
            const res = await fetch(`${API_BASE_URL}/api/news/${newsId}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              setAllNews((prev) => prev.filter((n) => n._id !== newsId));
            }
          } catch (e) {}
        },
      },
    ]);
  };

  // ==========================================================
  // 🚀 ምዕራፍ 5: ዲዛይን ላዕለዋይ ክፋል (Header & Tabs)
  // ==========================================================
  const renderHeader = () => {
    const canPost = isGodMode || allowPublicPosting;

    return (
      <View
        style={[
          styles.headerSection,
          { backgroundColor: isDarkMode ? "#121212" : "#fff" },
        ]}
      >
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>
            <Ionicons name="globe-outline" size={20} /> ዜናን ሓበሬታን
          </Text>
          <View style={styles.headerActions}>
            {canPost && (
              <TouchableOpacity
                style={styles.createBtn}
                onPress={() => setShowCreateModal(true)}
              >
                <FontAwesome5 name="pen" size={12} color="#fff" />
                <Text style={styles.createBtnText}> ሓዱሽ ፖስት</Text>
              </TouchableOpacity>
            )}
            {/* 💡 ማጂክ: ወርሒ መጥወቒት ናብ ዳርክ ሞድ ዝሰምዕ ጌርናያ ኣለና */}
            <TouchableOpacity
              style={[
                styles.themeToggle,
                {
                  backgroundColor: isDarkMode
                    ? "#333"
                    : "rgba(0, 150, 199, 0.1)",
                },
              ]}
              onPress={toggleTheme}
            >
              <Ionicons
                name={isDarkMode ? "sunny" : "moon"}
                size={20}
                color={isDarkMode ? "#FFD700" : "#029eff"}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {["all", "Economy", "Tech", "Announcement"].map((tab, idx) => {
              const tabNames: any = {
                all: "ኩሉ (All)",
                Economy: "ኢኮኖሚ",
                Tech: "ቴክኖሎጂ",
                Announcement: "ወግዓዊ",
              };
              const isActive = currentFilter === tab;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                  onPress={() => setCurrentFilter(tab)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      isActive && styles.tabTextActive,
                      // 💡 ጽሑፍ ናይ ዘይተጠውቁ ኣብ ጸልማት ናብ ጻዕዳ ይቕየር
                      !isActive && {
                        color: isDarkMode ? "#AAAAAA" : "#65676b",
                      },
                    ]}
                  >
                    {tabNames[tab]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    );
  };

  // ==========================================================
  // 🚀 ምዕራፍ 6: ዲዛይን ናይ ሓንቲ ዜና (News Card UI)
  // ==========================================================
  const renderNewsItem = ({ item }: any) => {
    const myId = user?._id || user?.id;
    const isLikedByMe = myId && item.likes?.includes(myId);
    const dateObj = new Date(item.createdAt);
    const timeString =
      dateObj.toLocaleDateString() +
      " " +
      dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const showComments = activeCommentsPostId === item._id;

    return (
      <View
        style={[
          styles.newsCard,
          { backgroundColor: isDarkMode ? "#1E1E1E" : "#fff" },
        ]}
      >
        {item.isPinned && (
          <View style={styles.pinBadge}>
            <Ionicons name="pin" size={12} color="#fff" />
            <Text style={styles.pinText}> Pinned</Text>
          </View>
        )}

        <View style={styles.newsHeader}>
          <TouchableOpacity
            onPress={() => router.push(`/profile/${item.authorId}` as any)}
          >
            <Image
              source={{ uri: getImageUrl(item.authorPic) }}
              style={styles.authorPic}
            />
          </TouchableOpacity>
          <View style={styles.authorInfo}>
            <TouchableOpacity
              onPress={() => router.push(`/profile/${item.authorId}` as any)}
            >
              <Text
                style={[
                  styles.authorName,
                  { color: isDarkMode ? "#FFFFFF" : "#333" },
                ]}
              >
                {item.authorName}
              </Text>
            </TouchableOpacity>
            <Text
              style={[
                styles.postTime,
                { color: isDarkMode ? "#AAAAAA" : "#65676b" },
              ]}
            >
              {timeString} •{" "}
              <Ionicons
                name="globe-outline"
                size={10}
                color={isDarkMode ? "#AAAAAA" : "#65676b"}
              />
            </Text>
          </View>
          {(isGodMode || myId === item.authorId) && (
            <TouchableOpacity
              style={styles.optionsBtn}
              onPress={() => deleteNews(item._id)}
            >
              <Ionicons name="trash-outline" size={20} color="#ff4757" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.newsContent}>
          <View style={styles.newsTag}>
            <Text style={styles.newsTagText}>{item.category || "ሓበሬታ"}</Text>
          </View>
          {item.title ? (
            <Text
              style={[
                styles.newsTitle,
                { color: isDarkMode ? "#FFFFFF" : "#333" },
              ]}
            >
              {item.title}
            </Text>
          ) : null}
          <Text
            style={[
              styles.newsDesc,
              { color: isDarkMode ? "#CCCCCC" : "#333" },
            ]}
          >
            {item.description}
          </Text>
        </View>

        {item.mediaUrl && (
          <View
            style={[
              styles.newsMedia,
              { backgroundColor: isDarkMode ? "#2A2A2A" : "#fafafa" },
            ]}
          >
            <Image
              source={{ uri: getImageUrl(item.mediaUrl) }}
              style={styles.mediaImage}
            />
          </View>
        )}

        <View
          style={[
            styles.newsStats,
            { borderColor: isDarkMode ? "#333" : "#eee" },
          ]}
        >
          <Text
            style={[
              styles.statsText,
              { color: isDarkMode ? "#AAAAAA" : "#65676b" },
            ]}
          >
            {item.likes?.length || 0} Likes
          </Text>
          <Text
            style={[
              styles.statsText,
              { color: isDarkMode ? "#AAAAAA" : "#65676b" },
            ]}
          >
            {item.comments?.length || 0} Comments
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => toggleLike(item._id)}
          >
            <Ionicons
              name={isLikedByMe ? "thumbs-up" : "thumbs-up-outline"}
              size={20}
              color={isLikedByMe ? "#029eff" : isDarkMode ? "#AAAAAA" : "#777"}
            />
            <Text
              style={[
                styles.actionBtnText,
                { color: isDarkMode ? "#AAAAAA" : "#65676b" },
                isLikedByMe && { color: "#029eff" },
              ]}
            >
              {" "}
              ላይክ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              setActiveCommentsPostId(showComments ? null : item._id)
            }
          >
            <Ionicons
              name="chatbubble-outline"
              size={20}
              color={isDarkMode ? "#AAAAAA" : "#777"}
            />
            <Text
              style={[
                styles.actionBtnText,
                { color: isDarkMode ? "#AAAAAA" : "#65676b" },
              ]}
            >
              {" "}
              ርእይቶ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => Alert.alert("Share", "ናብ ማሕበራዊ ሚድያ ሼር ይግበር ኣሎ...")}
          >
            <Ionicons
              name="share-social-outline"
              size={20}
              color={isDarkMode ? "#AAAAAA" : "#777"}
            />
            <Text
              style={[
                styles.actionBtnText,
                { color: isDarkMode ? "#AAAAAA" : "#65676b" },
              ]}
            >
              {" "}
              ሼር
            </Text>
          </TouchableOpacity>
        </View>

        {/* 💡 ማጂክ: ዳርክ ሞድ ንናይ ኮመንት ሳጹናት */}
        {showComments && (
          <View
            style={[
              styles.commentsSection,
              { backgroundColor: isDarkMode ? "#121212" : "#fafafa" },
            ]}
          >
            <View style={styles.commentInputArea}>
              <TextInput
                style={[
                  styles.commentInput,
                  {
                    backgroundColor: isDarkMode ? "#2A2A2A" : "#fff",
                    borderColor: isDarkMode ? "#333" : "#ddd",
                    color: isDarkMode ? "#FFF" : "#000",
                  },
                ]}
                placeholder="ርእይቶኹም ጽሓፉ..."
                placeholderTextColor={isDarkMode ? "#888" : "#999"}
                value={commentInput}
                onChangeText={setCommentInput}
              />
              <TouchableOpacity
                style={styles.commentSendBtn}
                onPress={() => submitComment(item._id)}
              >
                <Ionicons name="send" size={20} color="#029eff" />
              </TouchableOpacity>
            </View>

            {item.comments?.map((c: any, idx: number) => (
              <View key={idx} style={styles.commentItem}>
                <Image
                  source={{ uri: getImageUrl(c.userPic) }}
                  style={styles.commentAvatar}
                />
                <View
                  style={[
                    styles.commentBubble,
                    {
                      backgroundColor: isDarkMode ? "#2A2A2A" : "#fff",
                      borderColor: isDarkMode ? "#333" : "#eee",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.commentAuthor,
                      { color: isDarkMode ? "#FFF" : "#333" },
                    ]}
                  >
                    {c.userName}
                  </Text>
                  <Text
                    style={[
                      styles.commentText,
                      { color: isDarkMode ? "#CCC" : "#555" },
                    ]}
                  >
                    {c.text}
                  </Text>
                  {(isGodMode ||
                    myId === c.userId ||
                    myId === item.authorId) && (
                    <TouchableOpacity
                      style={styles.commentDeleteBtn}
                      onPress={() => alert("Delete Comment")}
                    >
                      <Ionicons name="trash" size={14} color="#ff4757" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  // ==========================================================
  // 🚀 ምዕራፍ 7: ጠቕላላ ስክሪን (Main Render - FlatList)
  // ==========================================================
  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#121212" : "#f0f2f5" },
      ]}
    >
      {loading ? (
        <View
          style={[
            styles.container,
            { backgroundColor: isDarkMode ? "#121212" : "#f0f2f5" },
          ]}
        >
          {renderHeader()}
          <View
            style={[
              styles.newsCard,
              {
                height: 250,
                backgroundColor: isDarkMode ? "#333" : "#e1e4e8",
                opacity: 0.5,
              },
            ]}
          />
          <View
            style={[
              styles.newsCard,
              {
                height: 200,
                backgroundColor: isDarkMode ? "#333" : "#e1e4e8",
                opacity: 0.5,
              },
            ]}
          />
        </View>
      ) : (
        <FlatList
          data={filteredNews}
          keyExtractor={(item) => item._id}
          renderItem={renderNewsItem}
          ListHeaderComponent={renderHeader}
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
            <View style={{ alignItems: "center", marginTop: 50 }}>
              <Ionicons
                name="newspaper-outline"
                size={50}
                color={isDarkMode ? "#444" : "#ccc"}
              />
              <Text
                style={{ color: isDarkMode ? "#AAA" : "#888", marginTop: 10 }}
              >
                ዛጊት ዝተለጥፈ ዜና የለን።
              </Text>
            </View>
          )}
        />
      )}

      {/* ==========================================================
      // 🚀 ምዕራፍ 8: ፖፕ-ኣፕ ናይ ሓዱሽ ፖስት (Create Post Modal)
      // ========================================================== */}
      <Modal visible={showCreateModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ width: "100%", alignItems: "center" }}
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: isDarkMode ? "#1E1E1E" : "#fff" },
              ]}
            >
              <Text
                style={[
                  styles.modalTitle,
                  { borderColor: isDarkMode ? "#333" : "#eee" },
                ]}
              >
                <FontAwesome5 name="pen" size={16} /> ሓዱሽ ዜና / ሓበሬታ
              </Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}>
                  <Text
                    style={[
                      styles.label,
                      { color: isDarkMode ? "#CCC" : "#777" },
                    ]}
                  >
                    ምድብ (Category)
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDarkMode ? "#2A2A2A" : "#fafafa",
                        borderColor: isDarkMode ? "#333" : "#eee",
                        color: isDarkMode ? "#FFF" : "#333",
                      },
                    ]}
                    value={postCategory}
                    onChangeText={setPostCategory}
                    placeholder="Announcement, Tech..."
                    placeholderTextColor={isDarkMode ? "#888" : "#999"}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text
                    style={[
                      styles.label,
                      { color: isDarkMode ? "#CCC" : "#777" },
                    ]}
                  >
                    ኣርእስቲ (Title - Optional)
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDarkMode ? "#2A2A2A" : "#fafafa",
                        borderColor: isDarkMode ? "#333" : "#eee",
                        color: isDarkMode ? "#FFF" : "#333",
                      },
                    ]}
                    placeholder="ኣርእስቲ ዜና..."
                    placeholderTextColor={isDarkMode ? "#888" : "#999"}
                    value={postTitle}
                    onChangeText={setPostTitle}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text
                    style={[
                      styles.label,
                      { color: isDarkMode ? "#CCC" : "#777" },
                    ]}
                  >
                    መግለጺ (Caption - Required)
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        height: 100,
                        textAlignVertical: "top",
                        backgroundColor: isDarkMode ? "#2A2A2A" : "#fafafa",
                        borderColor: isDarkMode ? "#333" : "#eee",
                        color: isDarkMode ? "#FFF" : "#333",
                      },
                    ]}
                    placeholder="እንታይ ሓበሬታ ክተመሓላልፉ ደሊኹም?..."
                    placeholderTextColor={isDarkMode ? "#888" : "#999"}
                    multiline
                    value={postDesc}
                    onChangeText={setPostDesc}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text
                    style={[
                      styles.label,
                      { color: isDarkMode ? "#CCC" : "#777" },
                    ]}
                  >
                    ስእሊ (Media - Optional)
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.mediaBtn,
                      {
                        backgroundColor: isDarkMode
                          ? "rgba(2, 158, 255, 0.1)"
                          : "#e6f4f1",
                      },
                    ]}
                    onPress={pickMedia}
                  >
                    <Ionicons name="image" size={20} color="#029eff" />
                    <Text
                      style={{
                        color: "#029eff",
                        fontWeight: "bold",
                        marginLeft: 10,
                      }}
                    >
                      ስእሊ ምረጽ
                    </Text>
                  </TouchableOpacity>
                  {postMediaUri && (
                    <Image
                      source={{ uri: postMediaUri }}
                      style={{
                        width: "100%",
                        height: 150,
                        borderRadius: 8,
                        marginTop: 10,
                      }}
                    />
                  )}
                </View>

                {isGodMode && (
                  <TouchableOpacity
                    style={styles.checkboxGroup}
                    onPress={() => setPostIsPinned(!postIsPinned)}
                  >
                    <Ionicons
                      name={postIsPinned ? "checkbox" : "square-outline"}
                      size={24}
                      color="#029eff"
                    />
                    <Text
                      style={[
                        styles.checkboxLabel,
                        { color: isDarkMode ? "#FFF" : "#333" },
                      ]}
                    >
                      ኣብ ላዕሊ ጠርኒፍካ ሓዞ (Pin to Top)
                    </Text>
                  </TouchableOpacity>
                )}

                <View style={styles.btnGroup}>
                  <TouchableOpacity
                    style={[
                      styles.btnCancel,
                      {
                        backgroundColor: isDarkMode ? "#2A2A2A" : "#fafafa",
                        borderColor: isDarkMode ? "#333" : "#eee",
                      },
                    ]}
                    onPress={() => setShowCreateModal(false)}
                  >
                    <Text
                      style={[
                        styles.btnCancelText,
                        { color: isDarkMode ? "#FFF" : "#333" },
                      ]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnSave} onPress={submitPost}>
                    <Text style={styles.btnSaveText}>ለጥፍ (Post)</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ==========================================================
// 🚀 ምዕራፍ 9: ዲዛይንን ሕብርታትን (Styles)
// ==========================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },

  headerSection: {
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    elevation: 3,
    zIndex: 100,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#029eff" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  createBtn: {
    backgroundColor: "#029eff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
  },
  createBtnText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  themeToggle: {
    backgroundColor: "rgba(0, 150, 199, 0.1)",
    padding: 8,
    borderRadius: 20,
  },

  tabsContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
    flexDirection: "row",
  },
  tabBtn: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 5,
    borderBottomWidth: 3,
    borderColor: "transparent",
  },
  tabBtnActive: { borderColor: "#029eff" },
  tabText: { fontSize: 15, fontWeight: "bold", color: "#65676b" },
  tabTextActive: { color: "#029eff" },

  newsCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginHorizontal: 15,
    marginTop: 15,
    elevation: 2,
    position: "relative",
    overflow: "hidden",
  },
  pinBadge: {
    position: "absolute",
    top: -10,
    right: 15,
    backgroundColor: "#ff4757",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
    elevation: 3,
  },
  pinText: { color: "#fff", fontSize: 10, fontWeight: "bold", marginLeft: 4 },

  newsHeader: { flexDirection: "row", alignItems: "center", padding: 15 },
  authorPic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#029eff",
  },
  authorInfo: { flex: 1, marginLeft: 10 },
  authorName: { fontWeight: "bold", fontSize: 15, color: "#333" },
  postTime: { fontSize: 12, color: "#65676b" },
  optionsBtn: { padding: 5 },

  newsContent: { paddingHorizontal: 15, paddingBottom: 10 },
  newsTag: {
    backgroundColor: "rgba(0, 150, 199, 0.1)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    marginBottom: 8,
  },
  newsTagText: {
    color: "#029eff",
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  newsDesc: { fontSize: 14, color: "#333", lineHeight: 20 },

  newsMedia: {
    width: "100%",
    backgroundColor: "#fafafa",
    maxHeight: 350,
    overflow: "hidden",
  },
  mediaImage: { width: "100%", height: 350, resizeMode: "cover" },

  newsStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  statsText: { fontSize: 13, color: "#65676b" },

  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#65676b",
    marginLeft: 5,
  },

  commentsSection: { padding: 15, backgroundColor: "#fafafa" },
  commentInputArea: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  commentSendBtn: { padding: 5 },
  commentItem: { flexDirection: "row", marginBottom: 12 },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
  commentBubble: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#eee",
    position: "relative",
  },
  commentAuthor: {
    fontWeight: "bold",
    fontSize: 13,
    color: "#333",
    marginBottom: 2,
  },
  commentText: { fontSize: 13, color: "#555" },
  commentDeleteBtn: { position: "absolute", top: 10, right: 10, padding: 5 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: 500,
    borderRadius: 15,
    padding: 20,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#029eff",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingBottom: 10,
  },
  formGroup: { marginBottom: 15 },
  label: { fontSize: 13, fontWeight: "bold", color: "#777", marginBottom: 5 },
  input: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#eee",
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    color: "#333",
  },
  mediaBtn: {
    backgroundColor: "#e6f4f1",
    borderWidth: 1,
    borderColor: "#029eff",
    borderStyle: "dashed",
    padding: 15,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },

  btnGroup: { flexDirection: "row", gap: 10 },
  btnCancel: {
    flex: 1,
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#eee",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  btnCancelText: { color: "#333", fontWeight: "bold" },
  btnSave: {
    flex: 1,
    backgroundColor: "#029eff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  btnSaveText: { color: "#fff", fontWeight: "bold" },
});
