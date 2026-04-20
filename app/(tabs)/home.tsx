// ==========================================================
// 🚀 ምዕራፍ 1: መእተዊ (Imports)
// ==========================================================
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
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

const { width: screenWidth } = Dimensions.get("window");
const API_BASE_URL = "https://meyda-app.onrender.com";
const HEADER_HEIGHT = 50; // 👈 ጸቢባ ኣላ

const CAROUSEL_ITEM_WIDTH = screenWidth * 0.82;
const CAROUSEL_SPACING = (screenWidth - CAROUSEL_ITEM_WIDTH) / 2;

// 💡 ሓገዚት ፋንክሽን
const getImageUrl = (imgStr: string) => {
  if (!imgStr) return "https://via.placeholder.com/150";
  if (imgStr.startsWith("http")) return imgStr;
  return `${API_BASE_URL}${imgStr}`;
};

// ==========================================================
// 🚀 ሓዱሽ ምዕራፍ: ርእሳ ዝኸኣለት "Ping-Pong" ባነር (ProCarousel)
// ==========================================================
// 💡 ማጂክ: እዚኣ ርእሳ ስለ ዝኸኣለት ነቲ "ህልም ውልዕ" ትብል ጌጋ 100% ኣጥፊኣቶ ኣላ!
const ProCarousel = ({ proProducts, router }: any) => {
  const carouselRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const directionRef = useRef(1); // 1 = ንየማን, -1 = ንጸጋም (Ping-Pong ማጂክ)

  useEffect(() => {
    if (proProducts.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => {
        let nextIndex = prevIndex + directionRef.current;

        // Ping-Pong Logic: ጫፍ ምስ በጽሐ ኣንፈት ይቕይር (ካብ የማን ናብ ጸጋም)
        if (nextIndex >= proProducts.length) {
          directionRef.current = -1; // ንድሕሪት ተመለስ
          nextIndex = proProducts.length - 2;
        } else if (nextIndex < 0) {
          directionRef.current = 1; // ንቕድሚት ቀጽል
          nextIndex = 1;
        }

        if (nextIndex < 0) nextIndex = 0; // መረጋገጺ ድሕነት

        try {
          carouselRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
        } catch (e) {}

        return nextIndex;
      });
    }, 4000); // 4 ሰከንድ

    return () => clearInterval(interval);
  }, [proProducts.length]);

  const renderItem = ({ item }: any) => (
    <View style={{ width: CAROUSEL_ITEM_WIDTH, paddingHorizontal: 5 }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push(`/product/${item._id}` as any)}
      >
        <View style={styles.carouselSlide}>
          <Image
            source={{ uri: getImageUrl(item.images[0]) }}
            style={styles.carouselImage}
          />
          <View style={styles.carouselOverlay} />
          <View style={styles.proBadge}>
            <FontAwesome5 name="crown" size={10} color="#333" />
            <Text style={styles.proBadgeText}>PRO AD</Text>
          </View>
          <View style={styles.carouselInfo}>
            <View style={{ flex: 1 }}>
              <Text style={styles.carouselTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.carouselLocation}>
                <Ionicons name="location" size={12} /> {item.location}
              </Text>
            </View>
            <View style={styles.adPriceBadge}>
              <Text style={styles.adPriceText}>{item.price} Br</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        ref={carouselRef}
        data={proProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CAROUSEL_ITEM_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: CAROUSEL_SPACING }}
        getItemLayout={(_, index) => ({
          length: CAROUSEL_ITEM_WIDTH,
          offset: CAROUSEL_ITEM_WIDTH * index,
          index,
        })}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / CAROUSEL_ITEM_WIDTH,
          );
          setActiveIndex(index);
        }}
      />
      <View style={styles.dotsContainer}>
        {proProducts.slice(0, 10).map((_: any, i: number) => (
          <View
            key={i}
            style={[styles.dot, activeIndex === i && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
};

// ==========================================================
// 🚀 ምዕራፍ 2: ቀወምቲ ሓበሬታታት (Constants)
// ==========================================================
const categoriesData = [
  { id: "all", name: "All" },
  { id: "vehicles", name: "ተሽከርከርቲ" },
  { id: "electronics", name: "ኤሌክትሮኒክስ" },
  { id: "mobile", name: "ሞባይል" },
  { id: "music", name: "ሙዚቃ መሳርሒ" },
  { id: "fashion", name: "ፋሽን" },
  { id: "houses", name: "ገዛውቲ" },
  { id: "sports", name: "ስፖርት" },
  { id: "furniture", name: "ፈርኒቸር" },
  { id: "books", name: "መፃሕፍቲ" },
  { id: "cosmetics", name: "ኮስሞቲክስ" },
  { id: "laptop", name: "ላፕቶፕ" },
];

const locationsData = [
  {
    region: "Tigray",
    cities: [
      "Mekelle",
      "Adigrat",
      "Alamata",
      "Adwa",
      "Axum",
      "Shire",
      "Humera",
      "Wukro",
    ],
  },
  { region: "Addis Ababa", cities: ["Bole", "Piasa", "Megenagna", "Kality"] },
  { region: "Amhara", cities: ["Bahirdar", "Gonder", "Dessie"] },
  { region: "Oromia", cities: ["Adama", "Gimma", "Bishoftu", "Shashemane"] },
  { region: "Afar", cities: ["Semera", "Asayta", "Awash"] },
  { region: "Somali", cities: ["Jigjiga", "Degahabur"] },
  { region: "Debub", cities: ["Hawassa", "Gamo"] },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  // ==========================================================
  // 🚀 ምዕራፍ 3: መኽዘን ኩነታት (State Management)
  // ==========================================================
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [proProducts, setProProducts] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [locationDisplayName, setLocationDisplayName] = useState("Region");

  const [showRegionModal, setShowRegionModal] = useState(false);
  const [activeRegionStep, setActiveRegionStep] = useState<string | null>(null);

  const [vendorProfiles, setVendorProfiles] = useState<Record<string, string>>(
    {},
  );
  const categoryListRef = useRef<any>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const diffClamp = Animated.diffClamp(scrollY, 0, HEADER_HEIGHT + 30);
  const translateY = diffClamp.interpolate({
    inputRange: [0, HEADER_HEIGHT + 30],
    outputRange: [0, -(HEADER_HEIGHT + 30)],
  });

  // ==========================================================
  // 🚀 ምዕራፍ 4: ዳታ ካብ ሰርቨር ምጽዋዕ (Fetch API)
  // ==========================================================
  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, []),
  );

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`);
      const data = await response.json();

      if (!Array.isArray(data)) {
        setLoading(false);
        return;
      }

      const sellerIds = [
        ...new Set(data.map((p: any) => p.sellerId).filter(Boolean)),
      ];
      const profilesMap: Record<string, string> = {};

      await Promise.all(
        sellerIds.map(async (id: any) => {
          try {
            const userRes = await fetch(`${API_BASE_URL}/api/users/${id}`);
            if (userRes.ok) {
              const userData = await userRes.json();
              profilesMap[id] = userData.profilePic;
            }
          } catch (e) {}
        }),
      );
      setVendorProfiles(profilesMap);

      setAllProducts(data);
      setFilteredProducts(data);

      const pros = data.filter(
        (p: any) =>
          (p.isPro === true ||
            p.isPro === "true" ||
            String(p.isPro) === "true") &&
          p.images &&
          p.images.length > 0,
      );
      setProProducts(pros.sort(() => 0.5 - Math.random()));
    } catch (error) {
      console.error("ጌጋ ኮነክሽን:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  }, []);

  // ==========================================================
  // 🚀 ምዕራፍ 5: ናይ ልቢ (Save)
  // ==========================================================
  const handleToggleSave = async (
    productId: string,
    currentSavedBy: string[],
  ) => {
    if (!user) {
      Alert.alert("መዘኻኸሪ", "ንብረት ሴቭ ንምግባር መጀመርታ ሎግ-ኢን ግበሩ!");
      return;
    }

    const myId = user._id || user.id;
    const isCurrentlySaved = currentSavedBy.includes(myId);

    const updatedProducts = allProducts.map((p) => {
      if (p._id === productId) {
        let newSavedBy = [...(p.savedBy || [])];
        if (isCurrentlySaved) {
          newSavedBy = newSavedBy.filter((id: string) => id !== myId);
        } else {
          newSavedBy.push(myId);
        }
        return { ...p, savedBy: newSavedBy };
      }
      return p;
    });

    setAllProducts(updatedProducts);
    setFilteredProducts(
      updatedProducts.filter((p) =>
        filteredProducts.some((fp) => fp._id === p._id),
      ),
    );

    try {
      const actionType = isCurrentlySaved ? "remove" : "add";
      const token = await AsyncStorage.getItem("meydaToken");

      await fetch(`${API_BASE_URL}/api/users/${myId}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: productId, action: actionType }),
      });
    } catch (error) {}
  };

  // ==========================================================
  // 🚀 ምዕራፍ 6: ንብረት ምድምሳስ (Delete)
  // ==========================================================
  const handleDeleteProduct = (productId: string, productTitle: string) => {
    Alert.alert(
      "መጠንቀቕታ!",
      `ነዚ "${productTitle}" ብርግጽ ክትድምስሶ ትደሊ ዲኻ? ንድሕሪት ኣይምለስን እዩ!`,
      [
        { text: "ኣይደልን (Cancel)", style: "cancel" },
        {
          text: "ደምስሶ (Delete)",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("meydaToken");
              const response = await fetch(
                `${API_BASE_URL}/api/products/${productId}`,
                {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` },
                },
              );

              if (response.ok) {
                setAllProducts((prev) =>
                  prev.filter((p) => p._id !== productId),
                );
                setFilteredProducts((prev) =>
                  prev.filter((p) => p._id !== productId),
                );
                Alert.alert("ዕውት", "ንብረት ብዓወት ተደምሲሱ ኣሎ!");
              } else {
                Alert.alert("ጌጋ", "ንብረት ምድምሳስ ኣይተኻእለን።");
              }
            } catch (error) {}
          },
        },
      ],
    );
  };

  // ==========================================================
  // 🚀 ምዕራፍ 7: መጻረዪ & ሓዱሽ ማጂክ Ad Injection
  // ==========================================================
  useFocusEffect(
    useCallback(() => {
      let result = allProducts;
      if (locationFilter !== "all")
        result = result.filter(
          (p) => p.location && p.location.includes(locationFilter),
        );
      if (selectedCategory !== "all")
        result = result.filter((p) => p.category === selectedCategory);
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(
          (p) =>
            (p.title && p.title.toLowerCase().includes(query)) ||
            (p.description && p.description.toLowerCase().includes(query)),
        );
      }
      setFilteredProducts(result);
    }, [searchQuery, selectedCategory, locationFilter, allProducts]),
  );

  // 💡 ማጂክ: ፐርፎርማንስ ንምዕባይ `useMemo` ተጠቒምና ኣለና (ስክሪን ሪፍሬሽ ከይገብር)
  const mixedProductsData = useMemo(() => {
    let mixed: any[] = [];
    let proIdx = 0;

    filteredProducts.forEach((product, index) => {
      mixed.push(product);
      if ((index + 1) % 24 === 0 && proProducts.length > 0) {
        const adToInject = proProducts[proIdx % proProducts.length];
        mixed.push({
          ...adToInject,
          injectedAd: true,
          renderKey: `injected_${index}_${adToInject._id}`,
        });
        proIdx++;
      }
    });
    return mixed;
  }, [filteredProducts, proProducts]);

  // ==========================================================
  // 🚀 ምዕራፍ 8: ዲዛይን ላዕለዋይ ክፋል
  // ==========================================================
  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={{ height: HEADER_HEIGHT + 25 }} />

      {/* 💡 ማጂክ: እታ ሓዳስ ርእሳ ዝኸኣለት ኮምፖነንት ኣብዚ ኣትያ ኣላ */}
      {proProducts.length > 0 && (
        <ProCarousel proProducts={proProducts} router={router} />
      )}

      <View style={styles.categoriesContainer}>
        <FlatList
          ref={categoryListRef}
          data={categoriesData}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          // 💡 ማጂክ 1: ንኹለን ካታጎሪታት ብሓንሳብ ኣንቢቡ ስፍሓተን (Width) ምእንቲ ክፈልጥ
          initialNumToRender={20}
          // 💡 ማጂክ 2: እንተደኣ ጌጋ ኣጋጢሙዎ እንደገና ክዕሪ (Fallback)
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              categoryListRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
                viewPosition: 0.5,
              });
            }, 500);
          }}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[
                styles.catPill,
                selectedCategory === item.id && styles.catPillActive,
              ]}
              onPress={() => {
                setSelectedCategory(item.id);
                // 💡 ማጂክ 3: ሰማያዊ ሕብሪ ምስ ሓዘት ብልስሉስ ንማእከል ክትስሕብ
                setTimeout(() => {
                  try {
                    categoryListRef.current?.scrollToIndex({
                      index: index,
                      animated: true,
                      viewPosition: 0.5, // ንማእከል ስክሪን
                    });
                  } catch (e) {}
                }, 100);
              }}
            >
              <Text
                style={
                  selectedCategory === item.id
                    ? styles.catTextActive
                    : styles.catText
                }
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );

  // ==========================================================
  // 🚀 ምዕራፍ 9: ዲዛይን ናይ ሓደ ኣቕሓ (Product Card UI)
  // ==========================================================
  const renderProduct = ({ item }: any) => {
    const savedByArray = item.savedBy || [];
    const saveCount = savedByArray.length;
    const myId = user ? user._id || user.id : null;
    const isSavedByMe = myId ? savedByArray.includes(myId) : false;

    const vendorId = item.sellerId || item.vendorId || item.userId;
    const vendorPicUrl = vendorProfiles[vendorId];
    const canDelete =
      user &&
      (user.role === "admin" || user.role === "owner" || vendorId === myId);

    return (
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
              <FontAwesome5 name={item.icon || "box"} size={40} color="#999" />
            </View>
          )}

          {canDelete && (
            <View style={styles.actionTopLeft}>
              <TouchableOpacity
                style={styles.smallActionBtn}
                onPress={() => handleDeleteProduct(item._id, item.title)}
              >
                <Ionicons name="trash" size={14} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.actionTopRight}>
            <TouchableOpacity
              style={styles.smallActionBtn}
              onPress={() => handleToggleSave(item._id, savedByArray)}
            >
              <Ionicons
                name={isSavedByMe ? "heart" : "heart-outline"}
                size={14}
                color={isSavedByMe ? "#ff4757" : "#555"}
              />
            </TouchableOpacity>
            {saveCount > 0 && (
              <View style={styles.saveCountBadge}>
                <Text style={styles.saveCountText}>{saveCount}</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.userAvatarContainer}
          activeOpacity={0.7}
          onPress={() => {
            if (vendorId) router.push(`/profile/${vendorId}` as any);
          }}
        >
          <Image
            source={{
              uri: vendorPicUrl
                ? getImageUrl(vendorPicUrl)
                : "https://via.placeholder.com/50",
            }}
            style={styles.userAvatar}
          />
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          {item.adType === "advert" || item.injectedAd ? (
            <Text style={styles.adPriceTextGrid}>
              <FontAwesome5 name="bullhorn" size={10} /> መወዓውዒ (Ad)
            </Text>
          ) : (
            <Text style={styles.priceTextGrid}>{item.price} Br</Text>
          )}
          <Text style={styles.titleTextGrid} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.locationTextGrid} numberOfLines={1}>
            <Ionicons name="location" size={10} /> {item.location}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // ==========================================================
  // 🚀 ምዕራፍ 10: ጠቕላላ ስክሪን (Main Render)
  // ==========================================================
  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.animatedHeaderContainer,
          { transform: [{ translateY }] },
        ]}
      >
        <View style={styles.topNav}>
          <TouchableOpacity
            style={styles.regionBtn}
            onPress={() => setShowRegionModal(true)}
          >
            <Ionicons name="location" size={16} color="#fff" />
            <Text style={styles.regionBtnText} numberOfLines={1}>
              {locationDisplayName}
            </Text>
          </TouchableOpacity>

          <View style={styles.searchWrapper}>
            <Ionicons
              name="search"
              size={18}
              color="#999"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="ድለይ (Search)..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {user && (user.role === "admin" || user.role === "owner") && (
            <TouchableOpacity
              style={styles.adminBtn}
              onPress={() => router.push("/dashboard" as any)}
            >
              <FontAwesome5 name="shield-alt" size={16} color="#fff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.themeToggle}>
            <Ionicons name="moon" size={20} color="#029eff" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#029eff" />
          <Text style={{ marginTop: 10, color: "#666" }}>ዕዳጋ ይዳሎ ኣሎ...</Text>
        </View>
      ) : (
        <Animated.FlatList
          data={mixedProductsData}
          keyExtractor={(item) => item.renderKey || item._id}
          renderItem={renderProduct}
          ListHeaderComponent={renderHeader}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: 20 }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true },
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#029eff"]}
              progressViewOffset={HEADER_HEIGHT + 10}
            />
          }
          ListEmptyComponent={() => (
            <View style={{ alignItems: "center", marginTop: 50 }}>
              <Ionicons name="search" size={50} color="#ccc" />
              <Text style={{ color: "#888", marginTop: 10 }}>
                ኣብዚ ቦታን ምድብን ዝተመዝገበ ንብረት የለን።
              </Text>
            </View>
          )}
        />
      )}

      {/* ፖፕ-ኣፕታት */}
      <Modal visible={showRegionModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              {activeRegionStep ? (
                <TouchableOpacity onPress={() => setActiveRegionStep(null)}>
                  <Text style={{ color: "#029eff", fontWeight: "bold" }}>
                    ⬅️ ተመለስ
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={{ width: 60 }} />
              )}
              <Text style={styles.modalTitle}>
                {activeRegionStep ? activeRegionStep : "ክልል ምረጽ"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowRegionModal(false);
                  setActiveRegionStep(null);
                }}
              >
                <Ionicons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {!activeRegionStep ? (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => {
                    setLocationFilter("all");
                    setLocationDisplayName("Region");
                    setShowRegionModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.listText,
                      { color: "#029eff", fontWeight: "bold" },
                    ]}
                  >
                    <Ionicons name="globe-outline" size={16} /> ኩለን ቦታታት (All
                    Regions)
                  </Text>
                </TouchableOpacity>
              ) : null}
              {activeRegionStep ? (
                <>
                  <TouchableOpacity
                    style={styles.listItem}
                    onPress={() => {
                      setLocationFilter(activeRegionStep);
                      setLocationDisplayName(activeRegionStep);
                      setShowRegionModal(false);
                      setActiveRegionStep(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.listText,
                        { color: "#029eff", fontWeight: "bold" },
                      ]}
                    >
                      ሙሉእ {activeRegionStep}
                    </Text>
                  </TouchableOpacity>
                  {locationsData
                    .find((r) => r.region === activeRegionStep)
                    ?.cities.map((c, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.listItem}
                        onPress={() => {
                          setLocationFilter(`${activeRegionStep}, ${c}`);
                          setLocationDisplayName(c);
                          setShowRegionModal(false);
                          setActiveRegionStep(null);
                        }}
                      >
                        <Text style={styles.listText}>{c}</Text>
                      </TouchableOpacity>
                    ))}
                </>
              ) : (
                locationsData.map((loc, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.listItem}
                    onPress={() => {
                      if (loc.cities.length > 0)
                        setActiveRegionStep(loc.region);
                      else {
                        setLocationFilter(loc.region);
                        setLocationDisplayName(loc.region);
                        setShowRegionModal(false);
                      }
                    }}
                  >
                    <Text style={styles.listText}>{loc.region}</Text>
                    {loc.cities.length > 0 ? (
                      <Ionicons name="chevron-forward" size={18} color="#999" />
                    ) : null}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ==========================================================
// 🚀 ምዕራፍ 11: ዲዛይን (Styles)
// ==========================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f8fa" },
  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginBottom: 15,
  },

  animatedHeaderContainer: {
    position: "absolute",
    top: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    left: 0,
    right: 0,
    zIndex: 100,
    height: HEADER_HEIGHT,
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    height: HEADER_HEIGHT,
  },

  headerSection: { backgroundColor: "#f5f8fa" },

  regionBtn: {
    backgroundColor: "#029eff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  regionBtnText: {
    color: "#fff",
    fontSize: 13,
    marginLeft: 5,
    fontWeight: "bold",
    maxWidth: 80,
  },
  searchWrapper: { flex: 1, position: "relative", marginLeft: 10 },
  searchIcon: { position: "absolute", left: 12, top: 10, zIndex: 1 },
  searchInput: {
    backgroundColor: "#f0f2f5",
    borderRadius: 20,
    paddingVertical: 8,
    paddingLeft: 35,
    paddingRight: 15,
    fontSize: 14,
  },
  adminBtn: {
    backgroundColor: "#e74c3c",
    padding: 10,
    borderRadius: 20,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  themeToggle: {
    backgroundColor: "#e6f4f1",
    padding: 10,
    borderRadius: 20,
    marginLeft: 10,
  },

  carouselContainer: { marginTop: 5, position: "relative", paddingBottom: 25 },
  carouselSlide: {
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#fff",
  },
  carouselImage: { width: "100%", height: "100%", resizeMode: "contain" },
  carouselOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.15)",
    marginHorizontal: 4,
  },
  dotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#f1c40f",
  },

  proBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#f1c40f",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 4,
  },
  carouselInfo: {
    position: "absolute",
    bottom: 15,
    left: 15,
    right: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  carouselTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  carouselLocation: { color: "#eee", fontSize: 11, marginTop: 2 },
  adPriceBadge: {
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  adPriceText: { color: "#4cd137", fontSize: 13, fontWeight: "bold" },

  categoriesContainer: { paddingVertical: 15, paddingLeft: 15 },
  catPill: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    elevation: 1,
  },
  catPillActive: { backgroundColor: "#029eff", borderColor: "#029eff" },
  catText: { color: "#555", fontSize: 13, fontWeight: "500" },
  catTextActive: { color: "#fff", fontSize: 13, fontWeight: "bold" },

  productCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 10,
    elevation: 3,
    position: "relative",
  },
  imageContainer: {
    width: "100%",
    height: 130,
    borderRadius: 10,
    backgroundColor: "#fafafa",
    overflow: "hidden",
    position: "relative",
  },
  productImg: { width: "100%", height: "100%", resizeMode: "cover" },
  placeholderImg: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  actionTopLeft: { position: "absolute", top: 8, left: 8, zIndex: 5 },
  actionTopRight: {
    position: "absolute",
    top: 8,
    right: 8,
    alignItems: "center",
    zIndex: 5,
  },
  smallActionBtn: {
    backgroundColor: "rgba(255,255,255,0.9)",
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  saveCountBadge: {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  saveCountText: { color: "#fff", fontSize: 9, fontWeight: "bold" },

  userAvatarContainer: {
    position: "absolute",
    top: 120,
    left: 15,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#029eff",
    borderWidth: 2,
    borderColor: "#fff",
    overflow: "hidden",
    zIndex: 10,
    elevation: 4,
  },
  userAvatar: { width: "100%", height: "100%" },
  infoContainer: { marginTop: 20 },
  priceTextGrid: { fontSize: 16, fontWeight: "bold", color: "#029eff" },
  adPriceTextGrid: { fontSize: 13, fontWeight: "bold", color: "#f1c40f" },
  titleTextGrid: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
    marginVertical: 4,
  },
  locationTextGrid: { fontSize: 11, color: "#888" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingBottom: 15,
    marginBottom: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  listItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  listText: { fontSize: 15, color: "#444" },
});
