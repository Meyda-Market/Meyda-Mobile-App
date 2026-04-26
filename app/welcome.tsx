import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 📍 እተን 11 ክልላት (Regions)
const REGIONS = [
  "Tigray",
  "Addis Ababa",
  "Amhara",
  "Oromia",
  "Afar",
  "Somalia",
  "Debub",
  "Harar",
  "Benshangul",
  "Gambela",
  "Dire Dawa",
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // 👈 💡 ማጂክ 1: ኣፕሊኬሽን ክትክፈት ከላ "ቅድሚ ሕጂ መሪጹ ዶ?" ኢላ ትሓትት
  useEffect(() => {
    const checkRegion = async () => {
      try {
        const savedRegion = await AsyncStorage.getItem("meydaRegion");
        if (savedRegion) {
          // መሪጹ እንተነይሩ፡ ነዚ ገጽ ኣይተርእዮን! ቀጥታ ናብ Home ስደዶ!
          router.replace("/(tabs)/home");
        } else {
          setLoading(false);
        }
      } catch (e) {
        setLoading(false);
      }
    };
    checkRegion();
  }, []);

  // 👈 💡 ማጂክ 2: ክልል ምስ መረጸ ኣብ ኮምፒተር (ሞባይል) ዓቂብካ ናብ Home ምስዳድ
  const selectRegion = async (region: string) => {
    await AsyncStorage.setItem("meydaRegion", region);
    router.replace("/(tabs)/home");
  };

  // ማጂክ እናሰራሕና ከለና ዝጥወዝ ምልክት (Loading)
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#029eff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="location" size={45} color="#029eff" />
        <Text style={styles.title}>እንቋዕ ብደሓን መጻእኩም!</Text>
        <Text style={styles.subtitle}>በጃኹም እትነብሩሉ ክልል (Region) ምረጹ፡</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {REGIONS.map((region, index) => (
          <TouchableOpacity
            key={index}
            style={styles.regionBtn}
            onPress={() => selectRegion(region)}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="map-outline"
                size={20}
                color="#555"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.regionText}>{region}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#029eff" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7f6",
  },
  header: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#333",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginTop: 5,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  regionBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    elevation: 1,
  },
  regionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});
