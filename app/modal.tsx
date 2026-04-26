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
  // 👈 💡 ማጂክ: ን ዓይኒ ፓስዎርድን ን ሓዱሽ ፎርም ምዝገባን ዘድልዩ
  const [showPassword, setShowPassword] = useState(false);
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("+251");
  const [regPassword, setRegPassword] = useState("");
  const [regAge, setRegAge] = useState("");
  const [regGender, setRegGender] = useState("");

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
                    // 👈 💡 ማጂክ: ኪቦርድ ናይ ሞባይል ባዕሉ ኢሜል ከምጽእ
                    keyboardType="email-address"
                    autoComplete="email"
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
                  {/* 👈 💡 ማጂክ: ዓይኒ ዘለዎ ፓስዎርድ መጽሓፊ */}
                  <View
                    style={[
                      styles.input,
                      {
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 0,
                      },
                    ]}
                  >
                    <TextInput
                      style={{
                        flex: 1,
                        padding: 14,
                        fontSize: 15,
                        color: "#333",
                      }}
                      placeholder="Enter Password"
                      value={loginPassword}
                      onChangeText={setLoginPassword}
                      // ዓይኒ እንተተኸፊቱ ጽሑፍ ይርአ፡ እንተተዓጽዩ ይሕባእ
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={{ paddingHorizontal: 15 }}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={22}
                        color="#888"
                      />
                    </TouchableOpacity>
                  </View>
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
                  //👈 💡 ማጂክ: እቲ ሓዱሽ "ጽፉፍን ርህውን" ናይ Sign Up ፎርም
                  <View style={styles.formContainer}>
                    <TouchableOpacity
                      style={{
                        marginBottom: 20,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                      onPress={() => setShowSignupMethod(true)}
                    >
                      <Ionicons name="arrow-back" size={20} color="#029eff" />
                      <Text
                        style={{
                          color: "#029eff",
                          fontWeight: "bold",
                          marginLeft: 5,
                        }}
                      >
                        ንድሕሪት ተመለስ
                      </Text>
                    </TouchableOpacity>

                    {/* 1. ምሉእ ስም */}
                    <Text style={styles.label}>ምሉእ ስም</Text>
                    <View
                      style={[
                        styles.input,
                        {
                          flexDirection: "row",
                          alignItems: "center",
                          padding: 0,
                          marginBottom: 15,
                        },
                      ]}
                    >
                      <Ionicons
                        name="person-outline"
                        size={20}
                        color="#888"
                        style={{ paddingLeft: 15 }}
                      />
                      <TextInput
                        style={{ flex: 1, padding: 14 }}
                        placeholder="ስምኩም ጽሓፉ"
                        value={regName}
                        onChangeText={setRegName}
                      />
                    </View>

                    {/* 2. ስልኪ ቁጽሪ (ጽፉፍ ባንዴራ) */}
                    <Text style={styles.label}>ስልኪ ቁጽሪ</Text>
                    <View
                      style={[
                        styles.input,
                        {
                          flexDirection: "row",
                          alignItems: "center",
                          padding: 0,
                          marginBottom: 15,
                          overflow: "hidden",
                        },
                      ]}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: "#f0f2f5",
                          paddingVertical: 14,
                          paddingHorizontal: 12,
                          borderRightWidth: 1,
                          borderColor: "#e0e0e0",
                        }}
                      >
                        <Text style={{ fontSize: 16, marginRight: 5 }}>🇪🇹</Text>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "bold",
                            color: "#444",
                          }}
                        >
                          +251
                        </Text>
                      </View>
                      <TextInput
                        style={{
                          flex: 1,
                          padding: 14,
                          fontSize: 15,
                          letterSpacing: 1,
                        }}
                        placeholder="911 22 33 44"
                        value={regPhone.replace("+251", "")}
                        onChangeText={(text) => setRegPhone("+251" + text)}
                        keyboardType="phone-pad"
                        maxLength={9}
                      />
                    </View>

                    {/* 3. ዕድመ (በይኑ መስመር) */}
                    <Text style={styles.label}>ዕድመ (Age)</Text>
                    <View
                      style={[
                        styles.input,
                        {
                          flexDirection: "row",
                          alignItems: "center",
                          padding: 0,
                          marginBottom: 15,
                        },
                      ]}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color="#888"
                        style={{ paddingLeft: 15 }}
                      />
                      <TextInput
                        style={{ flex: 1, padding: 14 }}
                        placeholder="ንኣ. 25"
                        value={regAge}
                        onChangeText={setRegAge}
                        keyboardType="numeric"
                        maxLength={2}
                      />
                    </View>

                    {/* 4. ጾታ (ሰፋሕቲ መጠወቒታት) */}
                    <Text style={styles.label}>ጾታ (Gender)</Text>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 15,
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          padding: 14,
                          borderWidth: 1,
                          borderColor:
                            regGender === "Male" ? "#029eff" : "#e0e0e0",
                          backgroundColor:
                            regGender === "Male" ? "#e6f4fe" : "#f9f9f9",
                          borderRadius: 10,
                          marginRight: 10,
                          alignItems: "center",
                        }}
                        onPress={() => setRegGender("Male")}
                      >
                        <Text
                          style={{
                            color: regGender === "Male" ? "#029eff" : "#666",
                            fontWeight:
                              regGender === "Male" ? "bold" : "normal",
                            fontSize: 15,
                          }}
                        >
                          ተባዕታይ
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          padding: 14,
                          borderWidth: 1,
                          borderColor:
                            regGender === "Female" ? "#029eff" : "#e0e0e0",
                          backgroundColor:
                            regGender === "Female" ? "#e6f4fe" : "#f9f9f9",
                          borderRadius: 10,
                          alignItems: "center",
                        }}
                        onPress={() => setRegGender("Female")}
                      >
                        <Text
                          style={{
                            color: regGender === "Female" ? "#029eff" : "#666",
                            fontWeight:
                              regGender === "Female" ? "bold" : "normal",
                            fontSize: 15,
                          }}
                        >
                          ኣንስተይቲ
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* 5. ፓስዎርድ */}
                    <Text style={styles.label}>ፓስዎርድ</Text>
                    <View
                      style={[
                        styles.input,
                        {
                          flexDirection: "row",
                          alignItems: "center",
                          padding: 0,
                          marginBottom: 25,
                        },
                      ]}
                    >
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color="#888"
                        style={{ paddingLeft: 15 }}
                      />
                      <TextInput
                        style={{ flex: 1, padding: 14 }}
                        placeholder="ሓዱሽ ፓስዎርድ"
                        value={regPassword}
                        onChangeText={setRegPassword}
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={{ paddingHorizontal: 15 }}
                      >
                        <Ionicons
                          name={showPassword ? "eye-off" : "eye"}
                          size={22}
                          color="#888"
                        />
                      </TouchableOpacity>
                    </View>

                    {/* 6. ናይ መወዳእታ ምዝገባ በተን */}
                    <TouchableOpacity
                      style={styles.submitBtn}
                      onPress={() =>
                        Alert.alert("Meyda", "ምዝገባ ናብ ሰርቨር ይለኣኽ ኣሎ...")
                      }
                    >
                      <Text style={styles.submitBtnText}>ተመዝገብ (Sign Up)</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {/* 👈 💡 ማጂክ: ናይ ፓስዎርድ ምሕዳስ (Forgot Password) ሞዳል */}
      {showForgotModal && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 10,
              width: "85%",
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
            >
              ፓስዎርድ ዶ ጠፊኡኩም?
            </Text>
            <Text style={{ color: "#666", marginBottom: 15 }}>
              ብ ኢሜል ወይ ቁጽሪ ስልኪ ጌርኩም ሓዱሽ ፓስዎርድ ከተዳልዉ ትኽእሉ ኢኹም።
            </Text>
            <TextInput
              style={[styles.input, { marginBottom: 15 }]}
              placeholder="ኢሜል ወይ ስልኪ"
              value={forgotIdentifier}
              onChangeText={setForgotIdentifier}
            />
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={() => {
                Alert.alert("መልእኽቲ", "OTP ናብ ስልክኹም ተላኢኹ ኣሎ!");
                setShowForgotModal(false);
              }}
            >
              <Text style={styles.submitBtnText}>OTP ስደደለይ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginTop: 15, alignItems: "center" }}
              onPress={() => setShowForgotModal(false)}
            >
              <Text style={{ color: "#aaa", fontWeight: "bold" }}>
                ዕጾ (Cancel)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    padding: 10,
  },
  authContainer: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: 400,
    padding: 15,
    borderRadius: 8,
    elevation: 4,
  },
  brandLogo: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
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
    borderRadius: 20,
    marginBottom: 20,
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
    borderRadius: 25,
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
    padding: 10,
    borderRadius: 10,
    fontSize: 15,
    color: "#333",
  },
  forgotText: { color: "#029eff", fontSize: 12, fontWeight: "bold" },
  submitBtn: {
    backgroundColor: "#029eff",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
