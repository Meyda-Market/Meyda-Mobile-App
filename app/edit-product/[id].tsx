// ==========================================================
// 🚀 ምዕራፍ 1: መእተዊ (Imports)
// ==========================================================
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { ThemeContext } from "../../context/ThemeContext";

const { width } = Dimensions.get("window");
const API_BASE_URL = "https://meyda-app.onrender.com";

export default function EditProductScreen() {
  const router = useRouter();
  const { isDarkMode } = useContext(ThemeContext);

  const {
    id,
    title: initialTitle,
    price: initialPrice,
    description: initialDesc,
    images: initialImages,
  } = useLocalSearchParams();

  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);

  // ==========================================================
  // 🚀 ምዕራፍ 2: ዝመጸ ዳታ ኣብ መጽሓፊ ምምላእ
  // ==========================================================
  useEffect(() => {
    setTitle((initialTitle as string) || "");
    setPrice((initialPrice as string) || "");
    setDescription((initialDesc as string) || "");

    if (initialImages && typeof initialImages === "string") {
      try {
        const parsedImages = JSON.parse(initialImages);
        if (Array.isArray(parsedImages)) {
          const formattedImages = parsedImages.map((img: string) =>
            getImageUrl(img),
          );
          setImages(formattedImages);
        }
      } catch (e) {
        console.log("Error parsing images", e);
      }
    }
  }, [initialTitle, initialPrice, initialDesc, initialImages]);

  const getImageUrl = (imgStr: string) => {
    if (!imgStr) return "https://via.placeholder.com/150";
    if (imgStr.startsWith("http") || imgStr.startsWith("file://"))
      return imgStr;
    return `${API_BASE_URL}${imgStr}`;
  };

  // ==========================================================
  // 🚀 ምዕራፍ 3: ስእሊ ምውሳኽን ምድምሳስን
  // ==========================================================
  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert("ገደብ", "ካብ 5 ስእልታት ንላዕሊ ምውሳኽ ኣይፍቀድን እዩ።");
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled) {
        setImages((prev) => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert("ጌጋ", "ስእሊ ምምራጽ ኣይተኻእለን።");
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // ==========================================================
  // 🚀 ምዕራፍ 4: ለውጢ ናብ ሰርቨር ምልኣኽ (Smart Update)
  // ==========================================================
  const handleUpdate = async () => {
    if (!title.trim() || !price.trim()) {
      Alert.alert("ጌጋ", "በጃኹም ስምን ዋጋን ኣቕሓ ኣይትሕደጉ።");
      return;
    }
    setSaving(true);
    try {
      const hasNewImage = images.some((img) => img.startsWith("file://"));

      const cleanExistingImages = images
        .filter((img) => !img.startsWith("file://"))
        .map((img) => img.replace(API_BASE_URL, ""));

      let res;

      if (hasNewImage) {
        // ሓዱሽ ስእሊ ምስ ዝህልዎ
        const formData = new FormData();
        formData.append("title", title);
        formData.append("name", title);
        formData.append("price", price);
        formData.append("description", description);
        formData.append("existingImages", JSON.stringify(cleanExistingImages));

        images.forEach((img, index) => {
          if (img.startsWith("file://")) {
            // 💡 ማጂክ: ትኽክለኛ ስምን ፎርማትን ናይቲ ስእሊ ነውጽኣሉ
            let filename =
              img.split("/").pop() || `image_${Date.now()}_${index}.jpg`;
            let match = /\.(\w+)$/.exec(filename);
            let type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append("images", {
              uri: img,
              name: filename,
              type: type,
            } as any);
          }
        });

        res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        // ሓዱሽ ስእሊ የለን (ጽሑፍ ጥራሕ ወይ ስእሊ ምቕናስ ጥራሕ)
        res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title,
            name: title,
            price: Number(price),
            description: description,
            // 💡 ማጂክ: ንባክ-ኤንድና 100% ምእንቲ ክርድኦ ክልቲኡ ንሰደሉ
            existingImages: cleanExistingImages,
            images: cleanExistingImages,
          }),
        });
      }

      if (res.ok) {
        Alert.alert("ዕዉት!", "ኣቕሓኹም ብዓወት ተመሓይሹ ኣሎ።", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        const errorText = await res.text();
        Alert.alert("ጌጋ ሰርቨር", `ሰርቨር ነጺጉዎ: ${errorText.substring(0, 80)}`);
      }
    } catch (error) {
      console.log("Error updating product:", error);
      Alert.alert("ጌጋ ኔትወርክ", "ምስ ሰርቨር ምርኻብ ኣይተኻእለን።");
    } finally {
      setSaving(false);
    }
  };
  // ==========================================================
  // 🚀 ምዕራፍ 5: ዲዛይን (Render)
  // ==========================================================
  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#121212" : "#f5f7fa" },
      ]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: isDarkMode ? "#1E1E1E" : "#029eff" },
        ]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ኣቕሓ ኣስተኻኽል (Edit Ad)</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* 💡 ማጂክ: ኪቦርድ ንመጽሓፊ ከይሽፍኖ ዝከላኸል (KeyboardAvoidingView Fix) */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 30}
      >
        {/* 💡 ማጂክ: ኣብ ታሕቲ ብቑዕ ባዶ ቦታ ንህቦ (paddingBottom: 150) */}
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 150 }]}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.card,
              { backgroundColor: isDarkMode ? "#1E1E1E" : "#fff" },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                { color: isDarkMode ? "#FFF" : "#333" },
              ]}
            >
              ስእልታት <Text style={styles.subtitle}>(ክሳብ 5 ይፍቀድ)</Text>
            </Text>
            <View style={styles.imageGrid}>
              {images.map((img, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: img }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.deleteImageBtn}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 5 && (
                <TouchableOpacity
                  style={[
                    styles.addImageBtn,
                    {
                      backgroundColor: isDarkMode ? "#2A2A2A" : "#f0f2f5",
                      borderColor: isDarkMode ? "#444" : "#ddd",
                    },
                  ]}
                  onPress={pickImage}
                >
                  <Ionicons
                    name="camera-outline"
                    size={30}
                    color={isDarkMode ? "#029eff" : "#029eff"}
                  />
                  <Text
                    style={[
                      styles.addImageText,
                      { color: isDarkMode ? "#CCC" : "#666" },
                    ]}
                  >
                    ወስኽ
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: isDarkMode ? "#1E1E1E" : "#fff" },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                { color: isDarkMode ? "#FFF" : "#333" },
              ]}
            >
              ሓበሬታ ኣቕሓ
            </Text>

            <Text
              style={[
                styles.inputLabel,
                { color: isDarkMode ? "#CCC" : "#555" },
              ]}
            >
              ስም ኣቕሓ (Title)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? "#2A2A2A" : "#f9f9f9",
                  color: isDarkMode ? "#FFF" : "#333",
                  borderColor: isDarkMode ? "#444" : "#eee",
                },
              ]}
              placeholder="ንኣብነት፡ iPhone 13 Pro"
              placeholderTextColor={isDarkMode ? "#888" : "#aaa"}
              value={title}
              onChangeText={setTitle}
            />

            <Text
              style={[
                styles.inputLabel,
                { color: isDarkMode ? "#CCC" : "#555" },
              ]}
            >
              ዋጋ (Price in Br)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? "#2A2A2A" : "#f9f9f9",
                  color: isDarkMode ? "#FFF" : "#333",
                  borderColor: isDarkMode ? "#444" : "#eee",
                },
              ]}
              placeholder="ንኣብነት፡ 120000"
              placeholderTextColor={isDarkMode ? "#888" : "#aaa"}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />

            <Text
              style={[
                styles.inputLabel,
                { color: isDarkMode ? "#CCC" : "#555" },
              ]}
            >
              መግለጺ (Description)
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: isDarkMode ? "#2A2A2A" : "#f9f9f9",
                  color: isDarkMode ? "#FFF" : "#333",
                  borderColor: isDarkMode ? "#444" : "#eee",
                },
              ]}
              placeholder="ብዛዕባ ኣቕሓኹም ዝርዝር መግለጺ ጽሓፉ..."
              placeholderTextColor={isDarkMode ? "#888" : "#aaa"}
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && { opacity: 0.7 }]}
            onPress={handleUpdate}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons
                  name="save-outline"
                  size={22}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.saveButtonText}>
                  ለውጢ ዓቅብ (Save Changes)
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ==========================================================
// 🚀 ምዕራፍ 6: ዲዛይን (Styles)
// ==========================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  scrollContent: { padding: 15 },
  card: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 15 },
  subtitle: { fontSize: 12, fontWeight: "normal", color: "#888" },
  imageGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  imageWrapper: {
    width: (width - 70) / 3,
    height: (width - 70) / 3,
    borderRadius: 8,
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    resizeMode: "cover",
  },
  deleteImageBtn: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF3B30",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    zIndex: 5,
  },
  addImageBtn: {
    width: (width - 70) / 3,
    height: (width - 70) / 3,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  addImageText: { fontSize: 12, marginTop: 5 },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    height: 100,
  },
  saveButton: {
    backgroundColor: "#029eff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
    elevation: 3,
    shadowColor: "#029eff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
