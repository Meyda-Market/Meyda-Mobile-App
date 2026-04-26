// ==========================================================
// 🚀 ምዕራፍ 1: መእተዊ (Imports)
// ==========================================================
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  LogBox,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 👈 🔥 ማጂክ 1: ነቲ ኦሪጅናል ናይ ጎግል ቱል ኣእቲናዮ ኣለና
import { GoogleSignin } from "@react-native-google-signin/google-signin";

LogBox.ignoreLogs(["Unable to activate keep awake"]);

const { width } = Dimensions.get("window");
const API_BASE_URL = "https://meyda-app.onrender.com";

// 👈 🔥 ማጂክ 2: መለለዪ ናይ ጎግል (ኣብ ወጻኢ ኮይኑ ሓንሳብ ጥራሕ ይስራሕ)
GoogleSignin.configure({
  // እቲ Web Client ID ግድን የድልየና እዩ (ምእንቲ ምስ ባክ-ኤንድና ክረዳዳእ)
  webClientId:
    "704636644932-64c1pihcjoqgi1bupvim61elgj4i5tsm.apps.googleusercontent.com",
});

export default function AuthScreen() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showSignupMethod, setShowSignupMethod] = useState(true);
  const [loading, setLoading] = useState(false);

  // (እተን ካልኦት ናይ ፎርጎት/OTP ስቴትስ ብምሕጻር ገዲፈየን ኣለኹ፣ ናትካ እንተደሊኻ ክትውስኸን ትኽእል)
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState("");

  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("meydaToken");
      if (token) router.replace("/(tabs)/home");
    };
    checkLoginStatus();
  }, []);

  // ==========================================================
  // 🚀 ምዕራፍ 2: ኦሪጅናል ጎግል ሎግ-ኢን (Native Flow)
  // ==========================================================
  const handleGoogleLogin = async () => {
    // 👈 💡 ማጂክ: ን Web (ኮምፒተር) ጥራሕ እትኸውን መከላኸሊት
    if (Platform.OS === "web") {
      Alert.alert(
        "Web Login",
        "ንግዚኡ ኣብ ኮምፒተር (Web) Google Login ኣይሰርሕን እዩ፣ በጃኻ ብሞባይል ቴስት ግበሮ።",
      );
      return;
    }

    try {
      setLoading(true);
      // 👈 ሕጂ እቲ ኣብ መስመር 69 ዝነበረ "await GoogleSignin.hasPlayServices();" እናበለ ይቕጽል...
      await GoogleSignin.hasPlayServices();

      const response = await GoogleSignin.signIn();

      // 👈 🔥 ፍታሕ: ን ሓዱሽ ቨርሽን (v13+) ቀያሕቲ ንምጥፋእ (Check Success)
      if (response.type !== "success") {
        console.log("Sign in cancelled");
        setLoading(false);
        return;
      }

      // እቲ ሓበሬታ ሕጂ ኣብ ውሽጢ 'data' እዩ ዘሎ
      const user = response.data.user;
      console.log("1. Native Google User Info:", user.email);

      // ናብ ባክ-ኤንድ ንሰዶ
      const serverRes = await fetch(`${API_BASE_URL}/api/users/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          profilePic: user.photo,
          googleId: user.id,
        }),
      });

      const data = await serverRes.json();
      if (serverRes.ok) {
        await AsyncStorage.setItem("meydaToken", data.token);
        await AsyncStorage.setItem(
          "meydaUser",
          JSON.stringify(data.user || data),
        );
        console.log("2. Success! Navigating to Home...");
        router.replace("/(tabs)/home");
      } else {
        Alert.alert("ጌጋ", "ባክ-ኤንድ ኣይተቐበሎን");
      }
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      Alert.alert("ጸገም", "ምስ ጎግል ክራኸብ ኣይከኣለን። ኮኔክሽንኩም ኣረጋግጹ።");
    } finally {
      setLoading(false);
    }
  };
  // ==========================================================
  // 🚀 ምዕራፍ 3: ንቡር ሎግ-ኢን
  // ==========================================================
  // 👈 💡 ማጂክ: እዛ ፋንክሽን እያ ነቲ 400 Error እተዐርዮ
  const handleLogin = async () => {
    // 👈 💡 ማጂክ: ሕጂ ነተን ናትካ ኦሪጂናል ስማት ንጥቀም ኣለና
    if (!loginId || !loginPassword) {
      Alert.alert("ጌጋ", "በጃኻ ኢሜልን ፓስዎርድን ምልእ።");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // ⚠️ ማጂክ: ሰርቨር 'email' ይጽበ፡ ንሕና ግና ነታ ጽሑፍ ዘለዋ 'loginId' ንሰደሉ
          email: loginId.trim().toLowerCase(),
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        await AsyncStorage.setItem("meydaToken", data.token);
        await AsyncStorage.setItem("meydaUser", JSON.stringify(data.user));
        router.replace("/(tabs)/home");
      } else {
        Alert.alert("ጌጋ", data.message || "ኢሜል ወይ ፓስዎርድ ተጋግዮም!");
      }
    } catch (error) {
      console.log("Login Network Error:", error);
      Alert.alert("ጌጋ ኔትወርክ", "ምስ ሰርቨር ምርኻብ ኣይተኻእለን።");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // 🚀 ምዕራፍ 4: ጠቕላላ ስክሪን
  // ==========================================================
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, justifyContent: "center" }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.authContainer}>
            <View style={styles.brandLogo}>
              <FontAwesome5 name="shopping-bag" size={30} color="#029eff" />
              <Text style={styles.brandText}>Meyda</Text>
            </View>

            <View style={styles.tabsWrapper}>
              <View
                style={[
                  styles.tabSlider,
                  activeTab === "signup" ? { left: "50%" } : { left: 0 },
                ]}
              />
              <TouchableOpacity
                style={styles.tabBtn}
                onPress={() => {
                  setActiveTab("login");
                  setShowSignupMethod(true);
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "login" && styles.tabTextActive,
                  ]}
                >
                  Login (እቶ)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tabBtn}
                onPress={() => setActiveTab("signup")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "signup" && styles.tabTextActive,
                  ]}
                >
                  Sign Up (ተመዝገብ)
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === "login" && (
              <View style={styles.formContainer}>
                <TouchableOpacity
                  style={styles.googleBtn}
                  // 👈 🔥 ማጂክ 4: ነታ ኦሪጅናል ፈንክሽን ጸዊዕናያ ኣለና
                  onPress={handleGoogleLogin}
                  disabled={loading}
                >
                  <View style={styles.googleIconContainer}>
                    <Image
                      source={{
                        uri: "https://developers.google.com/identity/images/g-logo.png",
                      }}
                      style={styles.googleIcon}
                    />
                  </View>
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.line} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.line} />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Email or Phone</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Email or Phone"
                    value={loginId}
                    onChangeText={setLoginId}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.formGroup}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 5,
                    }}
                  >
                    <Text style={styles.label}>Password</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setForgotIdentifier(loginId);
                        setShowForgotModal(true);
                      }}
                    >
                      <Text style={styles.forgotText}>Forgot Password?</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Password"
                    value={loginPassword}
                    onChangeText={setLoginPassword}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>Login to Meyda</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {activeTab === "signup" && (
              <View style={styles.formContainer}>
                {showSignupMethod ? (
                  <View>
                    <TouchableOpacity
                      style={styles.googleBtn}
                      // 👈 🔥 ማጂክ 4: ነታ ኦሪጅናል ፈንክሽን ጸዊዕናያ ኣለና
                      onPress={handleGoogleLogin}
                      disabled={loading}
                    >
                      <View style={styles.googleIconContainer}>
                        <Image
                          source={{
                            uri: "https://developers.google.com/identity/images/g-logo.png",
                          }}
                          style={styles.googleIcon}
                        />
                      </View>
                      <Text style={styles.googleBtnText}>
                        Continue with Google
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.phoneAuthBtn}
                      onPress={() => setShowSignupMethod(false)}
                    >
                      <Ionicons name="call" size={18} color="#fff" />
                      <Text style={styles.phoneAuthBtnText}>
                        Continue with Phone
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View>{/* ... Phone signup form ... */}</View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ==========================================================
// 🚀 ምዕራፍ 5: ዲዛይን (Styles)
// ==========================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f7f6" },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  authContainer: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: 400,
    padding: 30,
    borderRadius: 16,
    elevation: 8,
  },
  brandLogo: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  brandText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#029eff",
    marginLeft: 10,
    letterSpacing: 1,
  },
  tabsWrapper: {
    flexDirection: "row",
    backgroundColor: "#f0f2f5",
    borderRadius: 30,
    marginBottom: 25,
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
  },
  tabSlider: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "50%",
    backgroundColor: "#029eff",
    borderRadius: 30,
  },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: "center", zIndex: 1 },
  tabText: { fontSize: 15, fontWeight: "bold", color: "#888" },
  tabTextActive: { color: "#fff" },
  formContainer: { width: "100%" },
  googleBtn: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d2d2d2",
    padding: 2,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
    elevation: 1,
  },
  googleIconContainer: { backgroundColor: "#fff", padding: 8, borderRadius: 6 },
  googleIcon: { width: 24, height: 24 },
  googleBtnText: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    marginRight: 40,
  },
  phoneAuthBtn: {
    flexDirection: "row",
    backgroundColor: "#2ecc71",
    padding: 14,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    elevation: 2,
  },
  phoneAuthBtnText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10,
  },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: "#eee" },
  dividerText: {
    color: "#aaa",
    paddingHorizontal: 15,
    fontWeight: "bold",
    fontSize: 12,
  },
  formGroup: { marginBottom: 15 },
  label: { fontSize: 13, color: "#666", marginBottom: 6, fontWeight: "bold" },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
    color: "#333",
  },
  forgotText: { color: "#029eff", fontSize: 12, fontWeight: "bold" },
  submitBtn: {
    backgroundColor: "#029eff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
