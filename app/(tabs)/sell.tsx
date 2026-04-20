// ==========================================================
// 🚀 ምዕራፍ 1: መእተዊ (Imports)
// ==========================================================
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useContext, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";

const API_BASE_URL = "https://meyda-app.onrender.com";

// ==========================================================
// 🚀 ምዕራፍ 2: መኽዘን ሓበሬታታት (Constants)
// ==========================================================
const categoriesData = [
  { id: "vehicles", name: "ተሽከርከርቲ", icon: "car" },
  { id: "electronics", name: "ኤሌክትሮኒክስ", icon: "tv" },
  { id: "mobile", name: "ሞባይል", icon: "phone-portrait" },
  { id: "laptop", name: "ላፕቶፕ", icon: "laptop" },
  { id: "music", name: "ሙዚቃ መሳርሒ", icon: "musical-notes" },
  { id: "fashion", name: "ፋሽን", icon: "shirt" },
  { id: "houses", name: "ገዛውቲ", icon: "home" },
  { id: "sports", name: "ስፖርት", icon: "football" },
  { id: "furniture", name: "ፈርኒቸር", icon: "bed" },
  { id: "books", name: "መፃሕፍቲ", icon: "book" },
  { id: "cosmetics", name: "ኮስሞቲክስ", icon: "color-palette" },
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
  { region: "Harar", cities: [] },
  { region: "Benshangul", cities: [] },
  { region: "Gambela", cities: [] },
  { region: "driedawa", cities: [] },
];

// 💡 ሓዱሽ ማጂክ: መደበኛ ፓኬጃት (Regular Packages ን ምዝርጋሕ ኣቕሑት)
const regularPackages = [
  { id: "r1", name: "መደበኛ ን 1 ሰሙን", price: 100 },
  { id: "r2", name: "መደበኛ ን 1 ወርሒ", price: 300 },
  { id: "r3", name: "መደበኛ ን 3 ወርሒ", price: 800 },
  { id: "r4", name: "መደበኛ ን 6 ወርሒ", price: 1500 },
  { id: "r5", name: "መደበኛ ን 1 ዓመት", price: 2500 },
];

// ናይ PRO ባነር ፓኬጃት
const marketProPackages = [
  { id: "m1", name: "ኣብ ላዕለዋይ ባነር ን 3 መዓልቲ", price: 300 },
  { id: "m2", name: "ኣብ ላዕለዋይ ባነር ን 1 ሰሙን", price: 600 },
  { id: "m3", name: "ኣብ ላዕለዋይ ባነር ን 1 ወርሒ", price: 2000 },
];
const advertProPackages = [
  { id: "a1", name: "መወዓውዒ ን 1 ወርሒ", price: 3000 },
  { id: "a2", name: "መወዓውዒ ን 3 ወርሒ", price: 8000 },
];

const ramOptions = ["2GB", "4GB", "8GB", "12GB", "16GB", "32GB", "64GB"];
const storageOptions = [
  "8GB",
  "16GB",
  "32GB",
  "64GB",
  "128GB",
  "256GB",
  "512GB",
  "1TB",
  "2TB",
];
const conditionOptions = [
  { id: "new", name: "ሓድሽ (New)" },
  { id: "slightly_used", name: "ቁሩብ ዝተጠቕመ (Slightly Used)" },
  { id: "used", name: "ዝተጠቕመ (Used)" },
];

