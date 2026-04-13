import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

type MenuItem = {
  label: string;
  onPress: () => void;
};

export default function ThreeDotMenu({ items }: { items: MenuItem[] }) {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  return (
    <View style={{ position: "relative" }}>
      {/* 3 Dot Button */}
      <Pressable onPress={() => setVisible(!visible)}>
        <Feather name="more-vertical" size={22} color="#fff" />
      </Pressable>

      {/* Dropdown */}
      {visible && (
        <View style={styles.dropdown}>
          {items.map((item, index) => (
            <Pressable
              key={index}
              style={styles.item}
              onPress={() => {
                setVisible(false);
                item.onPress();
              }}
            >
              <Text style={styles.text}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    position: "absolute",
    top: Platform.OS === "web" ? 40 : 30,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    width: 150,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 999,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  text: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Inter_500Medium",
  },
});