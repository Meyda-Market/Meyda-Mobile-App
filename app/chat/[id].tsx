// ==========================================================
// 🚀 ምዕራፍ 1: መእተዊ (Imports)
// ==========================================================
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";

const API_BASE_URL = "https://meyda-app.onrender.com";

export default function ChatScreen() {
  // ==========================================================
  // 🚀 ምዕራፍ 2: መኽዘን ኩነታትን ዝመጸ ሓበሬታን (Params & State)
  // ==========================================================
  const {
    id: receiverId,
    name: receiverName,
    productId,
    productName,
    productImage,
    productPrice,
    prefillMsg,
  } = useLocalSearchParams();

  const router = useRouter();
  const { user } = useContext(AuthContext);

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const [showPreview, setShowPreview] = useState(true);

  // ==========================================================
  // 🚀 ምዕራፍ 3: መበገሲ ማጂካት (Initial Effects)
  // ==========================================================
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (prefillMsg && typeof prefillMsg === "string") {
      setInputText(prefillMsg);
    }
  }, [prefillMsg]);

  const getImageUrl = (urlPath: any) => {
    if (!urlPath) return "https://via.placeholder.com/100";
    if (String(urlPath).startsWith("http")) return urlPath;
    return `${API_BASE_URL}${String(urlPath).startsWith("/") ? "" : "/"}${urlPath}`;
  };

  // ==========================================================
  // 🚀 ምዕራፍ 4: ምስ ሰርቨር ምዝርራብ (Fetch & Send)
  // ==========================================================
  const fetchMessages = async () => {
    if (!user) return;
    const myId = user._id || user.id;
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/${myId}`);
      if (response.ok) {
        const data = await response.json();
        const chatHistory = data.filter(
          (m: any) =>
            (String(m.senderId) === String(myId) &&
              String(m.receiverId) === String(receiverId)) ||
            (String(m.senderId) === String(receiverId) &&
              String(m.receiverId) === String(myId)),
        );
        setMessages(chatHistory.reverse());
      }
    } catch (error) {
      console.log("Error fetching messages:", error);
    }
  };

  // 💡 ማጂክ: ሓዱሽ ናይ መልእኽቲ መላእኺ (ስእልን ሊንክን ሒዙ ዝኸይድ)
  const sendMessage = async () => {
    if (!inputText.trim() || !user) return;
    const myId = user._id || user.id;
    const textToSend = inputText.trim();

    setInputText("");

    const isProductInquiry = showPreview && productId;
    const sentProductId = isProductInquiry ? productId : null;
    const sentProductName = isProductInquiry ? productName : null;
    const sentProductImage = isProductInquiry ? productImage : null;
    const sentProductPrice = isProductInquiry ? productPrice : null;

    setShowPreview(false);

    const newMessage = {
      _id: Math.random().toString(),
      senderId: myId,
      text: textToSend,
      createdAt: new Date().toISOString(),
      productId: sentProductId,
      productName: sentProductName,
      productImage: sentProductImage,
      productPrice: sentProductPrice,
    };
    setMessages((prev) => [...prev, newMessage]);

    try {
      await fetch(`${API_BASE_URL}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: myId,
          senderName: user.name || "ተጠቃሚ",
          receiverId: receiverId,
          text: textToSend,
          type: isProductInquiry ? "product_inquiry" : "message",
          productId: sentProductId,
          productName: sentProductName,
          productImage: sentProductImage,
          productPrice: sentProductPrice,
        }),
      });
      fetchMessages();
    } catch (error) {
      console.log("Error sending message:", error);
    }
  };

  const renderMessage = ({ item }: any) => {
    const myId = user?._id || user?.id;
    const isMe = String(item.senderId) === String(myId);

    return (
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.myMessage : styles.theirMessage,
        ]}
      >
        {/* 💡 ማጂክ: ኣብ ውሽጢ ዕላል ንእሽቶ ካርድ ናይቲ ኣቕሓ ትረአ */}
        {item.productImage && (
          <TouchableOpacity
            style={[
              styles.msgProductCard,
              isMe ? styles.myMsgCard : styles.theirMsgCard,
            ]}
            onPress={() => router.push(`/product/${item.productId}` as any)}
          >
            <Image
              source={{ uri: getImageUrl(item.productImage) }}
              style={styles.msgProductImg}
            />
            <View style={styles.msgProductInfo}>
              <Text
                style={[
                  styles.msgProductName,
                  isMe ? styles.myMessageText : styles.theirMessageText,
                ]}
                numberOfLines={1}
              >
                {item.productName}
              </Text>
              <Text style={isMe ? styles.myMsgPrice : styles.theirMsgPrice}>
                {item.productPrice} Br
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <Text
          style={[
            styles.messageText,
            isMe ? styles.myMessageText : styles.theirMessageText,
          ]}
        >
          {item.text}
        </Text>
        <Text style={styles.timeText}>
          {new Date(item.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  // ==========================================================
  // 🚀 ምዕራፍ 5: ጠቕላላ ስክሪን (Main Render)
  // ==========================================================
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ሄደር */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Ionicons name="person-circle" size={36} color="#fff" />
          <Text style={styles.headerName} numberOfLines={1}>
            {receiverName || "ነጋዳይ"}
          </Text>
        </View>
      </View>

      {/* ናይ ኣቕሓ ፕሪቪው (Preview Banner) */}
      {showPreview && productId && (
        <View style={styles.productPreviewContainer}>
          <TouchableOpacity
            style={{ flexDirection: "row", flex: 1, alignItems: "center" }}
            onPress={() => router.push(`/product/${productId}` as any)}
          >
            <Image
              source={{ uri: getImageUrl(productImage) }}
              style={styles.previewImg}
            />
            <View style={styles.previewInfo}>
              <Text style={styles.previewTitle} numberOfLines={1}>
                {productName}
              </Text>
              <Text style={styles.previewPrice}>{productPrice} Br</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closePreviewBtn}
            onPress={() => setShowPreview(false)}
          >
            <Ionicons name="close-circle" size={22} color="#999" />
          </TouchableOpacity>
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "android" ? 25 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>
                ምስ {receiverName} ዕላል ጀምሩ! 👋
              </Text>
            </View>
          )}
        />

        {/* መጽሓፊ ሳጹን (Input Area) */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="መልእኽቲ ጽሓፉ..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              !inputText.trim() && { backgroundColor: "#ccc" },
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name="send"
              size={18}
              color="#fff"
              style={{ marginLeft: 3 }}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} // 👈 💡 ማጂክ: እዚኣ እያ እታ ተደምሲሳ ዝነበረት ወሳኒት ቅንፍ!

// ==========================================================
// 🚀 ምዕራፍ 6: ዲዛይን (Styles)
// ==========================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  header: {
    backgroundColor: "#029eff",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    paddingTop: Platform.OS === "android" ? 40 : 15,
    elevation: 3,
    zIndex: 10,
  },
  backBtn: { paddingRight: 15 },
  headerInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  headerName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },

  productPreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    elevation: 2,
    zIndex: 5,
  },
  previewImg: { width: 40, height: 40, borderRadius: 5, resizeMode: "cover" },
  previewInfo: { flex: 1, marginLeft: 10 },
  previewTitle: { fontSize: 14, fontWeight: "bold", color: "#333" },
  previewPrice: {
    fontSize: 13,
    color: "#029eff",
    fontWeight: "bold",
    marginTop: 2,
  },
  closePreviewBtn: { padding: 5 },

  chatContainer: { padding: 15, paddingBottom: 20 },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#029eff",
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    elevation: 1,
  },
  messageText: { fontSize: 15, lineHeight: 20 },
  myMessageText: { color: "#fff" },
  theirMessageText: { color: "#333" },
  timeText: {
    fontSize: 10,
    color: "rgba(0,0,0,0.4)",
    alignSelf: "flex-end",
    marginTop: 4,
  },

  // 💡 ማጂክ 5: ዲዛይን ናይታ ኣብ ውሽጢ ዕላል እትኣቱ ካርድ
  msgProductCard: {
    flexDirection: "row",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: "center",
  },
  myMsgCard: { backgroundColor: "rgba(255,255,255,0.2)" },
  theirMsgCard: { backgroundColor: "#f0f2f5" },
  msgProductImg: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginRight: 10,
    resizeMode: "cover",
  },
  msgProductInfo: { flex: 1 },
  msgProductName: { fontSize: 14, fontWeight: "bold" },
  myMsgPrice: { fontSize: 12, color: "#e0f7fa", fontWeight: "bold" },
  theirMsgPrice: { fontSize: 12, color: "#029eff", fontWeight: "bold" },

  emptyContainer: { alignItems: "center", marginTop: 50 },
  emptyText: { color: "#888", marginTop: 10, fontSize: 15 },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 25,
    backgroundColor: "#fff",
    elevation: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#029eff",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
});
