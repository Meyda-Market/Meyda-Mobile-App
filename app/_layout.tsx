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
import { ThemeProvider as MeydaThemeProvider } from "../context/ThemeContext";

// 👈 💡 ማጂክ 1: ኣፕሊኬሽን ክትክፈት ከላ መጀመርያ ናብ "welcome" ክትከይድ ኣዚዝናያ ኣለና!
export const unstable_settings = {
  initialRouteName: "welcome",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <AuthProvider>
      <MeydaThemeProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <StatusBar style="light" backgroundColor="#000000" />
          <Stack>
            {/* 👈 💡 ማጂክ 2: እታ ሓዳስ ናይ ክልል መምረጺት ማዕጾ ተፈጢራ ኣላ */}
            <Stack.Screen name="welcome" options={{ headerShown: false }} />

            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="dashboard" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          </Stack>
        </ThemeProvider>
      </MeydaThemeProvider>
    </AuthProvider>
  );
}
