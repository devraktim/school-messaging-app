import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import {
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const isTeacher = user?.role === "teacher";
  const initial = user?.name?.charAt(0)?.toUpperCase() || "";

  const openLink = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action is permanent and cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // 👉 API call here
              await logout();
              router.replace("/login");
            } catch {
              Alert.alert("Error", "Something went wrong.");
            }
          },
        },
      ]
    );
  };

  const appVersion =
    Constants.expoConfig?.version || Constants.nativeAppVersion || "1.0.0";

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    header: {
      backgroundColor: colors.primary,
      paddingTop: Platform.OS === "web" ? insets.top + 67 : insets.top,
      paddingBottom: 28,
      alignItems: "center",
    },

    headerRow: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
    },

    backBtn: {
      padding: 6,
      marginRight: 8,
    },

    headerTitle: {
      fontSize: 20,
      color: "#fff",
      fontFamily: "Inter_700Bold",
    },

    avatarRing: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "#fff",
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
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },

    avatarText: {
      fontSize: 26,
      fontFamily: "Inter_700Bold",
      color: "#0a0a0a",
    },

    name: {
      fontSize: 18,
      color: "#fff",
      fontFamily: "Inter_700Bold",
      marginTop: 10,
    },

    roleBadge: {
      marginTop: 6,
      backgroundColor: colors.secondary,
      paddingHorizontal: 14,
      paddingVertical: 4,
      borderRadius: 20,
    },

    roleText: {
      fontSize: 12,
      fontFamily: "Inter_700Bold",
      color: "#0a0a0a",
    },

    card: {
      marginHorizontal: 16,
      marginTop: 16,
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: "hidden",
      elevation: 3,
    },

    cardTitle: {
      fontSize: 12,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    rowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: "rgba(21,101,192,0.1)",
      alignItems: "center",
      justifyContent: "center",
    },

    label: {
      fontSize: 15,
      color: colors.foreground,
      fontFamily: "Inter_500Medium",
    },

    deleteBtn: {
      margin: 16,
      height: 56,
      backgroundColor: "#FEE2E2",
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 10,
    },

    deleteText: {
      color: "#DC2626",
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
    },

    version: {
      textAlign: "center",
      marginTop: 20,
      marginBottom: 30,
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_500Medium",
    },
  });

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* PROFILE */}
        <View style={styles.avatarRing}>
          <View style={styles.avatarInner}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        </View>

        <Text style={styles.name}>{user?.name}</Text>

        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {isTeacher ? "👨‍🏫 Teacher" : "🎓 Student"}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* LEGAL */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Legal</Text>

          {[
            ["Terms of Service", "file-text", "https://ignitedsoft.in/terms-of-service.html"],
            ["Privacy Policy", "shield", "https://ignitedsoft.in/privacy-policy.html"],
            ["Data Safety Policy", "lock", "https://ignitedsoft.in/data-safety-policy.html"],
            ["Children’s Safety Policy", "users", "https://ignitedsoft.in/children-safety-policy.html"],
            ["Account Deletion Policy", "trash-2", "https://ignitedsoft.in/account-deletion-policy.html"],
          ].map(([label, icon, url], i) => (
            <Pressable
              key={label}
              style={[styles.row, i === 3 && { borderBottomWidth: 0 }]}
              onPress={() => openLink(url as string)}
            >
              <View style={styles.rowLeft}>
                <View style={styles.iconBox}>
                  <Feather name={icon as any} size={16} color={colors.primary} />
                </View>
                <Text style={styles.label}>{label}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </Pressable>
          ))}
        </View>

        {/* DELETE */}
        {/* <Pressable style={styles.deleteBtn} onPress={handleDeleteAccount}>
          <Feather name="trash-2" size={20} color="#DC2626" />
          <Text style={styles.deleteText}>Delete My Account</Text>
        </Pressable> */}

        {/* VERSION */}
        <Text style={styles.version}>App Version {appVersion}</Text>
      </ScrollView>
    </View>
  );
}