export default function SellScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  // ==========================================================
  // 🚀 ምዕራፍ 3: መኽዘን ኩነታት (State Management)
  // ==========================================================
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");

  const [category, setCategory] = useState<any>(null);
  const [condition, setCondition] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [ram, setRam] = useState("");
  const [storage, setStorage] = useState("");

  const [adType, setAdType] = useState("market");
  const [isPro, setIsPro] = useState(false);
  const [showProMenu, setShowProMenu] = useState(false);

  // 💡 ማስተር ስዊችን ናይ ፓኬጅ ኩነታትን (Global & User Subscription Status)
  const [isPaymentRequired, setIsPaymentRequired] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false); // ድኳኑ ክፉት ድዩ?

  const [showCatModal, setShowCatModal] = useState(false);
  const [showLocModal, setShowLocModal] = useState(false);
  const [activeRegionStep, setActiveRegionStep] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState(""); // 'regular', 'market_pro', 'advert_pro'
  const [selectedPkgPrice, setSelectedPkgPrice] = useState(0);

  const [selectionConfig, setSelectionConfig] = useState<{
    visible: boolean;
    type: string;
    title: string;
    data: any[];
  }>({ visible: false, type: "", title: "", data: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // ==========================================================
  // 🚀 ምዕራፍ 4: መበገሲ ማጂክ (Fetch Settings)
  // ==========================================================
  useFocusEffect(
    useCallback(() => {
      if (user && user.phone)
        setPhone(user.phone.replace("+251", "").replace(/^0+/, ""));
      fetchGlobalSettings();
      // 💡 ንግዚኡ ን መፈተኒ: user ፓኬጅ ከም ዘይገዝአ ጌርና ንጅምር (Backend ምስ ተተኽለ user.hasSubscription ይኸውን)
      setHasActiveSubscription(false);
    }, [user]),
  );

  const fetchGlobalSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/stats`);
      if (res.ok) {
        const data = await res.json();
        setIsPaymentRequired(data.requireSubscription || false);
      }
    } catch (error) {
      console.log("Settings fetch error", error);
    }
  };

  // ==========================================================
  // 🚀 ምዕራፍ 5: ሓገዝቲ ፋንክሽናት (Helpers)
  // ==========================================================
  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert("ይቕሬታ", "ካብ 5 ንላዕሊ ኣይከኣልን።");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setImages([...images, result.assets[0].uri]);
  };
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const openPayment = (type: string) => {
    setPaymentType(type);
    setSelectedPkgPrice(0);
    setShowProMenu(false);
    setShowPaymentModal(true);
  };

  const confirmPayment = (method: string) => {
    if (selectedPkgPrice === 0) {
      Alert.alert("መጠንቀቕታ", "ፓኬጅ ምረጹ!");
      return;
    }
    Alert.alert("ዕውት", `✅ ብ ${method} ዝተፈጸመ ክፍሊት ተቐቢልና ኣለና!`);
    setShowPaymentModal(false);

    // 💡 ማጂክ: እንታይ ዓይነት ፓኬጅ እዩ ገዚኡ?
    if (paymentType === "regular") {
      setHasActiveSubscription(true); // ድኳኑ ክፉት ኮይኑ ኣሎ
      Alert.alert("እንቋዕ ሓጎሰኩም!", "ድኳንኩም ብዓወት ተኸፊቱ ኣሎ። ሕጂ ንብረትኩም ብነጻ ዝርግሑ!");
    } else if (paymentType === "advert_pro") {
      setIsPro(true);
      setAdType("advert");
    } else {
      setIsPro(true);
      setAdType("market");
    }
  };

  const handleGenericSelect = (item: any) => {
    if (selectionConfig.type === "ram") setRam(item);
    if (selectionConfig.type === "storage") setStorage(item);
    if (selectionConfig.type === "condition") setCondition(item);
    setSelectionConfig({ ...selectionConfig, visible: false });
  };
  // ==========================================================
  // 🚀 ምዕራፍ 6: ናብ ሰርቨር ምልኣኽ (Submit Logic)
  // ==========================================================
  const submitAd = async () => {
    if (!user) {
      Alert.alert("መጠንቀቕታ", "መጀመርታ ሎግ-ኢን ግበሩ!");
      router.push("/" as any);
      return;
    }

    // 💡 ሓዱሽ ማጂክ: PRO እንተኾይኑ፡ ናይ መደበኛ ፓኬጅ ግዴታ የብሉን!
    if (
      isPaymentRequired &&
      !hasActiveSubscription &&
      adType === "market" &&
      !isPro
    ) {
      Alert.alert("ክፍሊት የድሊ", "ንብረት ንምዝርጋሕ ድኳን (Package) ምክራይ ግዴታ እዩ።");
      openPayment("regular");
      return;
    }

    // 💡 ማጂክ 3: Advert (መወዓውዒ) እንተኾይኑ ቦታ (Region) ግዴታ ኣይኮነን
    if (adType === "market") {
      if (
        !title ||
        !price ||
        !category ||
        !region ||
        !phone ||
        images.length === 0 ||
        !condition
      ) {
        Alert.alert("ጌጋ", "ስም፣ ዋጋ፣ ካታጎሪ፣ ኩነታት፣ ቦታ፣ ስልክን ስእልን ግዴታ እዩ!");
        return;
      }
    } else {
      if (!title || images.length === 0) {
        Alert.alert("ጌጋ", "ስም ትካልን እንተወሓደ ሓንቲ ስእሊ ባነርን ግዴታ እዩ!");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const myId = user?._id || user?.id || "";

      formData.append("title", title || "No Title");
      formData.append(
        "price",
        adType === "market" ? price.replace(/[^0-9]/g, "") : "0",
      );
      formData.append(
        "category",
        adType === "market" ? category?.id || "" : "advert",
      );
      formData.append("condition", condition?.id || "new");

      // 💡 Advert እንተኾይኑ ቦታ Optional እዩ
      const locValue = city ? `${region}, ${city}` : region || "";
      formData.append(
        "location",
        adType === "advert" && !locValue ? "All Regions" : locValue,
      );

      let finalDesc = description.trim()
        ? description
        : adType === "advert"
          ? "ፕሪምየም መወዓውዒ"
          : "ተወሳኺ መግለጺ የለን";
      if (
        adType === "market" &&
        (category?.id === "mobile" || category?.id === "laptop")
      ) {
        finalDesc += `\n\n🛠️ ቴክኒካዊ ሓበሬታ:\nRAM: ${ram || "N/A"} | Storage: ${storage || "N/A"}`;
      }
      formData.append("description", finalDesc);

      let finalPhone = phone
        ? `+251${phone.replace(/^0+/, "")}`
        : user?.phone || "+251900000000";
      formData.append("phone", finalPhone);

      formData.append("adType", adType || "market");

      // 💡 ማጂክ 1: isPro ከም String ንሰድዶ ኣለና (ኣብ home.tsx ከነስተኻኽሎ ኢና)
      formData.append("isPro", isPro ? "true" : "false");
      formData.append("icon", category?.icon || "bullhorn");

      formData.append("sellerId", myId);
      formData.append("vendorId", myId);
      formData.append("userId", myId);
      formData.append("vendor", myId);

      formData.append("ram", ram || "");
      formData.append("storage", storage || "");

      images.forEach((imageUri, index) => {
        let filename = imageUri.split("/").pop() || `image${index}.jpg`;
        if (!filename.includes(".")) filename += ".jpg";
        const uri =
          Platform.OS === "android" && !imageUri.startsWith("file://")
            ? `file://${imageUri}`
            : imageUri;
        formData.append("images", {
          uri,
          name: filename,
          type: "image/jpeg",
        } as any);
      });

      let token = await AsyncStorage.getItem("meydaToken");
      if (!token && user?.token) token = user.token;

      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setShowSuccess(true);
        setTitle("");
        setPrice("");
        setDescription("");
        setImages([]);
        setRam("");
        setStorage("");
        setCondition(null);
        setPhone("");
        setIsPro(false);
      } else {
        const err = await response.text();
        Alert.alert("ጌጋ ካብ ዳታቤዝ", `ሰርቨር ኣይተቐበሎን!\n\n${err.substring(0, 100)}`);
      }
    } catch (error) {
      Alert.alert("ጌጋ", "ኢንተርነትኩም ኣረጋግጹ።");
    } finally {
      setIsSubmitting(false);
    }
  };
  // ==========================================================
  // 🚀 ምዕራፍ 7: ዲዛይን ጠቕላላ ፔጅ (Main Render)
  // ==========================================================
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* 7.1 Header & PRO Top Button */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ንብረት መዝግብ (Post Ad)</Text>
          <TouchableOpacity
            style={styles.proBtnTop}
            onPress={() => setShowProMenu(!showProMenu)}
          >
            <FontAwesome5 name="crown" size={12} color="#333" />
            <Text style={styles.proBtnTopText}>PRO</Text>
          </TouchableOpacity>
        </View>

        {showProMenu && (
          <View style={styles.proDropdown}>
            <TouchableOpacity
              style={styles.proDropdownItem}
              onPress={() => openPayment("market_pro")}
            >
              <Ionicons name="arrow-up-circle" size={18} color="#029eff" />
              <Text style={styles.proDropdownText}>
                PRO Market (ኣብ ላዕሊ ስቐሎ)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.proDropdownItem, { borderBottomWidth: 0 }]}
              onPress={() => openPayment("advert_pro")}
            >
              <Ionicons name="megaphone" size={18} color="#d4af37" />
              <Text style={[styles.proDropdownText, { color: "#d4af37" }]}>
                PRO Advert (መወዓውዒ)
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 💡 7.2 ሓዱሽ ማጂክ: ዳይናሚክ ሄደር (Dynamic Dynamic Banners) */}
          {!isPaymentRequired ? (
            /* 🟡 Free Mode (ብነጻ) */
            <View
              style={[styles.mainPromoCard, { backgroundColor: "#f1c40f" }]}
            >
              <Text style={[styles.mainPromoTitle, { color: "#333" }]}>
                <Ionicons name="gift" size={18} /> 🎉 ብነጻ ንብረትኩም ሽጡ!
              </Text>
              <Text style={[styles.mainPromoDesc, { color: "#555" }]}>
                ንብረትኩም ብነጻ ኣምዚጊብኩም ቀልጢፍኩም ሽጡ። ክፍሊት ኣየድልየኩምን እዩ።
              </Text>
            </View>
          ) : isPaymentRequired && hasActiveSubscription ? (
            /* 🟢 Active Subscription (ፓኬጅ ንዘለዎ) */
            <View style={styles.activeSubCard}>
              <Text style={styles.activeSubTitle}>
                <Ionicons name="checkmark-circle" size={18} /> ድኳንኩም ንጡፍ እዩ
                (Premium Vendor)
              </Text>
            </View>
          ) : (
            /* 🔵 Require Subscription (ክፍሊት ዝደሊ) */
            <View style={styles.bluePromoCard}>
              <Text style={styles.bluePromoTitle}>
                <Ionicons name="storefront" size={18} /> ድኳን ተኻረዩ (Premium
                Vendor)
              </Text>
              <Text style={styles.bluePromoDesc}>
                ንብረትኩም ቀልጢፉ ንኽሽየጥን ንብዙሓት ሰባት ንኽበጽሕን ብዝተፈላለዩ ኣማራጺታት ፓኬጅ ምረጹ።
              </Text>
              <TouchableOpacity
                style={styles.orangePkgBtn}
                onPress={() => openPayment("regular")}
              >
                <Text style={styles.orangePkgBtnText}>
                  ፓኬጅ ምረፅ (View Packages)
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 7.3 ፎርም (Form Inputs) */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>ስእልታት ወይ ባነር ({images.length}/5)</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imageScroll}
            >
              {images.map((uri, index) => (
                <View key={index} style={styles.previewWrapper}>
                  <Image source={{ uri }} style={styles.previewImg} />
                  <TouchableOpacity
                    style={styles.removeImgBtn}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 5 && (
                <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                  <Ionicons name="camera" size={32} color="#999" />
                  <Text style={styles.uploadBoxText}>ስእሊ ወሰኽ</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {adType === "advert"
                ? "ስም ትካል (Business Name)"
                : "ስም ንብረት (Title)"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={
                adType === "advert"
                  ? "ንኣብነት፦ ስካይላይት ሆቴል"
                  : "ንኣብነት፦ Samsung S21 Ultra"
              }
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {adType === "market" && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>ዋጋ (Price in ETB)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>ቦታ (Location)</Text>
            <TouchableOpacity
              style={styles.selectorBtn}
              onPress={() => setShowLocModal(true)}
            >
              <Text style={{ color: region ? "#333" : "#999" }}>
                {city ? `${region}, ${city}` : region || "ክልልን ከተማን ምረጽ..."}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {adType === "market" && (
            <View style={styles.rowGroup}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>ምድብ (Category)</Text>
                <TouchableOpacity
                  style={styles.selectorBtn}
                  onPress={() => setShowCatModal(true)}
                >
                  <Text
                    style={{ color: category ? "#333" : "#999" }}
                    numberOfLines={1}
                  >
                    {category ? category.name : "ምረጽ..."}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>ኩነታት (Condition)</Text>
                <TouchableOpacity
                  style={styles.selectorBtn}
                  onPress={() =>
                    setSelectionConfig({
                      visible: true,
                      type: "condition",
                      title: "ኩነታት ኣቕሓ ምረጽ",
                      data: conditionOptions,
                    })
                  }
                >
                  <Text
                    style={{ color: condition ? "#333" : "#999", fontSize: 13 }}
                    numberOfLines={1}
                  >
                    {condition ? condition.name : "ምረጽ..."}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#999" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {adType === "market" &&
            (category?.id === "mobile" || category?.id === "laptop") && (
              <View style={styles.techGroup}>
                <Text style={styles.techLabel}>
                  <Ionicons name="hardware-chip" size={16} /> ቴክኒካዊ ሓበሬታ
                </Text>
                <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                  <TouchableOpacity
                    style={[
                      styles.selectorBtn,
                      { flex: 1, backgroundColor: "#fff" },
                    ]}
                    onPress={() =>
                      setSelectionConfig({
                        visible: true,
                        type: "ram",
                        title: "ክንደይ RAM?",
                        data: ramOptions,
                      })
                    }
                  >
                    <Text
                      style={{ color: ram ? "#333" : "#999", fontSize: 13 }}
                    >
                      {ram ? ram : "RAM ምረጽ"}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#999" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.selectorBtn,
                      { flex: 1, backgroundColor: "#fff" },
                    ]}
                    onPress={() =>
                      setSelectionConfig({
                        visible: true,
                        type: "storage",
                        title: "ክንደይ Storage?",
                        data: storageOptions,
                      })
                    }
                  >
                    <Text
                      style={{ color: storage ? "#333" : "#999", fontSize: 13 }}
                    >
                      {storage ? storage : "Storage ምረጽ"}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#999" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {adType === "advert" ? "መግለጺ ማስታወቂያ" : "መግለጺ (Description)"}
            </Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              placeholder="ዝርዝር ሓበሬታ ጸሓፍ..."
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {adType === "market" && (
            <View style={[styles.formGroup, styles.phoneGroup]}>
              <Text style={styles.phoneLabel}>
                <Ionicons name="call" size={14} /> መደወሊ ስልኪ
              </Text>
              <View style={styles.phoneInputWrapper}>
                <View style={styles.countryCode}>
                  <Text style={{ fontWeight: "bold" }}>🇪🇹 +251</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="911 23 45 67"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              isPaymentRequired &&
              !hasActiveSubscription &&
              adType === "market" &&
              !isPro
                ? { backgroundColor: "#ccc" }
                : {},
            ]}
            onPress={submitAd}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>
                {isPaymentRequired &&
                !hasActiveSubscription &&
                adType === "market" &&
                !isPro ? (
                  <>
                    <Ionicons name="lock-closed" size={18} /> ክልኩል (ፓኬጅ ግዛእ)
                  </>
                ) : (
                  <>
                    <Ionicons name="paper-plane" size={18} /> ሕጂ ለጥፍ (Post Ad)
                  </>
                )}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ========================================== */}
      {/* 🚀 ምዕራፍ 8: MODALS (ፖፕ-ኣፕታት) */}
      {/* ========================================== */}

      <Modal
        visible={selectionConfig.visible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectionConfig.title}</Text>
              <TouchableOpacity
                onPress={() =>
                  setSelectionConfig({ ...selectionConfig, visible: false })
                }
              >
                <Ionicons name="close" size={24} color="red" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {selectionConfig.data.map((item, idx) => {
                const isObject = typeof item === "object";
                const displayName = isObject ? item.name : item;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={styles.listItem}
                    onPress={() => handleGenericSelect(item)}
                  >
                    <Text style={styles.listText}>{displayName}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showCatModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ምድብ ምረጽ</Text>
              <TouchableOpacity onPress={() => setShowCatModal(false)}>
                <Ionicons name="close" size={24} color="red" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {categoriesData.map((cat, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.listItem}
                  onPress={() => {
                    setCategory(cat);
                    setShowCatModal(false);
                  }}
                >
                  <Text style={styles.listText}>
                    <Ionicons
                      name={cat.icon as any}
                      size={18}
                      color="#029eff"
                    />{" "}
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showLocModal} animationType="slide" transparent={true}>
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
                <Text></Text>
              )}
              <Text style={styles.modalTitle}>
                {activeRegionStep ? activeRegionStep : "ክልል ምረጽ"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowLocModal(false);
                  setActiveRegionStep(null);
                }}
              >
                <Ionicons name="close" size={24} color="red" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {activeRegionStep
                ? locationsData
                    .find((r) => r.region === activeRegionStep)
                    ?.cities.map((c, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.listItem}
                        onPress={() => {
                          setCity(c);
                          setShowLocModal(false);
                          setActiveRegionStep(null);
                        }}
                      >
                        <Text style={styles.listText}>{c}</Text>
                      </TouchableOpacity>
                    ))
                : locationsData.map((loc, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.listItem}
                      onPress={() => {
                        if (loc.cities.length > 0) {
                          setActiveRegionStep(loc.region);
                          setRegion(loc.region);
                        } else {
                          setRegion(loc.region);
                          setCity("");
                          setShowLocModal(false);
                        }
                      }}
                    >
                      <Text style={styles.listText}>📍 {loc.region}</Text>
                      {loc.cities.length > 0 && (
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color="#999"
                        />
                      )}
                    </TouchableOpacity>
                  ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showPaymentModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: "#029eff" }]}>
                {paymentType === "regular"
                  ? "መደበኛ ፓኬጅ ምረጹ"
                  : paymentType === "market_pro"
                    ? "PRO Market"
                    : "PRO Advert"}
              </Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>
            <Text style={{ color: "#666", marginBottom: 15 }}>
              {paymentType === "regular"
                ? "ንብረትኩም ንምዝርጋሕ ዝጥዕመኩም ፓኬጅ ምረጹ:"
                : "ኣብ ፍሉይ ባነር ንምስቓል ምረጹ:"}
            </Text>

            <ScrollView
              style={{ maxHeight: 300 }}
              showsVerticalScrollIndicator={false}
            >
              {(paymentType === "regular"
                ? regularPackages
                : paymentType === "market_pro"
                  ? marketProPackages
                  : advertProPackages
              ).map((pkg, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.pkgItem,
                    selectedPkgPrice === pkg.price && styles.pkgSelected,
                  ]}
                  onPress={() => setSelectedPkgPrice(pkg.price)}
                >
                  <Text
                    style={{ fontWeight: "bold", fontSize: 14, color: "#333" }}
                  >
                    {pkg.name}
                  </Text>
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 15,
                      color: "#029eff",
                    }}
                  >
                    {pkg.price} ETB
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text
              style={{ fontWeight: "bold", marginTop: 15, marginBottom: 10 }}
            >
              ከፈሊ ኣገባብ ምረጽ
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                style={styles.payBox}
                onPress={() => confirmPayment("Telebirr")}
              >
                <Ionicons name="phone-portrait" size={24} color="#0088cc" />
                <Text style={styles.payText}>Telebirr</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.payBox}
                onPress={() => confirmPayment("CBE Birr")}
              >
                <Ionicons name="business" size={24} color="#ffaa00" />
                <Text style={styles.payText}>CBE Birr</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.payBox}
                onPress={() => confirmPayment("Card")}
              >
                <Ionicons name="card" size={24} color="#1a1f71" />
                <Text style={styles.payText}>Card (Intl)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showSuccess} animationType="fade" transparent={true}>
        <View
          style={[
            styles.modalOverlay,
            {
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.95)",
            },
          ]}
        >
          <Ionicons name="checkmark-circle" size={100} color="#4CAF50" />
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: "#333",
              marginTop: 20,
            }}
          >
            ብጽቡቕ ተለጢፉ!
          </Text>
          <Text style={{ color: "#666", marginTop: 10, marginBottom: 30 }}>
            ንብረትካ/ትካልካ ሕጂ ኣብ ዕዳጋ ይርአ ኣሎ።
          </Text>
          <TouchableOpacity
            style={[styles.submitBtn, { width: 200 }]}
            onPress={() => {
              setShowSuccess(false);
              router.push("/(tabs)/home" as any);
            }}
          >
            <Text style={styles.submitBtnText}>ናብ ዕዳጋ ተመለስ</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ==========================================================
