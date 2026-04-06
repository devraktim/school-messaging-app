import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth, UserRole } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Please enter your username.");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Error", "Please enter your password.");
      return;
    }
    setLoading(true);
    const success = await login(username.trim(), password, role);
    setLoading(false);
    if (success) {
      router.replace("/(tabs)");
    } else {
      Alert.alert("Login Failed", "Invalid username or password. Please try again.");
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topSection: {
      backgroundColor: colors.primary,
      paddingTop: Platform.OS === "web" ? insets.top + 67 : insets.top + 40,
      paddingBottom: 40,
      alignItems: "center",
    },
    logoCircle: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: "#ffffff",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
    logoInner: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 3,
      borderColor: colors.secondary,
    },
    logoText: {
      fontSize: 28,
      fontWeight: "700",
      color: "#ffffff",
      fontFamily: "Inter_700Bold",
    },
    schoolName: {
      fontSize: 22,
      fontWeight: "700",
      color: "#ffffff",
      textAlign: "center",
      fontFamily: "Inter_700Bold",
      letterSpacing: 0.5,
    },
    subtitle: {
      fontSize: 13,
      color: "rgba(255,255,255,0.75)",
      marginTop: 6,
      fontFamily: "Inter_400Regular",
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    yellowBar: {
      height: 4,
      backgroundColor: colors.secondary,
      width: 60,
      borderRadius: 2,
      marginTop: 12,
    },
    formCard: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 24,
      paddingTop: 32,
      paddingBottom: insets.bottom + 32,
    },
    formTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      marginBottom: 6,
    },
    formSubtitle: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginBottom: 28,
    },
    label: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: "Inter_500Medium",
      marginBottom: 8,
      letterSpacing: 0.3,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.card,
      marginBottom: 18,
      paddingHorizontal: 14,
    },
    inputIcon: { marginRight: 10 },
    input: {
      flex: 1,
      height: 50,
      fontSize: 15,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    roleLabel: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: "Inter_500Medium",
      marginBottom: 10,
    },
    roleRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 28,
    },
    roleBtn: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },
    roleBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    roleBtnInactive: { backgroundColor: colors.card, borderColor: colors.border },
    roleBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
    roleBtnTextActive: { color: "#ffffff" },
    roleBtnTextInactive: { color: colors.mutedForeground },
    loginBtn: {
      height: 54,
      backgroundColor: colors.primary,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 6,
    },
    loginBtnText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#ffffff",
      fontFamily: "Inter_700Bold",
      letterSpacing: 0.5,
    },
    poweredBy: {
      marginTop: 20,
      textAlign: "center",
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
  });

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces
        >
          <View style={styles.topSection}>
            <View style={styles.logoCircle}>
              <View style={styles.logoInner}>
                <Text style={styles.logoText}>✝</Text>
              </View>
            </View>
            <Text style={styles.schoolName}>St. Anthony Kurseong</Text>
            <Text style={styles.subtitle}>School Messaging App</Text>
            <View style={styles.yellowBar} />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Welcome Back</Text>
            <Text style={styles.formSubtitle}>Sign in to your account</Text>

            <Text style={styles.label}>USERNAME</Text>
            <View style={styles.inputContainer}>
              <Feather name="user" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter username"
                placeholderTextColor={colors.mutedForeground}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.inputContainer}>
              <Feather name="lock" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <Text style={styles.roleLabel}>LOGIN AS</Text>
            <View style={styles.roleRow}>
              <Pressable
                style={[styles.roleBtn, role === "student" ? styles.roleBtnActive : styles.roleBtnInactive]}
                onPress={() => setRole("student")}
              >
                <Feather name="book-open" size={16} color={role === "student" ? "#ffffff" : colors.mutedForeground} />
                <Text style={[styles.roleBtnText, role === "student" ? styles.roleBtnTextActive : styles.roleBtnTextInactive]}>
                  Student
                </Text>
              </Pressable>
              <Pressable
                style={[styles.roleBtn, role === "teacher" ? styles.roleBtnActive : styles.roleBtnInactive]}
                onPress={() => setRole("teacher")}
              >
                <Feather name="briefcase" size={16} color={role === "teacher" ? "#ffffff" : colors.mutedForeground} />
                <Text style={[styles.roleBtnText, role === "teacher" ? styles.roleBtnTextActive : styles.roleBtnTextInactive]}>
                  Teacher
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [styles.loginBtn, { opacity: pressed ? 0.9 : 1 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginBtnText}>Sign In</Text>
              )}
            </Pressable>

            <Text style={styles.poweredBy}>Powered by Ks Ignited Soft</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
