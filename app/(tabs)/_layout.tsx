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

        // 💡 ማጂክ 2: ካብ ታሕቲ ዝነበረ ክፍተት ተዓጽዩ፣ የማንን ጸጋምን ምሉእ ስክሪን ሒዙ ኣሎ!
        tabBarStyle: {
          position: "absolute",
          bottom: 0, // 👈 ክፍተት ጠፊኡ ናብ ታሕቲ ተለጢጡ!
          left: 0, // 👈 የማንን ጸጋምን ምሉእ ኮይኑ
          right: 0,
          backgroundColor: isDarkMode ? "#1E1E1E" : "#ffffff",
          borderTopLeftRadius: 6, // 👈 ላዕለዋይ ክፋል ጥራሕ ማራኺ ክቢ ይኸውን
          borderTopRightRadius: 6,
          borderBottomLeftRadius: 0, // 👈 ታሕተዋይ ክፋል ትኽ ይብል (ክፍተት ይዓጹ)
          borderBottomRightRadius: 0,
          height: Platform.OS === "ios" ? 85 : 65, // 👈 ንታሕቲ ብግቡእ ንኽሽፍን
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 }, // 👈 ጽላሎት ናብ ላዕሊ ይኸውን
          shadowOpacity: isDarkMode ? 0.4 : 0.1,
          shadowRadius: 5,
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