// 🚀 ምዕራፍ 8: ዲዛይን (Styles)
// ==========================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6f9" },
  scrollContent: { padding: 15, paddingBottom: 100 },

  header: {
    backgroundColor: "#fff",
    padding: 15,
    paddingTop: Platform.OS === "android" ? 40 : 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
    zIndex: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#029eff" },
  proBtnTop: {
    backgroundColor: "#f1c40f",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 2,
  },
  proBtnTopText: {
    fontWeight: "bold",
    fontSize: 12,
    color: "#333",
    marginLeft: 5,
  },

  proDropdown: {
    position: "absolute",
    top: Platform.OS === "android" ? 80 : 55,
    right: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 5,
    zIndex: 20,
    width: 220,
    borderWidth: 1,
    borderColor: "#eee",
  },
  proDropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  proDropdownText: { marginLeft: 10, fontWeight: "bold", color: "#333" },

  // 💡 ሓደስቲ ናይ ባነር ዲዛይናት
  bluePromoCard: {
    backgroundColor: "#006699",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 4,
    alignItems: "center",
  },
  bluePromoTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  bluePromoDesc: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 15,
  },
  orangePkgBtn: {
    backgroundColor: "#ff8c00",
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 2,
  },
  orangePkgBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },

  activeSubCard: {
    backgroundColor: "#e8f5e9",
    borderColor: "#2ecc71",
    borderWidth: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  activeSubTitle: { color: "#27ae60", fontSize: 16, fontWeight: "bold" },

  mainPromoCard: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 4,
  },
  mainPromoTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  mainPromoDesc: { fontSize: 13, lineHeight: 20 },

  formGroup: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 1,
  },
  rowGroup: { flexDirection: "row" },
  label: { fontSize: 13, fontWeight: "bold", color: "#555", marginBottom: 8 },
  input: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#eee",
    padding: 12,
    borderRadius: 8,
    fontSize: 15,
    color: "#333",
  },
  selectorBtn: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#eee",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  imageScroll: { flexDirection: "row", marginTop: 5 },
  uploadBox: {
    width: 90,
    height: 90,
    borderWidth: 2,
    borderColor: "#029eff",
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
    marginRight: 10,
  },
  uploadBoxText: {
    color: "#999",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 5,
  },
  previewWrapper: {
    width: 90,
    height: 90,
    marginRight: 10,
    position: "relative",
  },
  previewImg: { width: "100%", height: "100%", borderRadius: 12 },
  removeImgBtn: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#e74c3c",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },

  techGroup: {
    backgroundColor: "#f4f9fc",
    borderWidth: 1,
    borderColor: "#029eff",
    borderStyle: "dashed",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  techLabel: { color: "#029eff", fontWeight: "bold", fontSize: 14 },

  phoneGroup: {
    borderWidth: 1,
    borderColor: "#029eff",
    backgroundColor: "#f4f9fc",
  },
  phoneLabel: {
    color: "#029eff",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 8,
  },
  phoneInputWrapper: { flexDirection: "row", gap: 10 },
  countryCode: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 15,
    justifyContent: "center",
    borderRadius: 8,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    fontSize: 15,
  },

  submitBtn: {
    backgroundColor: "#029eff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
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
  listText: { fontSize: 16, color: "#444" },

  pkgItem: {
    borderWidth: 2,
    borderColor: "#eee",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#fafafa",
  },
  pkgSelected: {
    borderColor: "#029eff",
    backgroundColor: "rgba(2, 158, 255, 0.1)",
  },
  payBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  payText: { fontSize: 12, fontWeight: "bold", marginTop: 5, color: "#333" },
});
