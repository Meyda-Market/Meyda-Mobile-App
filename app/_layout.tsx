import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "react-native";
// 💡 1. ነታ ዝሰራሕናያ ሓንጎል ነምጽኣ
import { AuthProvider } from "../context/AuthContext";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    /* 💡 2. ምሉእ ኣፕሊኬሽንና በታ ሓንጎል ይጥቕለል */
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* 💡 3. እታ ሓዳስ ዳሽቦርድ ኣብዚ ትኣቱ */}
          <Stack.Screen name="dashboard" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
