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

import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

LogBox.ignoreLogs(["Unable to activate keep awake"]);
WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get("window");
const API_BASE_URL = "https://meyda-app.onrender.com";

export default function AuthScreen() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showSignupMethod, setShowSignupMethod] = useState(true);
  const [signupPhone, setSignupPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+251");
  const [signupName, setSignupName] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ==========================================================
  // 🚀 ምዕራፍ 2: ጎግል ሎግ-ኢን
  // ==========================================================
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:
      "704636644932-64c1pihcjoqgi1bupvim61elgj4i5tsm.apps.googleusercontent.com",
    // 👈 🔥 ማጂክ 1: ናይ Android Client ID ብሓዱሽ ተቐይሩ ኣሎ!
    androidClientId:
      "704636644932-5frpinuu7ik5590g2627l2ene8la58b6.apps.googleusercontent.com",
    iosClientId:
      "704636644932-64c1pihcjoqgi1bupvim61elgj4i5tsm.apps.googleusercontent.com",

    // 👈 🔥 ማጂክ 2: useProxy ተደምሲሱ ኣሎ ምኽንያቱ ሓቀኛ APK ኢና ንሃንጽ ዘለና
    // @ts-ignore
    redirectUri: AuthSession.makeRedirectUri(),
  });

  useEffect(() => {
    if (response) {
      console.log("1. Google Response Status:", response.type);
    }

    if (response?.type === "success") {
      setLoading(true);
      const { authentication } = response;
      console.log(
        "2. Google Token Found:",
        authentication?.accessToken ? "Yes" : "No",
      );

      fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${authentication?.accessToken}` },
      })
        .then((res) => res.json())
        .then(async (userInfo) => {
          console.log("3. User Info from Google:", userInfo.email);
          console.log(
            "4. Sending to Backend API:",
            `${API_BASE_URL}/api/users/google-login`,
          );

          const serverRes = await fetch(
            `${API_BASE_URL}/api/users/google-login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: userInfo.email,
                name: userInfo.name,
                profilePic: userInfo.picture,
                googleId: userInfo.id,
              }),
            },
          );

          console.log("5. Backend Status Code:", serverRes.status);
          const data = await serverRes.json();
          console.log("6. Backend Reply Data:", data);

          if (serverRes.ok) {
            await AsyncStorage.setItem("meydaToken", data.token);
            await AsyncStorage.setItem(
              "meydaUser",
              JSON.stringify(data.user || data),
            );
            console.log("7. Success! Navigating to Home...");
            router.replace("/(tabs)/home");
          } else {
            console.log("Backend Error:", data);
            Alert.alert("ጌጋ", "ባክ-ኤንድ ኣይተቐበሎን");
          }
        })
        .catch((error) => {
          console.error("8. Caught a big error!", error);
          Alert.alert("ጸገም", "ሓበሬታ ምምጻእ ኣይተኻእለን");
        })
        .finally(() => setLoading(false));
    }
  }, [response]);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("meydaToken");
      if (token) router.replace("/(tabs)/home");
    };
    checkLoginStatus();
  }, []);

  // ==========================================================
  // 🚀 ምዕራፍ 3: ንቡር ሎግ-ኢን
  // ==========================================================
  const handleLogin = async () => {
    if (!loginId || !loginPassword)
      return Alert.alert("ጌጋ", "በጃኹም ኢሜይል/ስልኪን ፓስዋርድን ምልእዎ!");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginId, password: loginPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem("meydaToken", data.token);
        await AsyncStorage.setItem(
          "meydaUser",
          JSON.stringify(data.user || data),
        );
        router.replace("/(tabs)/home");
      } else
        Alert.alert("ሎግ-ኢን ኣይተኻእለን", data.message || "ፓስዋርድ ወይ ኢሜይል ጌጋ እዩ።");
    } catch (err) {
      Alert.alert("ጸገም", "ምስ ሰርቨር ክራኸብ ኣይከኣለን።");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    /* ... existing code ... */
  };
  const handleRequestOtp = async () => {
    /* ... existing code ... */
  };
  const handleVerifyOtp = async () => {
    /* ... existing code ... */
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
                  // 👈 🔥 ማጂክ 3: useProxy ተደምሲሱ ኣሎ
                  // @ts-ignore
                  onPress={() => promptAsync()}
                  disabled={!request || loading}
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
                  <Text style={styles.label}>Email or Phone (ኢሜይል ወይ ስልኪ)</Text>
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
                    <Text style={styles.label}>Password (ፓስዋርድ)</Text>
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

            {/* Signup Tab */}
            {activeTab === "signup" && (
              <View style={styles.formContainer}>
                {showSignupMethod ? (
                  <View>
                    <TouchableOpacity
                      style={styles.googleBtn}
                      // 👈 🔥 ማጂክ 4: useProxy ተደምሲሱ ኣሎ
                      // @ts-ignore
                      onPress={() => promptAsync()}
                      disabled={!request || loading}
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
                  <View>{/* ... (Your existing phone signup inputs) */}</View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ... (Your existing Forgot Password Modal) */}
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
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
