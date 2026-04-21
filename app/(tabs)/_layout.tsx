// ==========================================================
// 🚀 መእተዊ (Imports)
// ==========================================================
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useContext } from "react"; // 💡 ሓዱሽ: React ን useContext ን
import { Platform, StyleSheet, View } from "react-native";
import { ThemeContext } from "../../context/ThemeContext"; // 💡 ሓዱሽ: ዳርክ ሞድ ሓንጎል መጸውዒ

export default function TabLayout() {
  // 💡 ማጂክ: ዳርክ ሞድ ሓንጎል ንጽውዕ
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#029eff", // ብራንድ ሕብሪ (ክጥወቕ ከሎ)
        // 💡 ኣብ ጸልማት ነቶም ዘይተጠውቑ ኣይከናት ቁሩብ ከም ዝበርሁ ንገብሮም
        tabBarInactiveTintColor: isDarkMode ? "#AAAAAA" : "#888888",
        tabBarShowLabel: false, // ጽሑፍ የብሉን
        headerShown: false, // ላዕለዋይ ርእሲ ንምጥፋእ

        // 💡 ኣብ ኣየር ዝንሳፈፍ ማራኺ ዲዛይን (Floating Tab Bar)
        tabBarStyle: {
          position: "absolute",
          bottom: Platform.OS === "android" ? 15 : 25, // ካብ ታሕተዋይ ቆፎ ንምርሓቕ
          left: 20,
          right: 20,
          // 💡 ማጂክ: ባክግራውንድ ናይ ታብ ዳርክ ሞድ ይለብስ (ፈኲስ ጸሊም #1E1E1E)
          backgroundColor: isDarkMode ? "#1E1E1E" : "#ffffff",
          borderRadius: 10, // ጽቡቕ ክቢ (Pill shape)
          height: 65,
          borderTopWidth: 0,
          elevation: 10, // ናይ ኣንድሮይድ ጽላሎት (Shadow)
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: isDarkMode ? 0.4 : 0.15, // 💡 ኣብ ጸልማት ጽላሎት ምእንቲ ክረአ
          shadowRadius: 10,
        },
      }}
    >
      {/* 1. Home */}
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />

      {/* 2. News */}
      <Tabs.Screen
        name="news"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "newspaper" : "newspaper-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />

      {/* 3. Sell (እታ ማእከለይቲ ዓባይ) */}
      <Tabs.Screen
        name="sell"
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.sellButton,
                // 💡 ማጂክ: እቲ ዶብ (Border) ኣብ ጸልማት ጸሊም፡ ኣብ ብርሃን ድማ ፍዅስ ዝበለ ጻዕዳ ይኸውን
                { borderColor: isDarkMode ? "#121212" : "#f5f8fa" },
              ]}
            >
              <Ionicons name="add" size={32} color="#ffffff" />
            </View>
          ),
        }}
      />

      {/* 4. Notification */}
      <Tabs.Screen
        name="notification"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "notifications" : "notifications-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />

      {/* 5. Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />

      {/* 💡 ነታ 6ይቲ ባዶ ሳጹን ንምሕባእ */}
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}

// ==========================================================
// 🎨 ዲዛይን (Styles)
// ==========================================================
const styles = StyleSheet.create({
  sellButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#029eff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 35, // 💡 ካብቲ ባር ንላዕሊ ሓፍ ንምባል
    borderWidth: 4, // 💡 ዶብ ጌርና ከም ዝተቖርጸ ንምምሳል (ሕብሩ ናብ ላዕሊ ተሰጋጊሩ ኣሎ)
    elevation: 8,
    shadowColor: "#029eff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
});
