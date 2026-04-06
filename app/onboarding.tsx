import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SLIDES = [
  {
    id: 1,
    icon: "home" as const,
    iconBg: "#1565C0",
    accent: "#FFD600",
    title: "Welcome to\nSt. Anthony Kurseong",
    subtitle: "A smart way to stay connected with your school community.",
    btnLabel: "Next",
  },
  {
    id: 2,
    icon: "message-circle" as const,
    iconBg: "#1565C0",
    accent: "#FFD600",
    title: "Stay Connected",
    subtitle: "Chat with teachers, students, and your class anytime from anywhere.",
    btnLabel: "Next",
  },
  {
    id: 3,
    icon: "bell" as const,
    iconBg: "#1565C0",
    accent: "#FFD600",
    title: "Never Miss Updates",
    subtitle: "Get important announcements and messages from your school instantly.",
    btnLabel: "Get Started",
  },
];

const ICON_DECORATIONS: Record<number, { icon: string; x: number; y: number; size: number; opacity: number }[]> = {
  0: [
    { icon: "book", x: 0.1, y: 0.22, size: 20, opacity: 0.3 },
    { icon: "users", x: 0.82, y: 0.3, size: 18, opacity: 0.25 },
    { icon: "star", x: 0.15, y: 0.55, size: 14, opacity: 0.2 },
  ],
  1: [
    { icon: "message-square", x: 0.08, y: 0.25, size: 22, opacity: 0.3 },
    { icon: "send", x: 0.8, y: 0.28, size: 18, opacity: 0.25 },
    { icon: "smile", x: 0.85, y: 0.55, size: 16, opacity: 0.2 },
  ],
  2: [
    { icon: "alert-circle", x: 0.1, y: 0.2, size: 20, opacity: 0.3 },
    { icon: "check-circle", x: 0.82, y: 0.3, size: 18, opacity: 0.25 },
    { icon: "zap", x: 0.12, y: 0.55, size: 16, opacity: 0.2 },
  ],
};

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const goTo = (index: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setCurrent(index);
      Animated.parallel([
        Animated.spring(fadeAnim, { toValue: 1, useNativeDriver: true, friction: 8 }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 8 }),
      ]).start();
    });
  };

  const handleNext = async () => {
    if (current < SLIDES.length - 1) {
      goTo(current + 1);
    } else {
      await AsyncStorage.setItem("onboarding_complete", "true");
      router.replace("/login");
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem("onboarding_complete", "true");
    router.replace("/login");
  };

  const slide = SLIDES[current];
  const decorations = ICON_DECORATIONS[current] ?? [];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#EEF4FB",
    },
    topSection: {
      flex: 1,
      backgroundColor: "#1565C0",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      borderBottomLeftRadius: 40,
      borderBottomRightRadius: 40,
    },
    skipBtn: {
      position: "absolute",
      top: Platform.OS === "web" ? insets.top + 67 : insets.top + 14,
      right: 20,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.18)",
    },
    skipText: {
      fontSize: 13,
      color: "rgba(255,255,255,0.9)",
      fontFamily: "Inter_500Medium",
    },
    illustrationWrap: {
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: "rgba(255,255,255,0.12)",
      alignItems: "center",
      justifyContent: "center",
    },
    illustrationInner: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: "rgba(255,255,255,0.18)",
      alignItems: "center",
      justifyContent: "center",
    },
    accentRing: {
      position: "absolute",
      width: 180,
      height: 180,
      borderRadius: 90,
      borderWidth: 2,
      borderColor: "#FFD600",
      opacity: 0.4,
    },
    bottomSection: {
      paddingHorizontal: 28,
      paddingTop: 32,
      paddingBottom: Platform.OS === "web" ? insets.bottom + 30 : insets.bottom + 20,
      alignItems: "center",
    },
    title: {
      fontSize: 26,
      fontWeight: "700",
      color: "#0a0a0a",
      fontFamily: "Inter_700Bold",
      textAlign: "center",
      lineHeight: 34,
      marginBottom: 14,
    },
    subtitle: {
      fontSize: 15,
      color: "#6B7280",
      fontFamily: "Inter_400Regular",
      textAlign: "center",
      lineHeight: 23,
      marginBottom: 32,
    },
    dotsRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 28,
    },
    dot: {
      height: 8,
      borderRadius: 4,
      backgroundColor: "#D1D5DB",
    },
    dotActive: {
      backgroundColor: "#1565C0",
    },
    nextBtn: {
      width: "100%",
      height: 56,
      borderRadius: 16,
      backgroundColor: "#1565C0",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 10,
      shadowColor: "#1565C0",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 8,
    },
    nextBtnText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#ffffff",
      fontFamily: "Inter_700Bold",
    },
    yellowAccent: {
      position: "absolute",
      bottom: -10,
      left: "15%",
      right: "15%",
      height: 4,
      backgroundColor: "#FFD600",
      borderRadius: 2,
    },
    pageIndicatorText: {
      fontSize: 12,
      color: "#9CA3AF",
      fontFamily: "Inter_500Medium",
      marginBottom: 16,
    },
  });

  return (
    <View style={styles.container}>
      {/* Top illustration area */}
      <View style={styles.topSection}>
        {/* Skip button */}
        {current < SLIDES.length - 1 && (
          <Pressable style={styles.skipBtn} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}

        {/* Floating decorative icons */}
        {decorations.map((d, i) => (
          <Feather
            key={i}
            name={d.icon as any}
            size={d.size}
            color="#ffffff"
            style={{
              position: "absolute",
              left: `${d.x * 100}%` as any,
              top: `${d.y * 100}%` as any,
              opacity: d.opacity,
            }}
          />
        ))}

        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], alignItems: "center" }}>
          <View style={styles.accentRing} />
          <View style={styles.illustrationWrap}>
            <View style={styles.illustrationInner}>
              <Feather name={slide.icon} size={56} color="#FFD600" />
            </View>
          </View>
        </Animated.View>

        {/* Bottom yellow accent */}
        <View style={styles.yellowAccent} />
      </View>

      {/* Bottom content */}
      <View style={styles.bottomSection}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], alignItems: "center", width: "100%" }}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.subtitle}>{slide.subtitle}</Text>
        </Animated.View>

        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <Pressable key={i} onPress={() => goTo(i)}>
              <Animated.View
                style={[
                  styles.dot,
                  { width: i === current ? 24 : 8 },
                  i === current ? styles.dotActive : null,
                ]}
              />
            </Pressable>
          ))}
        </View>

        <Text style={styles.pageIndicatorText}>{current + 1} of {SLIDES.length}</Text>

        <Pressable
          style={({ pressed }) => [styles.nextBtn, { opacity: pressed ? 0.9 : 1 }]}
          onPress={handleNext}
        >
          <Text style={styles.nextBtnText}>{slide.btnLabel}</Text>
          <Feather name={current === SLIDES.length - 1 ? "check" : "arrow-right"} size={18} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  );
}
