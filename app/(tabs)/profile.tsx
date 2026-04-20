// ==========================================================
// 🚀 ምዕራፍ 1: መእተዊ (Imports)
// ==========================================================
import {
    Ionicons,
    MaterialCommunityIcons
} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker"; // 👈 ሓዱሽ ማጂክ: ካሜራ/ጋለሪ መኽፈቲ
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useContext, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";

const { width } = Dimensions.get("window");
const API_BASE_URL = "https://meyda-app.onrender.com";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);

  // 💡 መኽዘን ኩነታት (Modals)
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [socialLinksVisible, setSocialLinksVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false); // 👈 ሓዱሽ
  const [emailVisible, setEmailVisible] = useState(false); // 👈 ሓዱሽ

  const [activeTab, setActiveTab] = useState("ads"); // 'ads' | 'saved' | 'messages'

  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [savedProducts, setSavedProducts] = useState<any[]>([]);
  const [myChats, setMyChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 💡 ሓደስቲ ስእልታት ግዝያው መኽዘን (Local Image State)
  const [localProfilePic, setLocalProfilePic] = useState<string | null>(null);
  const [localBannerPic, setLocalBannerPic] = useState<string | null>(null);

  // 💡 ንኤዲት መግበሪ (Form States)
  const [editName, setEditName] = useState(user?.name || "");
  const [editBio, setEditBio] = useState(user?.bio || "");
  const [editFb, setEditFb] = useState("");
  const [editYt, setEditYt] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState(user?.email || "");

  // ==========================================================
  // 🚀 ምዕራፍ 2: ዳታ ካብ ሰርቨር ምጽዋዕ (Fetch API)
  // ==========================================================
  useFocusEffect(
    useCallback(() => {
      if (user) fetchMyData();
    }, [user]),
  );

  const fetchMyData = async () => {
    setLoading(true);
    try {
      const myId = user?._id || user?.id;

      // 1. ኣቕሑት ነምጽእ
      const res = await fetch(`${API_BASE_URL}/api/products`);
      const allProducts = await res.json();

      if (Array.isArray(allProducts)) {
        const mine = allProducts.filter(
          (p: any) =>
            String(p.sellerId || p.vendorId || p.userId) === String(myId),
        );
        const saved = allProducts.filter(
          (p: any) => p.savedBy && p.savedBy.includes(myId),
        );
        setMyProducts(mine.reverse());
        setSavedProducts(saved.reverse());
      }

      // 2. ሓዱሽ ማጂክ: ናይ ሓቂ መልእኽትታት ምስ ትኽክለኛ ስም
      const msgRes = await fetch(`${API_BASE_URL}/api/messages/${myId}`);
      if (msgRes.ok) {
        const allMsgs = await msgRes.json();
        const chatMap = new Map();

        allMsgs.forEach((m: any) => {
          const isMe = String(m.senderId) === String(myId);
          const partnerId = isMe ? m.receiverId : m.senderId;
          // 💡 ስም ንምርካብ ብትኽክል ይፍትን (senderName ወይ receiverName)
          const partnerName = isMe
            ? m.receiverName || "ዓሚል (Customer)"
            : m.senderName || "ሸያጢ (Seller)";

          if (
            !chatMap.has(partnerId) ||
            new Date(m.createdAt) > new Date(chatMap.get(partnerId).createdAt)
          ) {
            chatMap.set(partnerId, {
              id: partnerId,
              name:
                chatMap.has(partnerId) &&
                chatMap.get(partnerId).name !== "ዓሚል (Customer)"
                  ? chatMap.get(partnerId).name
                  : partnerName,
              text: m.text,
              time: new Date(m.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              createdAt: m.createdAt,
              unread: 0,
            });
          }
        });

        const chatList = Array.from(chatMap.values()).sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setMyChats(chatList);
      }
    } catch (error) {
      console.log("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // 🚀 ምዕራፍ 3: ሓገዝቲ ፋንክሽናት (Helpers & Actions)
  // ==========================================================
  const handleLogout = async () => {
    setSettingsVisible(false);
    await logout();
    router.replace("/(auth)/login" as any);
  };

  const handleDeleteAccount = () => {
    setSettingsVisible(false);
    Alert.alert("⚠️ ኣካውንት ምድምሳስ", "ብሓቂ ኣካውንትካ ክትድምስስ ትደሊ ዲኻ?", [
      { text: "ኣቋርጽ", style: "cancel" },
      {
        text: "ደምስስ",
        style: "destructive",
        onPress: () => console.log("Deleted"),
      },
    ]);
  };

  const handleSwitchAccount = () => {
    setSettingsVisible(false);
    Alert.alert(
      "Switch Account",
      "ናብ ካልእ ኣካውንት ንምእታው መጀመርታ ካብዚ ሎግ-ኣውት ክትገብር ኣለካ።",
      [
        { text: "ኣቋርጽ", style: "cancel" },
        {
          text: "ሎግ-ኣውት (Log out)",
          style: "destructive",
          onPress: handleLogout,
        },
      ],
    );
  };

  // 💡 ሓዱሽ ማጂክ: ጋለሪ መኽፈቲ (Image Picker)
  const pickImage = async (type: string) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === "ባነር" ? [16, 9] : [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        if (type === "ባነር") setLocalBannerPic(uri);
        else setLocalProfilePic(uri);
        Alert.alert("ዕዉት", `${type} ስእሊ ብዓወት ተቐይሩ ኣሎ! (API ኣብ ቀጻሊ ይስራሕ)`);
      }
    } catch (error) {
      Alert.alert("ጌጋ", "ስእሊ ምምራጽ ኣይተኻእለን።");
    }
  };

  const getImageUrl = (imgStr: string) => {
    if (!imgStr) return "https://via.placeholder.com/150";
    if (imgStr.startsWith("http") || imgStr.startsWith("file://"))
      return imgStr;
    return `${API_BASE_URL}${imgStr}`;
  };

  const getDisplayData = () => {
    if (activeTab === "ads") return myProducts;
    if (activeTab === "saved") return savedProducts;
    if (activeTab === "messages") return myChats;
    return [];
  };

  // ==========================================================
  // 🚀 ምዕራፍ 4: ዲዛይን ላዕለዋይ ክፋል (Profile Header)
  // ==========================================================
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 15 }}
          >
            <Ionicons name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.profileText}>Profile</Text>
        </View>
        <TouchableOpacity onPress={() => setSettingsVisible(true)}>
          <Ionicons name="settings-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.coverContainer}>
        {/* 💡 ባነር ካብ Local ወይ ዳታቤዝ */}
        <Image
          source={{
            uri:
              localBannerPic ||
              (user?.bannerPic
                ? getImageUrl(user.bannerPic)
                : "https://images.unsplash.com/photo-1579546929518-9e396f3cc809"),
          }}
          style={styles.coverImage}
        />
        <TouchableOpacity style={styles.shareBtn}>
          <Ionicons name="share-social" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.coverCameraBtn}
          onPress={() => pickImage("ባነር")}
        >
          <Ionicons name="camera" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
          {/* 💡 ፕሮፋይል ስእሊ ካብ Local ወይ ዳታቤዝ */}
          <Image
            source={{
              uri:
                localProfilePic ||
                (user?.profilePic
                  ? getImageUrl(user.profilePic)
                  : "https://via.placeholder.com/150"),
            }}
            style={styles.avatarImage}
          />
          <TouchableOpacity
            style={styles.profileCameraBtn}
            onPress={() => pickImage("ፕሮፋይል")}
          >
            <Ionicons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.countdownBtn}
          onPress={() => Alert.alert("ፓኬጅ", "14 መዓልታት ተሪፉካ ኣሎ!")}
        >
          <MaterialCommunityIcons name="timer-sand" size={16} color="#fff" />
          <Text style={styles.countdownText}>14 መዓልቲ ተሪፉ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.nameText}>{user?.name || "Meyda Store"}</Text>
        <Text style={styles.bioText}>
          {user?.bio || "እንቋዕ ብደሓን መጻእኩም ናብ ድኳነይ።"}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {user?.followers?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {user?.following?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionTabsRow}>
        <TouchableOpacity
          style={[styles.iconTab, activeTab === "ads" && styles.activeTabBg]}
          onPress={() => setActiveTab("ads")}
        >
          <Ionicons
            name="grid-outline"
            size={22}
            color={activeTab === "ads" ? "#fff" : "#029eff"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconTab, activeTab === "saved" && styles.activeTabBg]}
          onPress={() => setActiveTab("saved")}
        >
          <Ionicons
            name="heart-outline"
            size={24}
            color={activeTab === "saved" ? "#fff" : "#029eff"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.iconTab,
            activeTab === "messages" && styles.activeTabBg,
          ]}
          onPress={() => setActiveTab("messages")}
        >
          <Ionicons
            name="chatbubble-outline"
            size={22}
            color={activeTab === "messages" ? "#fff" : "#029eff"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ==========================================================
  // 🚀 ምዕራፍ 5: ዲዛይን ናይ ኣቕሑትን ሜሰጅን (Render Items)
  // ==========================================================
  const renderProduct = ({ item }: any) => (
    <TouchableOpacity
      style={styles.gridCard}
      activeOpacity={0.8}
      onPress={() => router.push(`/product/${item._id}` as any)}
    >
      {item.images && item.images.length > 0 ? (
        <Image
          source={{ uri: getImageUrl(item.images[0]) }}
          style={styles.gridImage}
        />
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: "#eee",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="image-outline" size={30} color="#ccc" />
        </View>
      )}
      <View style={styles.priceOverlay}>
        <Text style={styles.priceText}>{item.price} Br</Text>
      </View>
    </TouchableOpacity>
  );

  // 💡 ሓዱሽ ማጂክ: ናይ ሜሰጅ ኣይተም ምስ ክሊክ ናይ ፕሮፋይል ስእሊ
  const renderMessageItem = ({ item }: any) => (
    <View style={styles.chatItem}>
      {/* ናብ ፕሮፋይሉ ዝወስድ መጥወቒት (Profile Avatar Click) */}
      <TouchableOpacity
        onPress={() => router.push(`/profile/${item.id}` as any)}
      >
        <Image
          source={{ uri: item.avatar || "https://via.placeholder.com/150" }}
          style={styles.chatAvatarImage}
        />
      </TouchableOpacity>

      {/* ናብ ዕላል ዝወስድ መጥወቒት (Chat Content Click) */}
      <TouchableOpacity
        style={styles.chatInfo}
        onPress={() =>
          router.push({
            pathname: `/chat/${item.id}`,
            params: { name: item.name },
          } as any)
        }
      >
        <Text style={styles.chatName}>{item.name}</Text>
        <Text style={styles.chatText} numberOfLines={1}>
          {item.text}
        </Text>
      </TouchableOpacity>

      <View style={styles.chatMeta}>
        <Text style={styles.chatTime}>{item.time}</Text>
        {item.unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread}</Text>
          </View>
        )}
      </View>
    </View>
  );

  // ==========================================================
  // 🚀 ምዕራፍ 6: ጠቕላላ ስክሪን (Main Render)
  // ==========================================================
  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#029eff" />
        </View>
      ) : (
        <FlatList
          key={activeTab}
          data={getDisplayData()}
          keyExtractor={(item, index) =>
            item.id || item._id || index.toString()
          }
          renderItem={
            activeTab === "messages" ? renderMessageItem : renderProduct
          }
          numColumns={activeTab === "messages" ? 1 : 3}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons
                name={
                  activeTab === "ads"
                    ? "cube-outline"
                    : activeTab === "saved"
                      ? "heart-outline"
                      : "chatbubbles-outline"
                }
                size={50}
                color="#ccc"
              />
              <Text style={styles.emptyText}>ዛጊት ዳታ የለን።</Text>
            </View>
          )}
        />
      )}

      {/* 🚀 ማጂክ ሴቲንግስ (Settings Menu Modal) - ሙሉእ 7 መማረጺታት! */}
      <Modal visible={settingsVisible} transparent={true} animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSettingsVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalDragHandler} />
            <Text style={styles.modalTitle}>Settings</Text>

            <TouchableOpacity
              style={styles.modalItem}
              onPress={handleSwitchAccount}
            >
              <Ionicons name="swap-horizontal-outline" size={22} color="#333" />
              <Text style={styles.modalItemText}>Switch account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setSettingsVisible(false);
                setEditProfileVisible(true);
              }}
            >
              <Ionicons name="person-outline" size={22} color="#333" />
              <Text style={styles.modalItemText}>Edit Profile (ስምን ባዮን)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setSettingsVisible(false);
                setSocialLinksVisible(true);
              }}
            >
              <Ionicons name="link-outline" size={22} color="#333" />
              <Text style={styles.modalItemText}>Add Social Links</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setSettingsVisible(false);
                setPasswordVisible(true);
              }}
            >
              <Ionicons name="lock-closed-outline" size={22} color="#333" />
              <Text style={styles.modalItemText}>Change password</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setSettingsVisible(false);
                setEmailVisible(true);
              }}
            >
              <Ionicons name="mail-outline" size={22} color="#333" />
              <Text style={styles.modalItemText}>Change email</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalItem} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color="#333" />
              <Text style={styles.modalItemText}>Log out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalItem, { borderBottomWidth: 0 }]}
              onPress={handleDeleteAccount}
            >
              <Ionicons name="trash-outline" size={22} color="#e74c3c" />
              <Text style={[styles.modalItemText, { color: "#e74c3c" }]}>
                Delete account
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 🚀 ማጂክ ኤዲት ፕሮፋይል */}
      <Modal
        visible={editProfileVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.formContent}>
            <Text style={styles.formTitle}>Edit Profile</Text>
            <TextInput
              style={styles.inputField}
              placeholder="ስምካ ጽሓፍ"
              value={editName}
              onChangeText={setEditName}
            />
            <TextInput
              style={[styles.inputField, { height: 80 }]}
              placeholder="ባዮ ጽሓፍ (ብዛዕባ ድኳንካ)..."
              value={editBio}
              onChangeText={setEditBio}
              multiline
            />
            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditProfileVisible(false)}
              >
                <Text style={styles.cancelText}>ኣቋርጽ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => {
                  setEditProfileVisible(false);
                  Alert.alert("ዕዉት", "ፕሮፋይልካ ተቐይሩ ኣሎ!");
                }}
              >
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 🚀 ማጂክ ሶሻል ሊንክስ */}
      <Modal
        visible={socialLinksVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.formContent}>
            <Text style={styles.formTitle}>Add Social Links</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Facebook Link"
              value={editFb}
              onChangeText={setEditFb}
            />
            <TextInput
              style={styles.inputField}
              placeholder="YouTube Link"
              value={editYt}
              onChangeText={setEditYt}
            />
            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setSocialLinksVisible(false)}
              >
                <Text style={styles.cancelText}>ኣቋርጽ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => {
                  setSocialLinksVisible(false);
                  Alert.alert("ዕዉት", "ሊንክታትካ ተዓቒቦም ኣለዉ!");
                }}
              >
                <Text style={styles.saveText}>Save Links</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 🚀 ሓዱሽ ማጂክ: ፓስዎርድ መቐየሪ (Change Password) */}
      <Modal visible={passwordVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.formContent}>
            <Text style={styles.formTitle}>Change Password</Text>
            <TextInput
              style={styles.inputField}
              placeholder="ናይ ሕጂ ፓስዎርድ (Old)"
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.inputField}
              placeholder="ሓዱሽ ፓስዎርድ (New)"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setPasswordVisible(false)}
              >
                <Text style={styles.cancelText}>ኣቋርጽ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => {
                  setPasswordVisible(false);
                  Alert.alert("ዕዉት", "ፓስዎርድካ ተቐይሩ ኣሎ!");
                }}
              >
                <Text style={styles.saveText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 🚀 ሓዱሽ ማጂክ: ኢሜል መቐየሪ (Change Email) */}
      <Modal visible={emailVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.formContent}>
            <Text style={styles.formTitle}>Change Email</Text>
            <TextInput
              style={styles.inputField}
              placeholder="ሓዱሽ ኢሜል"
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
            />
            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEmailVisible(false)}
              >
                <Text style={styles.cancelText}>ኣቋርጽ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => {
                  setEmailVisible(false);
                  Alert.alert("ዕዉት", "ኢሜልካ ተቐይሩ ኣሎ!");
                }}
              >
                <Text style={styles.saveText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ==========================================================
// 🚀 ምዕራፍ 7: ዲዛይን (Styles)
// ==========================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  headerContainer: { backgroundColor: "#fff" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#029eff",
  },
  topLeft: { flexDirection: "row", alignItems: "center" },
  profileText: { fontSize: 18, fontWeight: "bold", color: "#fff" },

  coverContainer: { width: "100%", height: 130, position: "relative" },
  coverImage: { width: "100%", height: "100%", resizeMode: "cover" },
  shareBtn: {
    position: "absolute",
    top: 10,
    right: 15,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 6,
    borderRadius: 15,
    zIndex: 10,
  },
  coverCameraBtn: {
    position: "absolute",
    bottom: 10,
    right: 15,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },

  avatarSection: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: -40,
  },
  avatarWrapper: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#fff",
    padding: 3,
    position: "relative",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
    backgroundColor: "#eee",
  },
  profileCameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#029eff",
    padding: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#fff",
    zIndex: 10,
  },

  countdownBtn: {
    backgroundColor: "#2ecc71",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 10,
    elevation: 2,
  },
  countdownText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    marginLeft: 4,
  },

  infoSection: { paddingHorizontal: 20, marginTop: 10 },
  nameText: { fontSize: 18, fontWeight: "bold", color: "#333" },
  bioText: { fontSize: 14, color: "#666", marginTop: 2 },
  statsRow: { flexDirection: "row", marginTop: 10, marginBottom: 15, gap: 20 },
  statItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  statNumber: { fontSize: 15, fontWeight: "bold", color: "#333" },
  statLabel: { fontSize: 14, color: "#666" },

  actionTabsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 70,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    marginBottom: 5,
  },
  iconTab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#f0f8ff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  activeTabBg: { backgroundColor: "#029eff" },

  gridCard: {
    width: width / 3 - 6,
    height: 120,
    margin: 3,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#f9f9f9",
  },
  gridImage: { width: "100%", height: "100%", resizeMode: "cover" },
  priceOverlay: {
    position: "absolute",
    bottom: 5,
    left: 5,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  priceText: { fontSize: 11, fontWeight: "bold", color: "#333" },

  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  chatAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#eee",
  }, // 👈 ሓዱሽ: ስእሊ ናይቲ ሰብ
  chatInfo: { flex: 1, marginLeft: 15 },
  chatName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 3,
  },
  chatText: { fontSize: 14, color: "#666" },
  chatMeta: { alignItems: "flex-end" },
  chatTime: { fontSize: 12, color: "#999", marginBottom: 5 },
  unreadBadge: {
    backgroundColor: "#029eff",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadText: { color: "#fff", fontSize: 10, fontWeight: "bold" },

  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: "#999",
    fontSize: 15,
    marginTop: 10,
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  modalDragHandler: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalItemText: { fontSize: 16, marginLeft: 15, color: "#333" },

  formContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
    paddingBottom: Platform.OS === "ios" ? 40 : 25,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  inputField: {
    backgroundColor: "#f0f2f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 15,
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f0f2f5",
    alignItems: "center",
  },
  cancelText: { fontWeight: "bold", color: "#666" },
  saveBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#029eff",
    alignItems: "center",
  },
  saveText: { fontWeight: "bold", color: "#fff" },
});
