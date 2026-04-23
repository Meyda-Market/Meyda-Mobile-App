// ==========================================================
// 🚀 ምዕራፍ 1: መእተዊ (Imports)
// ==========================================================
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";

const { width } = Dimensions.get("window");
const API_BASE_URL = "https://meyda-app.onrender.com";

export default function ProductDetail() {
  // ==========================================================
  // 🚀 ምዕራፍ 2: መኽዘን ሓበሬታ (State Management)
  // ==========================================================
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showComments, setShowComments] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const imgListRef = useRef<FlatList>(null);

  const [isSaved, setIsSaved] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [vendorProfilePic, setVendorProfilePic] = useState<string | null>(null);

  // ==========================================================
  // 🚀 ምዕራፍ 3: ሓበሬታ ካብ ሰርቨር ምምጻእ
  // ==========================================================
  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/products`);
      const data = await response.json();

      const singleProduct = data.find(
        (item: any) => String(item._id) === String(id),
      );
      setProduct(singleProduct);
      // 💡 ማጂክ 2: ፕሮፋይል ስእሊ ናይቲ ነጋዳይ ካብ ሰርቨር ንጽውዓዮ ኣለና!
      const vId =
        singleProduct?.sellerId ||
        singleProduct?.vendorId ||
        singleProduct?.userId;
      if (vId) {
        try {
          const userRes = await fetch(`${API_BASE_URL}/api/users/${vId}`);
          if (userRes.ok) {
            const userData = await userRes.json();
            setVendorProfilePic(userData.profilePic);
          }
        } catch (e) {
          console.log("ጌጋ ስእሊ ምምጻእ:", e);
        }
      }

      const myId = user?._id || user?.id;
      if (myId && singleProduct?.savedBy?.includes(myId)) {
        setIsSaved(true);
      } else {
        setIsSaved(false);
      }

      if (singleProduct) {
        const others = data.filter(
          (item: any) =>
            item._id !== id &&
            item.category === singleProduct.category &&
            item.location === singleProduct.location,
        );
        setRelatedProducts(others);
      }

      setLoading(false);
    } catch (error) {
      console.error("ጌጋ:", error);
      setLoading(false);
    }
  };

  const getImageUrl = (urlPath: string) => {
    if (!urlPath) return "https://via.placeholder.com/400";
    if (urlPath.startsWith("http")) return urlPath;
    return `${API_BASE_URL}${urlPath.startsWith("/") ? "" : "/"}${urlPath}`;
  };

  const productImages =
    product?.images && product.images.length > 0
      ? product.images
      : [product?.image || ""];

  // ==========================================================
  // 🚀 ምዕራፍ 4: ኣውቶማቲክ ስላይደር (Auto-play Carousel)
  // ==========================================================
  useEffect(() => {
    if (productImages.length > 1) {
      const interval = setInterval(() => {
        setActiveImgIndex((prev) => {
          const next = (prev + 1) % productImages.length;
          try {
            imgListRef.current?.scrollToIndex({ index: next, animated: true });
          } catch (e) {}
          return next;
        });
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [productImages.length]);

  // ==========================================================
  // 🚀 ምዕራፍ 5: ማጂካት ናይ (Save, Share, Report, Delete, Call, Msg)
  // ==========================================================
  const handleToggleSave = async () => {
    if (!user) {
      Alert.alert("መዘኻኸሪ", "ንብረት ሴቭ ንምግባር መጀመርታ ሎግ-ኢን ግበሩ!");
      return;
    }
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);

    try {
      const myId = user._id || user.id;
      const actionType = newSavedState ? "add" : "remove";
      const token = await AsyncStorage.getItem("meydaToken");

      await fetch(`${API_BASE_URL}/api/users/${myId}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: id, action: actionType }),
      });
    } catch (error) {
      console.log("Save Error:", error);
    }
  };

  const handleShare = async () => {
    try {
      const productName = product?.title || product?.name || "Meyda Product";
      const productPrice = product?.price ? `${product.price} Br` : "";
      const appLink = `https://meyda-app.onrender.com/product/${id}`;

      await Share.share({
        message: `ርኣዮ እዚ ማራኺ ኣቕሓ ኣብ Meyda App!\n\n🛍️ ${productName}\n💰 ${productPrice}\n\nኣብዚ ክሊክ ጌርካ ርኣዮ:\n${appLink}`,
      });
    } catch (error) {
      console.log("Share Error:", error);
    }
  };

  const handleReportSubmit = () => {
    if (!reportReason.trim()) {
      Alert.alert("ጌጋ", "በጃኹም ምኽንያት ሪፖርትኹም ጽሓፉ።");
      return;
    }
    setShowReportModal(false);
    setReportReason("");
    Alert.alert("ዕዉት", "ሪፖርትኹም ብዓወት ናብ ኣድሚን ተላኢኹ ኣሎ። የቐንየልና!");
  };

  const handleCall = () => {
    const phone = product?.phone || "+251900000000";
    Linking.openURL(`tel:${phone}`);
  };

  const handleMessage = () => {
    const sellerId = product?.sellerId || product?.vendorId || "unknown";
    router.push({
      pathname: `/chat/${sellerId}`,
      params: {
        name: product?.vendorName || "Meyda Vendor",
        productId: product?._id,
        productName: product?.title || product?.name,
        productImage:
          product?.images && product.images.length > 0
            ? product.images[0]
            : product?.image || "",
        productPrice: product?.price,
        prefillMsg: `ሰላም፣ ብዛዕባ እዚ ኣቕሓ (${product?.title || product?.name}) ክሓትት ደልየ ኔረ...`,
      },
    } as any);
  };

  // 💡 ሓዱሽ: Delete ፋንክሽን
  const handleDeleteProduct = () => {
    Alert.alert(
      "መጠንቀቕታ!",
      `ነዚ "${product?.title || product?.name}" ብርግጽ ክትድምስሶ ትደሊ ዲኻ? ንድሕሪት ኣይምለስን እዩ!`,
      [
        { text: "ኣይደልን", style: "cancel" },
        {
          text: "ደምስሶ",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("meydaToken");
              const response = await fetch(
                `${API_BASE_URL}/api/products/${id}`,
                {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` },
                },
              );

              if (response.ok) {
                Alert.alert("ዕዉት", "ንብረት ብዓወት ተደምሲሱ ኣሎ!", [
                  { text: "OK", onPress: () => router.back() },
                ]);
              } else {
                Alert.alert("ጌጋ", "ንብረት ምድምሳስ ኣይተኻእለን።");
              }
            } catch (error) {}
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: isDarkMode ? "#121212" : "#f5f8fa" },
        ]}
      >
        <Stack.Screen
          options={{
            title: "ይጽዓን ኣሎ...",
            headerStyle: {
              backgroundColor: isDarkMode ? "#1E1E1E" : "#029eff",
            },
            headerTintColor: "#fff",
          }}
        />
        <View
          style={[
            styles.skeletonImage,
            { backgroundColor: isDarkMode ? "#333" : "#e1e4e8" },
          ]}
        />
        <View style={{ padding: 20 }}>
          <View
            style={[
              styles.skeletonTitle,
              { backgroundColor: isDarkMode ? "#333" : "#e1e4e8" },
            ]}
          />
          <View
            style={[
              styles.skeletonPrice,
              { backgroundColor: isDarkMode ? "#333" : "#e1e4e8" },
            ]}
          />
          <View
            style={[
              styles.skeletonDesc,
              { backgroundColor: isDarkMode ? "#333" : "#e1e4e8" },
            ]}
          />
          <View
            style={[
              styles.skeletonDesc,
              { backgroundColor: isDarkMode ? "#333" : "#e1e4e8" },
            ]}
          />
        </View>
      </View>
    );
  }

  if (!product)
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: isDarkMode ? "#121212" : "#fff" },
        ]}
      >
        <Text style={{ color: isDarkMode ? "#FFF" : "#000" }}>ኣቕሓ ኣይተረኽበን</Text>
      </View>
    );

  // 💡 መረጋገጺ ዋና ኣቕሓ ምዃኑ (ን Delete)
  const vendorId = product?.sellerId || product?.vendorId || product?.userId;
  const myId = user?._id || user?.id;
  const canDelete = user && (user.role === "admin" || user.role === "owner");

  // ==========================================================
  // 🚀 ምዕራፍ 6: ጠቕላላ ስክሪን (Main Render)
  // ==========================================================
  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#121212" : "#f5f8fa" },
      ]}
    >
      <Stack.Screen
        options={{
          title: "ዝርዝር ኣቕሓ",
          headerStyle: { backgroundColor: isDarkMode ? "#1E1E1E" : "#029eff" },
          headerTintColor: "#fff",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginRight: 20 }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {/* 💡 ማጂክ: Delete Icon ተወሲኹ ኣሎ */}
              {canDelete && (
                <TouchableOpacity
                  style={{ marginRight: 15 }}
                  onPress={handleDeleteProduct}
                >
                  <Ionicons name="trash" size={22} color="#fff" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={{ marginRight: 15 }}
                onPress={handleToggleSave}
              >
                <Ionicons
                  name={isSaved ? "heart" : "heart-outline"}
                  size={24}
                  color={isSaved ? "#FF3B30" : "#fff"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ marginRight: 15 }}
                onPress={handleShare}
              >
                <Ionicons name="share-social" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowReportModal(true)}>
                <Ionicons name="flag-outline" size={22} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View
          style={[
            styles.imageHeader,
            { backgroundColor: isDarkMode ? "#000" : "#fff" },
          ]}
        >
          <FlatList
            ref={imgListRef}
            data={productImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveImgIndex(index);
            }}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.imageWrapper,
                  { backgroundColor: isDarkMode ? "#000" : "#fff" },
                ]}
              >
                <Image
                  source={{ uri: getImageUrl(item) }}
                  style={styles.mainImage}
                />
              </View>
            )}
          />
          <View style={styles.imageCounterBadge}>
            <Text style={styles.imageCounterText}>
              {activeImgIndex + 1} / {productImages.length}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.detailsContainer,
            { backgroundColor: isDarkMode ? "#1E1E1E" : "#fff" },
          ]}
        >
          {/* 💡 ማጂክ: ዋጋን ኣርእስትን ምስ ፕሮፋይል ኣይኮን (Avatar) ብሓንሳብ */}
          <View style={styles.headerInfoRow}>
            <View style={{ flex: 1, paddingRight: 15 }}>
              <Text style={styles.productPrice}>{product.price} Br</Text>
              <Text
                style={[
                  styles.productTitle,
                  { color: isDarkMode ? "#FFF" : "#222" },
                ]}
              >
                {product.name || product.title}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.topVendorAvatarContainer,
                { borderColor: isDarkMode ? "#333" : "#eee" },
              ]}
              activeOpacity={0.8}
              onPress={() => {
                if (vendorId) router.push(`/profile/${vendorId}` as any);
              }}
            >
              <Image
                source={{
                  // 💡 ማጂክ 3: እታ ሕጂ ዝጸዋዕናያ ስእሊ (vendorProfilePic) ኣብዚ ትኣቱ!
                  uri: vendorProfilePic
                    ? getImageUrl(vendorProfilePic)
                    : "https://via.placeholder.com/50",
                }}
                style={styles.topVendorAvatar}
              />
              <View style={styles.onlineDot} />
            </TouchableOpacity>
          </View>

          <View style={styles.metaRow}>
            <Text
              style={[styles.metaText, { color: isDarkMode ? "#AAA" : "#666" }]}
            >
              📍 {product.location || "Tigray, Mekelle"}
            </Text>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(2, 158, 255, 0.15)"
                    : "#E8F4FD",
                },
              ]}
            >
              <Text style={styles.badgeText}>ሓዱሽ</Text>
            </View>
          </View>

          {(product.ram ||
            product.storage ||
            product.category === "mobile" ||
            product.category === "laptop") && (
            <View
              style={[
                styles.specsBox,
                {
                  backgroundColor: isDarkMode ? "#2A2A2A" : "#f9f9f9",
                  borderColor: isDarkMode ? "#444" : "#eee",
                },
              ]}
            >
              <Text
                style={[
                  styles.specTitle,
                  { color: isDarkMode ? "#CCC" : "#555" },
                ]}
              >
                ቴክኒካዊ ሓበሬታ (Specs):
              </Text>
              <View style={styles.specGrid}>
                <View style={styles.specItem}>
                  <Ionicons
                    name="hardware-chip-outline"
                    size={14}
                    color="#029eff"
                  />
                  <Text
                    style={[
                      styles.specText,
                      { color: isDarkMode ? "#FFF" : "#333" },
                    ]}
                  >
                    RAM: {product.ram || "8 GB"}
                  </Text>
                </View>
                <View style={styles.specItem}>
                  <Ionicons name="save-outline" size={14} color="#029eff" />
                  <Text
                    style={[
                      styles.specText,
                      { color: isDarkMode ? "#FFF" : "#333" },
                    ]}
                  >
                    Storage: {product.storage || "256 GB"}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View
            style={[
              styles.divider,
              { backgroundColor: isDarkMode ? "#333" : "#f0f0f0" },
            ]}
          />

          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? "#FFF" : "#333" },
            ]}
          >
            መግለጺ (Description)
          </Text>
          <Text
            style={[
              styles.description,
              { color: isDarkMode ? "#CCC" : "#555" },
            ]}
          >
            {product.description ||
              "ናይዚ ኣቕሓ ዝርዝር መግለጺ ኣብዚ ይኣቱ። ጽቡቕ ጽሬት ዘለዎ ምህርቲ እዩ።"}
          </Text>

          <View
            style={[
              styles.divider,
              { backgroundColor: isDarkMode ? "#333" : "#f0f0f0" },
            ]}
          />

          <TouchableOpacity
            style={styles.commentToggleBtn}
            onPress={() => setShowComments(!showComments)}
          >
            <Text
              style={[
                styles.sectionTitle,
                { color: isDarkMode ? "#FFF" : "#333" },
              ]}
            >
              ርእይቶታት (Comments) {showComments ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>

          {showComments && (
            <View style={styles.commentBox}>
              <Image
                source={{ uri: "https://via.placeholder.com/40" }}
                style={styles.commenterPic}
              />
              <View
                style={[
                  styles.commentContent,
                  {
                    backgroundColor: isDarkMode ? "#2A2A2A" : "#f9f9f9",
                    borderColor: isDarkMode ? "#444" : "#eee",
                  },
                ]}
              >
                <Text style={styles.commenterName}>ኣማኑኤል ተስፋይ</Text>
                <Text
                  style={[
                    styles.commentText,
                    { color: isDarkMode ? "#CCC" : "#444" },
                  ]}
                >
                  ዋጋ ናይ መወዳእታ ክንደይ እዩ? ሎሚ ክወስዶ ደልየ ኔረ።
                </Text>
                <TouchableOpacity>
                  <Text
                    style={[
                      styles.replyText,
                      { color: isDarkMode ? "#888" : "#666" },
                    ]}
                  >
                    ↪️ ሪፕለይ (Reply)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View
            style={[
              styles.divider,
              { backgroundColor: isDarkMode ? "#333" : "#f0f0f0" },
            ]}
          />

          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? "#FFF" : "#333" },
            ]}
          >
            ተመሳሰልቲ ምህርትታት
          </Text>
          {relatedProducts.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginHorizontal: -15, paddingHorizontal: 15 }}
            >
              {relatedProducts.slice(0, 10).map((simProduct: any) => (
                <TouchableOpacity
                  key={simProduct._id}
                  style={[
                    styles.similarCard,
                    {
                      backgroundColor: isDarkMode ? "#2A2A2A" : "#fff",
                      borderColor: isDarkMode ? "#444" : "#eee",
                    },
                  ]}
                  onPress={() =>
                    router.push(`/product/${simProduct._id}` as any)
                  }
                >
                  <Image
                    source={{
                      uri: getImageUrl(
                        simProduct.image ||
                          (simProduct.images && simProduct.images[0]),
                      ),
                    }}
                    style={styles.similarImg}
                  />
                  <Text style={styles.similarPrice} numberOfLines={1}>
                    {simProduct.price} Br
                  </Text>
                  <Text
                    style={[
                      styles.similarName,
                      { color: isDarkMode ? "#CCC" : "#333" },
                    ]}
                    numberOfLines={1}
                  >
                    {simProduct.name || simProduct.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.noRelatedText}>ኣብዚ ቦታ ተመሳሳሊ ኣቕሓ የለን።</Text>
          )}
        </View>
      </ScrollView>

      {/* FABs (Call & Msg) */}
      <View style={styles.floatingActionContainer}>
        <TouchableOpacity style={styles.floatCallBtn} onPress={handleCall}>
          <Ionicons name="call" size={18} color="#fff" />
          <Text style={styles.floatBtnText}>ደውል</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.floatMsgBtn} onPress={handleMessage}>
          <Ionicons name="chatbubble-ellipses" size={18} color="#fff" />
          <Text style={styles.floatBtnText}>መልእኽቲ</Text>
        </TouchableOpacity>
      </View>

      {/* 💡 ሪፖርት ፖፕ-ኣፕ */}
      <Modal visible={showReportModal} transparent={true} animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.reportModalOverlay}
        >
          <View
            style={[
              styles.reportModalContent,
              { backgroundColor: isDarkMode ? "#1E1E1E" : "#fff" },
            ]}
          >
            <Text
              style={[
                styles.reportTitle,
                { color: isDarkMode ? "#FFF" : "#333" },
              ]}
            >
              🚩 ኣቕሓ ሪፖርት ግበር
            </Text>
            <TextInput
              style={[
                styles.reportInput,
                {
                  backgroundColor: isDarkMode ? "#2A2A2A" : "#f0f2f5",
                  color: isDarkMode ? "#FFF" : "#333",
                },
              ]}
              placeholder="ስለምንታይ ሪፖርት ትገብሮ ኣለኻ? ምኽንያትካ ጽሓፍ..."
              placeholderTextColor={isDarkMode ? "#888" : "#999"}
              multiline
              value={reportReason}
              onChangeText={setReportReason}
            />
            <View style={styles.reportActions}>
              <TouchableOpacity
                style={styles.reportCancelBtn}
                onPress={() => {
                  setShowReportModal(false);
                  setReportReason("");
                }}
              >
                <Text
                  style={[
                    styles.reportCancelText,
                    { color: isDarkMode ? "#AAA" : "#777" },
                  ]}
                >
                  ኣቋርጽ
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.reportSubmitBtn}
                onPress={handleReportSubmit}
              >
                <Text style={styles.reportSubmitText}>ስደድ (Submit)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ==========================================================
// 🚀 ምዕራፍ 7: ዲዛይን (Styles)
// ==========================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f8fa" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  skeletonImage: { width: "100%", height: 280, backgroundColor: "#e1e4e8" },
  skeletonTitle: {
    width: "70%",
    height: 25,
    backgroundColor: "#e1e4e8",
    borderRadius: 5,
    marginBottom: 10,
  },
  skeletonPrice: {
    width: "40%",
    height: 20,
    backgroundColor: "#e1e4e8",
    borderRadius: 5,
    marginBottom: 15,
  },
  skeletonDesc: {
    width: "100%",
    height: 12,
    backgroundColor: "#e1e4e8",
    borderRadius: 5,
    marginBottom: 8,
  },

  imageHeader: { width: "100%", height: 280, backgroundColor: "#fff" },
  imageWrapper: {
    width: width,
    height: 280,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
  mainImage: { width: "100%", height: "100%", resizeMode: "contain" },
  imageCounterBadge: {
    position: "absolute",
    bottom: 30,
    right: 15,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: { color: "#fff", fontSize: 11, fontWeight: "bold" },

  detailsContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    padding: 15,
    elevation: 5,
  },

  headerInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  topVendorAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    marginTop: 5,
    position: "relative",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  topVendorAvatar: { width: "100%", height: "100%", borderRadius: 25 },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    backgroundColor: "#2ecc71",
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },

  productPrice: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#029eff",
    marginBottom: 2,
  },
  productTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaText: { fontSize: 12, color: "#666" },
  badge: {
    backgroundColor: "#E8F4FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { color: "#029eff", fontSize: 11, fontWeight: "bold" },
  divider: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 10 },

  specsBox: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  specTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 6,
  },
  specGrid: { flexDirection: "row", gap: 15 },
  specItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  specText: { fontSize: 12, color: "#333", fontWeight: "bold" },

  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  description: { fontSize: 13, color: "#555", lineHeight: 20, marginTop: 6 },

  commentToggleBtn: {
    paddingVertical: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  commentBox: { flexDirection: "row", marginTop: 10 },
  commenterPic: { width: 34, height: 34, borderRadius: 17, marginRight: 10 },
  commentContent: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  commenterName: {
    fontWeight: "bold",
    color: "#029eff",
    marginBottom: 2,
    fontSize: 12,
  },
  commentText: { color: "#444", marginBottom: 3, fontSize: 13 },
  replyText: { fontSize: 11, color: "#666", fontWeight: "bold", marginTop: 4 },

  similarCard: {
    width: 130,
    marginRight: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    marginBottom: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  similarImg: {
    width: "100%",
    height: 90,
    borderRadius: 8,
    resizeMode: "cover",
    marginBottom: 5,
  },
  similarPrice: { fontWeight: "bold", color: "#029eff", fontSize: 13 },
  similarName: { color: "#333", fontSize: 12 },
  noRelatedText: {
    color: "#999",
    marginTop: 10,
    fontStyle: "italic",
    fontSize: 13,
  },

  floatingActionContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 35 : 30,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
    zIndex: 100,
  },
  floatCallBtn: {
    flex: 1,
    backgroundColor: "#2ecc71",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  floatMsgBtn: {
    flex: 1,
    backgroundColor: "#029eff",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  floatBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 6,
  },

  reportModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  reportModalContent: {
    backgroundColor: "#fff",
    width: "85%",
    borderRadius: 15,
    padding: 20,
    elevation: 10,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  reportInput: {
    backgroundColor: "#f0f2f5",
    borderRadius: 10,
    padding: 15,
    minHeight: 100,
    textAlignVertical: "top",
    fontSize: 15,
    marginBottom: 15,
  },
  reportActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 15,
  },
  reportCancelBtn: { padding: 10 },
  reportCancelText: { color: "#777", fontWeight: "bold", fontSize: 15 },
  reportSubmitBtn: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  reportSubmitText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});
