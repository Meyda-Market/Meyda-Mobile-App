import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useState } from "react";

// 1. መኽዘን ንፈጥር
export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null); // መን ሎግ-ኢን ጌሩ ኣሎ?
  const [isLoading, setIsLoading] = useState(true);

  // 2. ኣፕሊኬሽን ምስ ተኸፍተ ሓበሬታ ይደሊ
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem("meydaUser");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (e) {
      console.log(e);
    }
    setIsLoading(false);
  };

  // 3. ሎግ-ኣውት ንምግባር
  const logout = async () => {
    await AsyncStorage.removeItem("meydaToken");
    await AsyncStorage.removeItem("meydaUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
