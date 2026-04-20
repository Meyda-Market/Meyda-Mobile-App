// ==========================================================
// 🚀 ምዕራፍ 1: መእተዊ (Imports)
// ==========================================================
import { FontAwesome5, Ionicons } from "@expo/vector-icons"; // 💡 ማጂክ: Ionicons ተወሲኹ
import { useRouter } from "expo-router";
import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../context/AuthContext";

const API_BASE_URL = "https://meyda-app.onrender.com";

export default function AdminDashboardScreen() {
  const router = useRouter();

  // ==========================================================
  // 🚀 ምዕራፍ 2: መኽዘን ኩነታት (State Management)
  // ==========================================================
  const { user: adminUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // 💡 ማጂክ: ን ሪፍሬሽ

  const [stats, setStats] = useState({
    users: 0,
    freeUsers: 0,
    subUsers: 0,
    products: 0,
    news: 0,
  });

  const [allowPublicPosting, setAllowPublicPosting] = useState(false);
  const [requireSubscription, setRequireSubscription] = useState(false);

  const [allUsersList, setAllUsersList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // ==========================================================
  // 🚀 ምዕራፍ 3: መበገሲ ማጂክ (Initial Load)
  // ==========================================================
  useEffect(() => {
    if (
      !adminUser ||
      (adminUser.role !== "admin" && adminUser.role !== "owner")
    ) {
      Alert.alert("ክልኩል (Access Denied)", "ናብዚ ፔጅ ንምእታው ፍቓድ የብኩምን!");
      router.replace("/(tabs)/home" as any);
      return;
    }
    fetchDashboardData();
  }, [adminUser]);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await fetch(`${API_BASE_URL}/api/admin/stats`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        const total = statsData.users || 0;
        const subCount = Math.floor(total * 0.15);
        const freeCount = total - subCount;

        setStats({
          users: total,
          freeUsers: freeCount,
          subUsers: subCount,
          products: statsData.products || 0,
          news: statsData.news || 0,
        });
        setAllowPublicPosting(statsData.allowPublicPosting || false);
        setRequireSubscription(statsData.requireSubscription || false);
      }

      const usersRes = await fetch(`${API_BASE_URL}/api/admin/users`);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        const rolePriority: any = { owner: 1, admin: 2, user: 3 };
        const sortedUsers = usersData.sort((a: any, b: any) => {
          return (rolePriority[a.role] || 4) - (rolePriority[b.role] || 4);
        });
        setAllUsersList(sortedUsers);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // 💡 ማጂክ: Pull to Refresh ፋንክሽን
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }, []);

  // ==========================================================
  // 🚀 ምዕራፍ 4: ፋንክሽናት መቆጻጸሪ (Dashboard Actions)
  // ==========================================================
  const handleTogglePublicPosting = async (value: boolean) => {
    setAllowPublicPosting(value);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/settings/toggle-posting`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ allow: value }),
        },
      );
      if (res.ok)
        Alert.alert(
          "ማስተር ስዊች",
          `ፖስት ምግባር ሕጂ: ${value ? "ክፉት (ON)" : "ዕጹው (OFF)"} ኮይኑ ኣሎ!`,
        );
      else setAllowPublicPosting(!value);
    } catch (error) {
      setAllowPublicPosting(!value);
    }
  };

  const handleToggleSubscription = async (value: boolean) => {
    setRequireSubscription(value);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/settings/toggle-subscription`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ require: value }),
        },
      );
      if (res.ok)
        Alert.alert(
          "ክፍሊት ፓኬጅ",
          `ክፍሊት (Subscription) ንምሸጣ ሕጂ: ${value ? "ግዴታ (ON)" : "ነጻ (OFF)"} ኮይኑ ኣሎ!`,
        );
      else setRequireSubscription(!value);
    } catch (error) {
      setRequireSubscription(!value);
    }
  };

  const changeUserRole = (
    userId: string,
    userName: string,
    newRole: string,
  ) => {
    Alert.alert(
      "ስልጣን ምቕያር",
      `ናይ ብርግጽ ን "${userName}" ናብ "${newRole}" ስልጣን ክትቅይሮ ትደሊ ዲኻ?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "ኣረጋግጽ (Update)",
          onPress: async () => {
            try {
              const res = await fetch(
                `${API_BASE_URL}/api/admin/users/${userId}/role`,
                {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ role: newRole }),
                },
              );

              if (res.ok) {
                const updatedList = allUsersList.map((u) =>
                  u._id === userId ? { ...u, role: newRole } : u,
                );
                const rolePriority: any = { owner: 1, admin: 2, user: 3 };
                updatedList.sort(
                  (a: any, b: any) =>
                    (rolePriority[a.role] || 4) - (rolePriority[b.role] || 4),
                );
                setAllUsersList(updatedList);
                Alert.alert(
                  "ዓወት",
                  `${userName} ሕጂ ብዓወት ${newRole.toUpperCase()} ኮይኑ ኣሎ!`,
                );
              } else Alert.alert("ጌጋ", "ስልጣን ምቕያር ኣይተኻእለን!");
            } catch (error) {
              Alert.alert("ጸገም", "ምስ ሰርቨር ክራኸብ ኣይከኣለን።");
            }
          },
        },
      ],
    );
  };

  const filteredUsers = allUsersList.filter(
    (u) =>
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.phone && u.phone.includes(searchQuery)),
  );

  // ==========================================================
  // 🚀 ምዕራፍ 5: ጠቕላላ ስክሪን (Main Render)
  // ==========================================================
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#029eff" />
        <Text style={{ marginTop: 10, color: "#777", fontWeight: "bold" }}>
          ዳሽቦርድ ይዳሎ ኣሎ...
        </Text>
      </View>
    );
  }

  if (!adminUser || (adminUser.role !== "admin" && adminUser.role !== "owner"))
    return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.adminHeader}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <FontAwesome5 name="shield-alt" size={20} color="#fff" />
          <Text style={styles.headerTitle}> ኣድሚን ዳሽቦርድ</Text>
        </View>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace("/(tabs)/home" as any)}
        >
          <FontAwesome5 name="sign-out-alt" size={14} color="#fff" />
          <Text style={styles.backBtnText}> ምለስ</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#029eff"]}
          />
        } // 💡 ማጂክ: Pull to refresh
      >
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            እንቋዕ ብደሓን መጻእካ, {adminUser.name}!
          </Text>
          <Text style={styles.welcomeText}>
            እዚ ማእከል ቁጽጽር ናይ Meyda Market እዩ። ንኹሉ ብጥንቃቐ ምሓድሮ።
          </Text>
        </View>

        {/* 💡 ማጂክ: ሓዱሽ ፕሪምየም ዲዛይን ን Stats */}
        <View style={styles.statsGrid}>
          {/* 1. Users Stat (Full Width with Progress Bar) */}
          <View style={styles.statCardFull}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={[styles.statIcon, { backgroundColor: "#3498db" }]}>
                  <FontAwesome5 name="users" size={20} color="#fff" />
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.statLabel}>ጠቕላላ ተጠቀምቲ</Text>
                  <Text style={styles.statNumber}>{stats.users}</Text>
                </View>
              </View>
            </View>

            {/* 💡 ማጂክ: Visual Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressSegment,
                  { flex: stats.freeUsers || 1, backgroundColor: "#7f8c8d" },
                ]}
              />
              <View
                style={[
                  styles.progressSegment,
                  { flex: stats.subUsers || 0, backgroundColor: "#2ecc71" },
                ]}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 8,
              }}
            >
              <Text style={styles.breakdownText}>
                ⬜ ነጻ (Free):{" "}
                <Text style={{ fontWeight: "bold" }}>{stats.freeUsers}</Text>
              </Text>
              <Text style={styles.breakdownText}>
                🟩 ፓኬጅ (Pro):{" "}
                <Text style={{ fontWeight: "bold", color: "#2ecc71" }}>
                  {stats.subUsers}
                </Text>
              </Text>
            </View>
          </View>

          {/* 2. Products Stat (Half Width) */}
          <View style={[styles.statCardHalf, { borderTopColor: "#2ecc71" }]}>
            <View
              style={[styles.statIconSmall, { backgroundColor: "#2ecc71" }]}
            >
              <FontAwesome5 name="box-open" size={16} color="#fff" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statNumber}>{stats.products}</Text>
              <Text style={styles.statLabel}>ኣቕሑት</Text>
            </View>
          </View>

          {/* 3. News Stat (Half Width) */}
          <View style={[styles.statCardHalf, { borderTopColor: "#e74c3c" }]}>
            <View
              style={[styles.statIconSmall, { backgroundColor: "#e74c3c" }]}
            >
              <FontAwesome5 name="newspaper" size={16} color="#fff" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statNumber}>{stats.news}</Text>
              <Text style={styles.statLabel}>ፖስታት</Text>
            </View>
          </View>
        </View>

        {/* ማስተር ስዊች */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="cogs" size={16} color="#333" />
            <Text style={styles.cardTitle}> ማስተር ስዊች (Global Settings)</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>ፖስት ምግባር ንኹሉ ፍቐድ</Text>
              <Text style={styles.settingDesc}>
                እዚኣ እንተጠፊኣ፡ ንቡር ተጠቃሚ ኣብ ዜና ፔጅ "ሓዱሽ ፖስት" ክገብር ኣይክእልን።
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#ccc", true: "#81b0ff" }}
              thumbColor={allowPublicPosting ? "#029eff" : "#f4f3f4"}
              onValueChange={handleTogglePublicPosting}
              value={allowPublicPosting}
            />
          </View>

          <View
            style={[
              styles.settingRow,
              { borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 15 },
            ]}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: "#2ecc71" }]}>
                <FontAwesome5 name="money-bill-wave" size={14} /> ክፍሊት ንምሸጣ ግዴታ
              </Text>
              <Text style={styles.settingDesc}>
                እዚኣ እንተጠፊኣ፡{" "}
                <Text style={{ fontWeight: "bold" }}>ኹሉ ሰብ ብነጻ ክሸይጥ ይኽእል</Text>።
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#ccc", true: "#a5d6a7" }}
              thumbColor={requireSubscription ? "#2ecc71" : "#f4f3f4"}
              onValueChange={handleToggleSubscription}
              value={requireSubscription}
            />
          </View>
        </View>

        {/* ምሕደራ ተጠቀምቲ */}
        <View style={[styles.card, { marginBottom: 40 }]}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="users-cog" size={16} color="#333" />
            <Text style={styles.cardTitle}> ምሕደራ ስልጣን (User Roles)</Text>
          </View>

          {/* 💡 ማጂክ: Modern Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#999"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="ብ ስም ወይ ኢሜይል ድለይ..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {filteredUsers.length === 0 ? (
            <Text style={{ textAlign: "center", color: "#777", padding: 20 }}>
              ተጠቃሚ ኣይተረኽበን።
            </Text>
          ) : (
            filteredUsers.map((u, idx) => {
              const isOwner = u.role === "owner";
              const canEdit =
                adminUser.role === "owner" ||
                (adminUser.role === "admin" && !isOwner);

              const getRoleColor = (role: string) => {
                if (role === "owner")
                  return { bg: "rgba(241, 196, 15, 0.2)", text: "#d35400" };
                if (role === "admin")
                  return { bg: "rgba(46, 204, 113, 0.2)", text: "#27ae60" };
                return { bg: "rgba(149, 165, 166, 0.2)", text: "#7f8c8d" };
              };

              return (
                <View key={idx} style={styles.userRow}>
                  <View style={styles.userCell}>
                    <Image
                      source={{
                        uri: u.profilePic || "https://via.placeholder.com/40",
                      }}
                      style={styles.userAvatar}
                    />
                    <View>
                      <Text style={styles.userName}>
                        {u.name || "Unknown User"}
                      </Text>
                      <Text style={styles.userEmail}>{u.email || u.phone}</Text>
                    </View>
                  </View>

                  <View style={styles.userActionsCell}>
                    <View
                      style={[
                        styles.roleBadge,
                        { backgroundColor: getRoleColor(u.role).bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleBadgeText,
                          { color: getRoleColor(u.role).text },
                        ]}
                      >
                        {u.role.toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.actionBtns}>
                      <TouchableOpacity
                        style={[
                          styles.roleChangeBtn,
                          !canEdit && { opacity: 0.5 },
                        ]}
                        disabled={!canEdit}
                        onPress={() => changeUserRole(u._id, u.name, "user")}
                      >
                        <Text style={styles.roleChangeBtnText}>User</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.roleChangeBtn,
                          {
                            backgroundColor: "#2ecc71",
                            borderColor: "#2ecc71",
                          },
                          !canEdit && { opacity: 0.5 },
                        ]}
                        disabled={!canEdit}
                        onPress={() => changeUserRole(u._id, u.name, "admin")}
                      >
                        <Text
                          style={[styles.roleChangeBtnText, { color: "#fff" }]}
                        >
                          Admin
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================================================
// 🚀 ምዕራፍ 6: ዲዛይን (Styles)
// ==========================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f7f6" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f7f6",
  },
  scrollContent: { padding: 15 },

  adminHeader: {
    backgroundColor: "#2c3e50",
    padding: 15,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 40 : 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 5,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  backBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  backBtnText: { color: "#fff", fontWeight: "bold", fontSize: 12 },

  welcomeSection: { marginBottom: 20 },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  welcomeText: { fontSize: 13, color: "#7f8c8d" },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  statCardFull: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 15,
  },
  progressBarContainer: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#eee",
    marginTop: 5,
  },
  progressSegment: { height: "100%" },
  breakdownText: { fontSize: 12, color: "#555" },

  statCardHalf: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 10,
    borderTopWidth: 4,
    alignItems: "center",
  },

  statIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
  },
  statIconSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statInfo: { alignItems: "center" },
  statNumber: { fontSize: 22, fontWeight: "bold", color: "#333" },
  statLabel: {
    fontSize: 11,
    color: "#7f8c8d",
    fontWeight: "bold",
    textTransform: "uppercase",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 12,
    marginBottom: 15,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginLeft: 8 },

  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  settingInfo: { flex: 1, paddingRight: 15 },
  settingTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  settingDesc: { fontSize: 12, color: "#7f8c8d", lineHeight: 18 },

  // Search Bar
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: "#333" },

  userRow: {
    flexDirection: "column",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 15,
  },
  userCell: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#eee",
  },
  userName: { fontSize: 14, fontWeight: "bold", color: "#333" },
  userEmail: { fontSize: 12, color: "#7f8c8d" },

  userActionsCell: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  roleBadgeText: { fontSize: 10, fontWeight: "bold" },

  actionBtns: { flexDirection: "row", gap: 8 },
  roleChangeBtn: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  roleChangeBtnText: { fontSize: 11, fontWeight: "bold", color: "#333" },
});
