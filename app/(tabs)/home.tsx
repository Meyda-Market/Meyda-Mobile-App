// ==========================================================
// 🚀 ምዕራፍ 1: መእተዊ (Imports)
// ==========================================================
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
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
  View
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
const { width: screenWidth } = Dimensions.get("window");
const API_BASE_URL = "https://meyda-app.onrender.com";
const HEADER_HEIGHT = 50;

// 💡 ማጂክ: ኮምፒተር (Web) እንተኾይኑ ንስክሪን ኣብ 3 ይመቕሎ፣ ሞባይል እንተኾይኑ 82% ይገብሮ
// እዚ ነቲ ናይ ኣድቨርታይዝ ባነር ጎኒን ቁመትን መዐረዪ እዩ
const isWebWide = Platform.OS === "web" && screenWidth > 800;
const CAROUSEL_ITEM_WIDTH = isWebWide ? screenWidth / 3.2 : screenWidth * 0.6;
const CAROUSEL_SPACING = isWebWide
  ? 10
  : (screenWidth - CAROUSEL_ITEM_WIDTH) / 2;

// 💡 ሓገዚት ፋንክሽን
const getImageUrl = (imgStr: string) => {
  if (!imgStr) return "https://via.placeholder.com/150";
  if (imgStr.startsWith("http")) return imgStr;
  return `${API_BASE_URL}${imgStr}`;
};

