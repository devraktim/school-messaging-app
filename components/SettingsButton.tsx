import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

export default function SettingsButton({
  color = "#fff",
  size = 22,
  route = "/settings",
}: {
  color?: string;
  size?: number;
  route?: string;
}) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.7 : 1 }]}
      onPress={() => router.push(route)}
    >
      <Feather name="settings" size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: 6,
  },
});