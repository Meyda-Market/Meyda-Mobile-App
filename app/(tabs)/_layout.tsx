// ==========================================================
// 🚀 መእተዊ (Imports)
// ==========================================================
import { Ionicons } from "@expo/vector-icons";
import * as NavigationBar from "expo-navigation-bar"; // 💡 ማጂክ ን ታሕተዋይ ጸሊም ባር
import { Tabs } from "expo-router";
import React, { useContext, useEffect } from "react";
import { Platform, StatusBar, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemeContext } from "../../context/ThemeContext";

export default function TabLayout() {
  const { isDarkMode } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  // 💡 ማጂክ 1: ነቲ ናይ ሞባይል ታሕተዋይ ባር (System Navigation) ብግዴታ ጸሊም ይገብሮ
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("#000000").catch(() => {});
    }
  }, []);

  return (
    // 💡 ማጂክ 2: እዚ Wrapper ነቲ ኣፕሊኬሽን ካብ ላዕሊ ብዓቐን እቲ ስታተስ ባር ንታሕቲ ይደፍኦ
    <View
      style={{ flex: 1, backgroundColor: isDarkMode ? "#121212" : "#f5f8fa" }}
    >
      {/* 💡 ማጂክ 3: እዚኣ ነታ ስታተስ ባር ልክዕ ብዓቐን ናይ ሞባይልካ ቆፎ ቆሪጻ 100% ሰማያዊ ትገብራ! */}
      <View
        style={{ height: insets.top, backgroundColor: "#029eff", zIndex: 1000 }}
      >
        <StatusBar
          backgroundColor="#029eff"
          barStyle="light-content"
          translucent={true}
        />
      </View>

      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#029eff",
          tabBarInactiveTintColor: isDarkMode ? "#AAAAAA" : "#888888",
          tabBarShowLabel: false,
          headerShown: false,

          // 💡 ማጂክ 4: ታሕተዋይ ናቪጌሽን ባር (Compact & Clean) - "position: absolute" ደምሲስናዮ!
          tabBarStyle: {
            backgroundColor: isDarkMode ? "#1E1E1E" : "#ffffff",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            height: 60, // 👈 ብጣዕሚ ኣሕጺርናዮ (ቦታ ከይወስድ)
            borderTopWidth: 0,
            elevation: 15,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -5 },
            shadowOpacity: 0.1,
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
    </View>
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
    // 💡 ማጂክ 5: ካብቲ ሓጺር ባር ንላዕሊ ቁሩብ ፍንትት ክትብል
    top: -20,
    borderWidth: 5,
    elevation: 8,
    shadowColor: "#029eff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
});
