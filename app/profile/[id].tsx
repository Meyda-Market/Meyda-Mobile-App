// ==========================================================
// 🚀 ምዕራፍ 1: መእተዊ (Imports)
// ==========================================================
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    Stack,
    useFocusEffect,
    useLocalSearchParams,
    useRouter,
} from "expo-router";
import React, { useCallback, useContext, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Linking,
    Platform,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";

const { width: screenWidth } = Dimensions.get("window");
const API_BASE_URL = "https://meyda-app.onrender.com";

export default function VendorProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useContext(AuthContext);

  // ==========================================================
  // 🚀 ምዕራፍ 2: መኽዘን ኩነታት (State Management)
  // ==========================================================
  const [vendor, setVendor] = useState<any>(null);
  const [vendorProducts, setVendorProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // ==========================================================
  // 🚀 ምዕራፍ 3: ዳታ ካብ ሰርቨር ምጽዋዕ (Fetch API)
  // ==========================================================
  useFocusEffect(
    useCallback(() => {
      fetchVendorData();
      fetchVendorProducts();
    }, [id]),
  );

  const fetchVendorData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${id}`);
      if (response.ok) {
        const data = await response.json();
        setVendor(data);
        setFollowersCount(data.followers?.length || 0);

        const myId = user?._id || user?.id;
        if (myId && data.followers?.includes(myId)) {
          setIsFollowing(true);
        }
      }
    } catch (error) {
      console.log("Error fetching vendor:", error);
    }
  };

  const fetchVendorProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/user/${id}`);
      if (response.ok) {
        const data = await response.json();
        setVendorProducts(data);
      }
    } catch (error) {
      console.log("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // 🚀 ምዕራፍ 4: ሓገዝቲ ማጂክ (Share, Follow, Links, Message)
  // ==========================================================
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Meyda Market: ናይ ${vendor?.name || "ነጋዳይ"} ፕሮፋይል ርኣዩ! ጽቡቕ ኣቕሑት ኣለዎም። \n\nሊንክ: https://meyda-app.vercel.app/profile/${id}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      Alert.alert("መዘኻኸሪ", "ፎሎው ንምግባር ሎግ-ኢን ግበሩ!");
      return;
    }
    const myId = user?._id || user?.id;
    if (myId === id) {
      Alert.alert("ኣስተውዕሉ", "ባዕልኻ ንባዕልኻ ፎሎው ክትገብር ኣይትኽእልን ኢኻ!");
      return;
    }

    setIsFollowing(!isFollowing);
    setFollowersCount(isFollowing ? followersCount - 1 : followersCount + 1);

    try {
      const token = await AsyncStorage.getItem("meydaToken");
      await fetch(`${API_BASE_URL}/api/users/${id}/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentUserId: myId }),
      });
    } catch (error) {
      setIsFollowing(isFollowing);
      setFollowersCount(isFollowing ? followersCount + 1 : followersCount - 1);
    }
  };

  const handleMessage = () => {
    if (!user) {
      Alert.alert("መዘኻኸሪ", "መልእኽቲ ንምልኣኽ መጀመርታ ሎግ-ኢን ግበሩ!");
      return;
    }

    // 💡 ማጂክ: ናብቲ ሓዱሽ "ገዛ ዕላል" ይወስደና፣ ስም ናይቲ ነጋዳይ እውን ሒዙ ይኸይድ!
    router.push({
      pathname: `/chat/${id}`,
      params: { name: vendor?.name },
    } as any);
  };

  // 💡 ሓዱሽ ማጂክ: ሶሻል ሚድያ ሊንክ መኽፈቲ
  const handleSocialLink = (url: string) => {
    Linking.openURL(url).catch(() => Alert.alert("ጌጋ", "ነዚ ሊንክ ምኽፋት ኣይተኻእለን።"));
  };

  const getImageUrl = (imgStr: string) => {
    if (!imgStr) return "https://via.placeholder.com/150";
    if (imgStr.startsWith("http")) return imgStr;
    return `${API_BASE_URL}${imgStr}`;
  };

  // ==========================================================
  // 🚀 ምዕራፍ 5: ዲዛይን ናይ ላዕሊ ክፋል (Profile Header)
  // ==========================================================
  const renderProfileHeader = () => {
    if (!vendor) return null;

    return (
      <View style={styles.headerContainer}>
        {/* 1. ባነር ስእሊ (Cover Photo) */}
        <View style={styles.bannerContainer}>
          <Image
            source={{
              uri: vendor.bannerPic
                ? getImageUrl(vendor.bannerPic)
                : "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800",
            }}
            style={styles.bannerImage}
          />
          <View style={styles.bannerOverlay} />
        </View>

        {/* 2. ክብ ዝበለ ስእሊ ፕሮፋይል (Avatar) */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri: vendor.profilePic
                  ? getImageUrl(vendor.profilePic)
                  : "https://via.placeholder.com/150",
              }}
              style={styles.avatarImage}
            />
            {vendor.isSubscribed && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#029eff" />
              </View>
            )}
          </View>

          {/* 3. ስምን ባዮን (Name & Bio) */}
          <Text style={styles.vendorName}>
            {vendor.name}{" "}
            {vendor.isSubscribed && (
              <FontAwesome5 name="crown" size={14} color="#f1c40f" />
            )}
          </Text>
          <Text style={styles.vendorBio}>
            {vendor.bio ||
              "እንቋዕ ናብ ድኳነይ ብደሓን መጻእኩም። ጽቡቕ ኣቕሑት ብጽቡቕ ዋጋ ከቕርበልኩም ድሉው ኣለኹ።"}
          </Text>

          {/* 💡 ሓዱሽ: ናይ ሶሻል ሚድያ ሊንክ መውሰዲታት */}
          <View style={styles.socialLinksContainer}>
            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() =>
                handleSocialLink(vendor.facebook || "https://facebook.com")
              }
            >
              <Ionicons name="logo-facebook" size={20} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() =>
                handleSocialLink(vendor.youtube || "https://youtube.com")
              }
            >
              <Ionicons name="logo-youtube" size={20} color="#FF0000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() =>
                handleSocialLink(vendor.website || "https://google.com")
              }
            >
              <Ionicons name="globe-outline" size={20} color="#029eff" />
            </TouchableOpacity>
          </View>

          {/* 4. ስታቲስቲክስ (Stats: Followers / Following) */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{followersCount}</Text>
              <Text style={styles.statLabel}>ሰዓብቲ (Followers)</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {vendor.following?.length || 0}
              </Text>
              <Text style={styles.statLabel}>ይስዕብ (Following)</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{vendorProducts.length}</Text>
              <Text style={styles.statLabel}>ኣቕሑት (Items)</Text>
            </View>
          </View>

          {/* 5. ናይ ስራሕ መጥወቒታት (Action Buttons) */}
          <View style={styles.actionButtonsRow}>
            {/* 💡 ማጂክ: እዚ ሎግ-ኢን ጌሩ ዘሎ ሰብ፡ እቲ ዋና ፕሮፋይል ድዩ? ንፈትሽ */}
            {String(user?._id || user?.id) === String(id) ? (
              // 👑 ናተይ ፕሮፋይል (ድኳነይ) እንተኾይኑ እዚን ይወጻ
              <>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => router.replace("/profile" as any)} // 👈 ናብቲ ናተይ ዳሽቦርድ ይወስድ
                >
                  <Ionicons name="settings-outline" size={18} color="#fff" />
                  <Text style={styles.primaryBtnText}>ኣመዓራርይ (Manage)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={handleShare}
                >
                  <Ionicons
                    name="share-social-outline"
                    size={18}
                    color="#029eff"
                  />
                  <Text style={styles.secondaryBtnText}>ድኳነይ ኣካፍል</Text>
                </TouchableOpacity>
              </>
            ) : (
              // 👥 ናይ ካልእ ሰብ ፕሮፋይል እንተኾይኑ ከም ቀደሙ ይኸውን
              <>
                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    isFollowing && styles.followingBtn,
                  ]}
                  onPress={handleFollow}
                >
                  <Ionicons
                    name={isFollowing ? "person-remove" : "person-add"}
                    size={18}
                    color={isFollowing ? "#333" : "#fff"}
                  />
                  <Text
                    style={[
                      styles.primaryBtnText,
                      isFollowing && { color: "#333" },
                    ]}
                  >
                    {isFollowing ? "ይስዓብ ኣሎ (Following)" : "ስዓብ (Follow)"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={handleMessage}
                >
                  <Ionicons
                    name="chatbubble-ellipses"
                    size={18}
                    color="#029eff"
                  />
                  <Text style={styles.secondaryBtnText}>መልእኽቲ (Message)</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <View style={styles.sectionDivider}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="grid" size={18} /> ዝዝርግሖም ኣቕሑት
          </Text>
        </View>
      </View>
    );
  };

  // ==========================================================
  // 🚀 ምዕራፍ 6: ዲዛይን ናይ ኣቕሑት (Products Grid)
  // ==========================================================
  const renderProduct = ({ item }: any) => (
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.8}
      onPress={() => router.push(`/product/${item._id}` as any)}
    >
      <View style={styles.imageContainer}>
        {item.images && item.images.length > 0 ? (
          <Image
            source={{ uri: getImageUrl(item.images[0]) }}
            style={styles.productImg}
          />
        ) : (
          <View style={styles.placeholderImg}>
            <FontAwesome5 name={item.icon || "box"} size={30} color="#999" />
          </View>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.priceTextGrid}>{item.price}</Text>
        <Text style={styles.titleTextGrid} numberOfLines={1}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // ==========================================================
  // 🚀 ምዕራፍ 7: ጠቕላላ ስክሪን (Main Render)
  // ==========================================================
  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#029eff" />
        <Text style={{ marginTop: 10, color: "#666" }}>ፕሮፋይል ይጽዓን ኣሎ...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* 💡 ሓዱሽ ማጂክ: ዘይወሓጥ (Sticky) ሄደር ኣብ ላዕሊ */}
      <View style={styles.stickyHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.stickyHeaderTitle}>ፕሮፋይል</Text>
        </View>
        <TouchableOpacity style={styles.headerIconBtn} onPress={handleShare}>
          <Ionicons name="share-social" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={vendorProducts}
        keyExtractor={(item) => item._id}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={renderProfileHeader}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>እዚ ሸያጢ ዛጊት ዝኾነ ኣቕሓ ኣየቕረበን።</Text>
          </View>
        )}
      />
    </View>
  );
}

// ==========================================================
// 🚀 ምዕራፍ 8: ዲዛይን (Styles)
// ==========================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f8fa" },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f8fa",
  },

  // 💡 ሓዱሽ: Sticky Header
  stickyHeader: {
    backgroundColor: "#029eff",
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 5,
    zIndex: 10,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  stickyHeaderTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 15,
  },
  headerIconBtn: { padding: 5 },

  // Header / Banner
  headerContainer: { backgroundColor: "#f5f8fa", paddingBottom: 15 },
  bannerContainer: { width: "100%", height: 160, position: "relative" },
  bannerImage: { width: "100%", height: "100%", resizeMode: "cover" },
  bannerOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.2)",
  },

  // Profile Section
  profileSection: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: -20,
    paddingHorizontal: 20,
    alignItems: "center",
    paddingBottom: 20,
    elevation: 2,
  },
  avatarWrapper: { position: "relative", marginTop: -45, marginBottom: 10 },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#eee",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 2,
  },

  vendorName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  vendorBio: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 10,
    marginBottom: 15,
  },

  // 💡 ሓዱሽ: Social Links
  socialLinksContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    marginBottom: 20,
    marginTop: -5,
  },
  socialIcon: {
    backgroundColor: "#f4f9fc",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
    borderWidth: 1,
    borderColor: "#e1f0fa",
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#f8f9fa",
    paddingVertical: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  statItem: { alignItems: "center", width: "30%" },
  statNumber: { fontSize: 18, fontWeight: "bold", color: "#029eff" },
  statLabel: { fontSize: 11, color: "#777", marginTop: 3 },
  statDivider: { width: 1, height: 30, backgroundColor: "#ddd" },

  // Action Buttons
  actionButtonsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: "#029eff",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    elevation: 2,
  },
  followingBtn: {
    backgroundColor: "#e6f4f1",
    borderWidth: 1,
    borderColor: "#029eff",
    elevation: 0,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 8,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#029eff",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
  },
  secondaryBtnText: {
    color: "#029eff",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 8,
  },

  // Products Grid Section
  sectionDivider: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginBottom: 15,
  },

  productCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 10,
    elevation: 2,
  },
  imageContainer: {
    width: "100%",
    height: 110,
    borderRadius: 10,
    backgroundColor: "#fafafa",
    overflow: "hidden",
    marginBottom: 10,
  },
  productImg: { width: "100%", height: "100%", resizeMode: "cover" },
  placeholderImg: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: { paddingHorizontal: 5 },
  priceTextGrid: { fontSize: 14, fontWeight: "bold", color: "#029eff" },
  titleTextGrid: { fontSize: 12, color: "#444", marginTop: 4 },

  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: "#999",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
});
