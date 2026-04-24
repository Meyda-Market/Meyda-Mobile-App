// ==========================================================
// 🚀 መእተዊ (Imports)
// ==========================================================
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useContext } from "react";
import { Platform, StatusBar, StyleSheet, View } from "react-native"; // 💡 ሓዱሽ: StatusBar ተወሲኻ
import { useSafeAreaInsets } from "react-native-safe-area-context"; // 💡 ሓዱሽ: ማጂክ መለክዒ ጸሊም ባር
import { ThemeContext } from "../../context/ThemeContext";

export default function TabLayout() {
  const { isDarkMode } = useContext(ThemeContext);

  // 💡 ማጂክ 1: እዚኣ ሞባይልካ ክንደይ ጸሊም ባር ከምዘለዋ ብትኽክል ትዕቅን!
  const insets = useSafeAreaInsets();

  return (
    <>
      {/* 💡 ማጂክ 2: እታ ዝደለኻያ ሰማያዊት ስታተስ ባር (ምስ ጻዕዳ ጽሑፍ/ባትሪ) */}
      <StatusBar backgroundColor="#029eff" barStyle="light-content" />

      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#029eff",
          tabBarInactiveTintColor: isDarkMode ? "#AAAAAA" : "#888888",
          tabBarShowLabel: false,
          headerShown: false,

          // 💡 ማጂክ 3: ዲዛይን ንኹሉ ቴሌፎናት ዝሰማማዕ ኮይኑ ተሰሪሑ ኣሎ
          tabBarStyle: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: isDarkMode ? "#1E1E1E" : "#ffffff",
            borderTopLeftRadius: 15, // 👈 ቁሩብ ዝያዳ ማራኺ ክቢ ንምግባር
            borderTopRightRadius: 15,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,

            // 👈 💡 ማጂክ 4: እቲ ጸሊም ባር (insets.bottom) ምስቲ ንቡር ቁመት ይድመር!
            height: (Platform.OS === "ios" ? 85 : 65) + insets.bottom,

            // 👈 💡 ማጂክ 5: ኣይኮናትን ጽሑፋትን ብዓቐን እቲ ጸሊም ባር ንላዕሊ ድፍእ ይብሉ
            paddingBottom: insets.bottom > 0 ? insets.bottom : 10,

            borderTopWidth: 0,
            elevation: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: isDarkMode ? 0.3 : 0.1,
            shadowRadius: 6,
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
                  // 💡 እቲ ዶብ (Border) ኣብ ጸልማት ጸሊም፡ ኣብ ብርሃን ድማ ፍዅስ ዝበለ ጻዕዳ ይኸውን
                  { borderColor: isDarkMode ? "#1E1E1E" : "#ffffff" },
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
    </>
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
    // 💡 ማጂክ 6: እዛ መጥወቒት ምስቲ ሓዱሽ ቁመት ብትኽክል ንኽትቀናጆ ተመዓራርያ ኣላ
    marginBottom: Platform.OS === "ios" ? 40 : 25,
    borderWidth: 5,
    elevation: 8,
    shadowColor: "#029eff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
});