// ==========================================================
// 🚀 ምዕራፍ 2: ርእሳ ዝኸኣለት "Ping-Pong" ባነር (ProCarousel)
// ==========================================================
const ProCarousel = ({ proProducts, router }: any) => {
  const { user } = useContext(AuthContext);
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
        onPress={() => {
          const myId = user?._id || user?.id;
          // እዚ ኣቕሓ ናተይ ድዩ ወይስ ናይ ካልእ? ኢሉ የረጋግጽ
          const isMyProduct =
            String(item.sellerId || item.vendorId || item.userId) ===
            String(myId);

          if (isMyProduct) {
            // 💡 ማጂክ: ናይ ባዕልኻ ኣቕሓ እንተኾይኑ ብቐጥታ ናብ ኤዲት (Edit) ይወስደካ!
            router.push(`/edit-product/${item._id || item.id}` as any);
          } else {
            // 💡 ናይ ካልእ ሰብ እንተኾይኑ ግና ናብቲ ንቡር መደወሊ (Product Detail) ይወስደካ
            router.push(`/product/${item._id || item.id}` as any);
          }
        }}
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

              {/* 💡 ሎኬሽን ኮሜንት ጌርናዮ ኣለና (ኣይረአን እዩ)
        <Text style={styles.carouselLocation}>
          <Ionicons name="location" size={12} color="#eee" />{" "}
          {item.location}
        </Text>
        */}
            </View>

            {/* 💡 ዋጋ (Price) ኮሜንት ጌርናዮ ኣለና (ኣይረአን እዩ)
      <View style={styles.adPriceBadge}>
        <Text style={styles.adPriceText}>{item.price} Br</Text>
      </View>
      */}
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
// 🚀 ምዕራፍ 3: ቀወምቲ ሓበሬታታት (Constants)
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
  // 💡 ዳርክ ሞድ ሓንጎል ካብ ThemeContext ይጽዋዕ
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  // ==========================================================
  // 🚀 ምዕራፍ 4: መኽዘን ኩነታት (State Management)
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

  const categoryListRef = useRef<any>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const diffClamp = Animated.diffClamp(scrollY, 0, HEADER_HEIGHT + 30);
  const translateY = diffClamp.interpolate({
    inputRange: [0, HEADER_HEIGHT + 30],
    outputRange: [0, -(HEADER_HEIGHT + 30)],
  });

  // ==========================================================
  // 🚀 ምዕራፍ 5: ዳታ ካብ ሰርቨር ምጽዋዕ (Fetch API)
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
  // 🚀 ምዕራፍ 6: ናይ ልቢ (Save) & ንብረት ምድምሳስ (Delete)
  // ==========================================================

  // ==========================================================
  // 🚀 ምዕራፍ 7: መጻረዪ & ማጂክ Ad Injection
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
  // 🚀 ምዕራፍ 8: ዲዛይን ላዕለዋይ ክፋል (Header & Categories)
  // ==========================================================
  const renderHeader = () => (
    <View
      style={[
        styles.headerSection,
        // 💡 ሄደር ናብ ዳርክ ሞድ ይቀየር
        { backgroundColor: isDarkMode ? "#121212" : "#FFFFFF" },
      ]}
    >
      <View style={{ height: HEADER_HEIGHT + 25 }} />

      {proProducts.length > 0 ? (
        <ProCarousel proProducts={proProducts} router={router} />
      ) : null}

      <View
        style={[
          styles.categoriesContainer,
          // 💡 ናይ ካተጎሪ ባይታ ናብ ዳርክ ሞድ ይቀየር
          { backgroundColor: isDarkMode ? "#121212" : "#FFFFFF" },
        ]}
      >
        <FlatList
          ref={categoryListRef}
          data={categoriesData}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          initialNumToRender={20}
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
                // 💡 ማጂክ: Active እንተኾይና ሰማያዊት ትኸውን (styles.catPillActive)፡ እንተዘይኮይና ናብ ዳርክ ሞድ ትቕየር
                selectedCategory === item.id
                  ? styles.catPillActive
                  : {
                      backgroundColor: isDarkMode ? "#333333" : "#FFFFFF",
                      borderColor: isDarkMode ? "#444" : "#eee",
                    },
              ]}
              onPress={() => {
                setSelectedCategory(item.id);
                setTimeout(() => {
                  try {
                    categoryListRef.current?.scrollToIndex({
                      index: index,
                      animated: true,
                      viewPosition: 0.5,
                    });
                  } catch (e) {}
                }, 100);
              }}
            >
              <Text
                style={[
                  selectedCategory === item.id
                    ? styles.catTextActive
                    : styles.catText,
                  // 💡 ማጂክ: Active እንተዘይኮይና ጥራሕ ዳርክ ሞድ ትለብስ (ጻዕዳ ወይ ጸሊም ጽሑፍ)
                  selectedCategory !== item.id && {
                    color: isDarkMode ? "#FFFFFF" : "#333333",
                  },
                ]}
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
  // 🚀 ምዕራፍ 9: ዲዛይን ናይ ሓደ ኣቕሓ (Product Card UI) - 100% Cleaned
  // ==========================================================
  const renderProduct = ({ item }: any) => {
    // 💡 ማጂክ: ኩሉ እቲ ጎስት ኮድ ጠፊኡ ኣሎ! ብቐጥታ ናብ ዲዛይን ንኣቱ።

    return (
      <TouchableOpacity
        style={[
          styles.productCard,
          { backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF" },
        ]}
        activeOpacity={0.8}
        onPress={() => {
          const myId = user?._id || user?.id;
          const isMyProduct =
            String(item.sellerId || item.vendorId || item.userId) ===
            String(myId);

          if (isMyProduct) {
            router.push(`/edit-product/${item._id || item.id}` as any);
          } else {
            router.push(`/product/${item._id || item.id}` as any);
          }
        }}
      >
        <View
          style={[
            styles.imageContainer,
            { backgroundColor: isDarkMode ? "#2A2A2A" : "#fafafa" },
          ]}
        >
          {item.images && item.images.length > 0 ? (
            <Image
              source={{ uri: getImageUrl(item.images[0]) }}
              style={styles.productImg}
            />
          ) : (
            <View style={styles.placeholderImg}>
              <FontAwesome5
                name={item.icon || "box"}
                size={40}
                color={isDarkMode ? "#666" : "#999"}
              />
            </View>
          )}
        </View>

        <View style={[styles.infoContainer, { marginTop: 8 }]}>
          {item.adType === "advert" || item.injectedAd ? (
            <Text style={styles.adPriceTextGrid}>
              <FontAwesome5 name="bullhorn" size={10} /> መወዓውዒ (Ad)
            </Text>
          ) : (
            <Text style={styles.priceTextGrid}>{item.price} Br</Text>
          )}

          <Text
            style={[
              styles.titleTextGrid,
              { color: isDarkMode ? "#FFFFFF" : "#333333" },
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          <Text
            style={[
              styles.locationTextGrid,
              { color: isDarkMode ? "#CCCCCC" : "#888888" },
            ]}
            numberOfLines={1}
          >
            <Ionicons
              name="location"
              size={10}
              color={isDarkMode ? "#CCCCCC" : "#888888"}
            />{" "}
            {item.location}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  // ==========================================================
  // 🚀 ምዕራፍ 10: ጠቕላላ ስክሪን (Main Render)
  // ==========================================================
  return (
    <SafeAreaView
      style={[
        styles.container,
        // 💡 ዋና ድሕረ-ባይታ ፔጅ ዳርክ ሞድ ይለብስ
        { backgroundColor: isDarkMode ? "#121212" : "#f5f8fa" },
      ]}
    >
      <Animated.View
        style={[
          styles.animatedHeaderContainer,
          { transform: [{ translateY }] },
        ]}
      >
        <View
          style={[
            styles.topNav,
            // 💡 ላዕለዋይ ናሕሲ (Top Nav) ዳርክ ሞድ ይለብስ
            { backgroundColor: isDarkMode ? "#121212" : "#FFFFFF" },
          ]}
        >
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
              // 💡 ኣይኮን ናይ ሰርች ኣብ ጸልማት ይበርህ
              color={isDarkMode ? "#AAAAAA" : "#999999"}
              style={styles.searchIcon}
            />
            {/* 💡 ማጂክ: Search Bar ድሕረ-ባይታኡን ጽሑፉን 100% ጽፉፍ ኮይኑ ተቐይሩ ኣሎ */}
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: isDarkMode ? "#1E1E1E" : "#f0f2f5",
                  color: isDarkMode ? "#FFFFFF" : "#000000",
                },
              ]}
              placeholder="ድለ (Search)..."
              placeholderTextColor={isDarkMode ? "#888888" : "#999999"}
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

          <TouchableOpacity
            style={[
              styles.themeToggle,
              { backgroundColor: isDarkMode ? "#333" : "#e6f4f1" },
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
      </Animated.View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#029eff" />
          <Text style={{ marginTop: 10, color: isDarkMode ? "#AAA" : "#666" }}>
            ዕዳጋ ይዳሎ ኣሎ...
          </Text>
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
              tintColor={isDarkMode ? "#029eff" : undefined}
              progressViewOffset={HEADER_HEIGHT + 10}
            />
          }
          ListEmptyComponent={() => (
            <View style={{ alignItems: "center", marginTop: 50 }}>
              <Ionicons
                name="search"
                size={50}
                color={isDarkMode ? "#444" : "#ccc"}
              />
              <Text
                style={{ color: isDarkMode ? "#AAA" : "#888", marginTop: 10 }}
              >
                ኣብዚ ቦታን ምድብን ዝተመዝገበ ንብረት የለን።
              </Text>
            </View>
          )}
        />
      )}

      {/* ==========================================================
          🚀 ፖፕ-ኣፕታት (Modal) 
          💡 ማጂክ: ንቦነስ (Bonus) ኢለ ነዚ Modal እውን ዳርክ ሞድ ኣልቢሰዮ ኣለኹ 
          ========================================================== */}
      <Modal visible={showRegionModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: isDarkMode ? "#1E1E1E" : "#fff" },
            ]}
          >
            <View
              style={[
                styles.modalHeader,
                { borderColor: isDarkMode ? "#333" : "#eee" },
              ]}
            >
              {activeRegionStep ? (
                <TouchableOpacity onPress={() => setActiveRegionStep(null)}>
                  <Text style={{ color: "#029eff", fontWeight: "bold" }}>
                    ⬅️ ተመለስ
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={{ width: 60 }} />
              )}
              <Text
                style={[
                  styles.modalTitle,
                  { color: isDarkMode ? "#FFF" : "#333" },
                ]}
              >
                {activeRegionStep ? activeRegionStep : "ክልል ምረጽ"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowRegionModal(false);
                  setActiveRegionStep(null);
                }}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={isDarkMode ? "#AAA" : "#999"}
                />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {!activeRegionStep ? (
                <TouchableOpacity
                  style={[
                    styles.listItem,
                    { borderColor: isDarkMode ? "#333" : "#f0f0f0" },
                  ]}
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
                    style={[
                      styles.listItem,
                      { borderColor: isDarkMode ? "#333" : "#f0f0f0" },
                    ]}
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
                        style={[
                          styles.listItem,
                          { borderColor: isDarkMode ? "#333" : "#f0f0f0" },
                        ]}
                        onPress={() => {
                          setLocationFilter(`${activeRegionStep}, ${c}`);
                          setLocationDisplayName(c);
                          setShowRegionModal(false);
                          setActiveRegionStep(null);
                        }}
                      >
                        <Text
                          style={[
                            styles.listText,
                            { color: isDarkMode ? "#CCC" : "#444" },
                          ]}
                        >
                          {c}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </>
              ) : (
                locationsData.map((loc, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.listItem,
                      { borderColor: isDarkMode ? "#333" : "#f0f0f0" },
                    ]}
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
                    <Text
                      style={[
                        styles.listText,
                        { color: isDarkMode ? "#CCC" : "#444" },
                      ]}
                    >
                      {loc.region}
                    </Text>
                    {loc.cities.length > 0 ? (
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={isDarkMode ? "#666" : "#999"}
                      />
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
  // ጠቕላላ ናይቲ ፕሮ ኣድ ባነር መስተኻኸሊ
  carouselContainer: { marginTop: 5, position: "relative", paddingBottom: 10 },
  carouselSlide: {
    height: 120,
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#1E1E1E", // 💡 ንካሩሰል ዳርክ ባይታ
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
    width: 4,
    height: 4,
    borderRadius: 4,
    backgroundColor: "rgba(150,150,150,0.5)",
    marginHorizontal: 4,
  },
  dotActive: {
    width: 6,
    height: 6,
    borderRadius: 5,
    backgroundColor: "#f1c40f",
  },
  // ናይ ፕሮ ትብል ኣብ ባነር ዘላ ፅሕፍቲ ቦታን መጠንን
  proBadge: {
    position: "absolute",
    top: 5, // 👈 ናብ ላዕለዋይ ኩርናዕ ጽግዕ ክትብል
    left: 5, // 👈 ናብ ጸጋማይ ኩርናዕ ጽግዕ ክትብል
    backgroundColor: "#f1c40f",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5, // 👈 ንእሽቶ ጌርናያ
    paddingVertical: 2, // 👈 ንእሽቶ ጌርናያ
    borderRadius: 8,
    zIndex: 8,
  },
  proBadgeText: {
    fontWeight: "bold",
    fontSize: 6, // 👈 ጽሑፋ ኣንኢስናዮ (ካብ 12 ናብ 6)
    color: "#333",
    marginLeft: 3,
  },
  carouselInfo: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  carouselTitle: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  carouselLocation: { color: "#eee", fontSize: 8, marginTop: 2 },
  adPriceBadge: {
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  adPriceText: { color: "#4cd137", fontSize: 10, fontWeight: "bold" },

  categoriesContainer: { paddingVertical: 10, paddingLeft: 10 },
  catPill: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 7,
    elevation: 1,
  },
  catPillActive: { backgroundColor: "#029eff", borderColor: "#029eff" },
  catText: { color: "#555", fontSize: 13, fontWeight: "500" },
  catTextActive: { color: "#fff", fontSize: 13, fontWeight: "bold" },

  // ናይ ኣቕሑ መጠን መስተኻኸሊ
  productCard: {
    width: "49%",
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 10,
    elevation: 3,
    //marginBottom: 2,
    position: "relative",
  },
  imageContainer: {
    width: "100%",
    height: 150,
    borderRadius: 1,
    backgroundColor: "#fafafa",
    overflow: "hidden",
    position: "relative",
  },
  productImg: { width: "100%", height: "100%", resizeMode: "contain" },
  placeholderImg: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    //backgroundColor: "#fff",
    alignItems: "center",
  },

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
