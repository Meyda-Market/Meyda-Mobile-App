import { Ionicons } from "@expo/vector-icons"; // 💡 ሓደስቲን ጽፉፋትን ኣይከናት
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#029eff", // ብራንድ ሕብሪ (ክጥወቕ ከሎ)
        tabBarInactiveTintColor: "#888888", // ዘይተጠውቀ
        tabBarShowLabel: false, // ጽሑፍ የብሉን
        headerShown: false, // ላዕለዋይ ርእሲ ንምጥፋእ

        // 💡 ሓዱሽ: ኣብ ኣየር ዝንሳፈፍ ማራኺ ዲዛይን (Floating Tab Bar)
        tabBarStyle: {
          position: "absolute",
          bottom: Platform.OS === "android" ? 15 : 25, // ካብ ታሕተዋይ ቆፎ ንምርሓቕ
          left: 20,
          right: 20,
          backgroundColor: "#ffffff",
          borderRadius: 10, // ጽቡቕ ክቢ (Pill shape)
          height: 65,
          borderTopWidth: 0,
          elevation: 10, // ናይ ኣንድሮይድ ጽላሎት (Shadow)
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
        },
      }}
    >
      {/* 1. Home */}
      <Tabs.Screen
        name="home"
        options={{
          // 💡 ተጠዊቑ እንተሎ ምሉእ ሕብሪ (home)፡ ተዘይኮይኑ ባዶ ሕብሪ (home-outline)
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
            <View style={styles.sellButton}>
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

      {/* 💡 ነታ 6ይቲ ባዶ ሳጹን ንምሕባእ (ዋላ delete እንተዘይጌርካያ ኣይትርአን እያ) */}
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}

// 🎨 ናይ ማእከል (+) መጥወቒት ፍሉይ ዲዛይን
const styles = StyleSheet.create({
  sellButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#029eff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 35, // 💡 ካብቲ ባር ንላዕሊ ሓፍ ንምባል
    borderWidth: 4, // 💡 ጻዕዳ ዶብ ጌርና ከም ዝተቖርጸ ንምምሳል
    borderColor: "#F0F2F5", // ናይቲ ባክግራውንድ ሕብሪ
    elevation: 8,
    shadowColor: "#029eff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
});
