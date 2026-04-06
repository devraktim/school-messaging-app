import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_BAR_HEIGHT = Platform.OS === "web" ? 84 : 60;

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
    }}>
      <View style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "rgba(21,101,192,0.1)",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Feather name={icon as any} size={16} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_500Medium", marginBottom: 2 }}>
          {label}
        </Text>
        <Text style={{ fontSize: 15, color: colors.foreground, fontFamily: "Inter_500Medium" }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout, refreshProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  };

  if (!user) return null;

  const isTeacher = user.role === "teacher";
  const bottomPad = TAB_BAR_HEIGHT + insets.bottom + 20;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.primary,
      paddingTop: Platform.OS === "web" ? insets.top + 67 : insets.top,
      paddingBottom: 32,
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 16,
      color: "rgba(255,255,255,0.8)",
      fontFamily: "Inter_500Medium",
      paddingTop: 14,
    },
    avatarRing: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: "#ffffff",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    avatarInner: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarInitial: {
      fontSize: 30,
      fontWeight: "700",
      color: "#0a0a0a",
      fontFamily: "Inter_700Bold",
    },
    name: {
      fontSize: 20,
      fontWeight: "700",
      color: "#ffffff",
      fontFamily: "Inter_700Bold",
      marginTop: 12,
      textAlign: "center",
      paddingHorizontal: 20,
    },
    roleBadge: {
      marginTop: 8,
      backgroundColor: colors.secondary,
      paddingHorizontal: 16,
      paddingVertical: 5,
      borderRadius: 20,
    },
    roleBadgeText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#0a0a0a",
      fontFamily: "Inter_700Bold",
    },
    card: {
      marginHorizontal: 16,
      marginTop: 16,
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    cardTitle: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.primary,
      fontFamily: "Inter_700Bold",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    chipsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      padding: 16,
    },
    chip: {
      backgroundColor: "rgba(21,101,192,0.1)",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    chipText: {
      fontSize: 13,
      color: colors.primary,
      fontFamily: "Inter_500Medium",
    },
    logoutCard: {
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 16,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    logoutBtn: {
      height: 56,
      backgroundColor: "#FEE2E2",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 10,
      borderRadius: 16,
    },
    logoutText: {
      fontSize: 15,
      color: "#DC2626",
      fontFamily: "Inter_600SemiBold",
    },
    bottomSpacer: {
      height: bottomPad,
    },
  });

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.avatarRing}>
          <View style={styles.avatarInner}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{isTeacher ? "👨‍🏫 Teacher" : "🎓 Student"}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        bounces
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact Info</Text>
          <InfoRow icon="mail" label="Email" value={user.email || "N/A"} />
          <InfoRow icon="phone" label="Phone" value={user.phone || "N/A"} />
        </View>

        {isTeacher ? (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Teaching Info</Text>
              <InfoRow icon="book" label="Subject" value={user.subject ?? ""} />
            </View>
            {user.assignedClasses && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Assigned Classes</Text>
                <View style={styles.chipsContainer}>
                  {user.assignedClasses.map((cls) => (
                    <View key={cls} style={styles.chip}>
                      <Text style={styles.chipText}>{cls}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Academic Info</Text>
            <InfoRow icon="calendar" label="Date of Birth" value={user.dob ?? ""} />
            <InfoRow icon="layers" label="Class" value={user.class ?? ""} />
            <InfoRow icon="grid" label="Section" value={user.section ?? ""} />
            <InfoRow icon="hash" label="Student No" value={user.rollNumber ?? ""} />
          </View>
        )}

        {/* Logout button — always visible */}
        <View style={{ marginHorizontal: 16, marginTop: 20 }}>
          <Pressable
            style={({ pressed }) => [styles.logoutBtn, { opacity: pressed ? 0.8 : 1 }]}
            onPress={handleLogout}
          >
            <Feather name="log-out" size={20} color="#DC2626" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
