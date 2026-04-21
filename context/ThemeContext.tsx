import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

// 1. Context ንፈጥር
export const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // ናይ ሞባይል ባዕላ (System) ጸሊም ድዩ ጻዕዳ ንፈልጥ
  const systemTheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 2. ኣፕሊኬሽን ክኽፈት ከሎ፡ ቅድም ዝተመረጸ ሕብሪ ኣሎ ዶ ንርእዮ
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem("meydaTheme");
      if (savedTheme) {
        setIsDarkMode(savedTheme === "dark");
      } else {
        setIsDarkMode(systemTheme === "dark");
      }
    };
    loadTheme();
  }, []);

  // 3. ወርሒ ክትጥወቕ ከላ ዝሰርሕ ፈንክሽን
  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    await AsyncStorage.setItem("meydaTheme", newTheme ? "dark" : "light");
  };
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
