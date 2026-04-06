import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function RootIndex() {
  const { user, isLoading } = useAuth();
  const colors = useColors();
  const [checking, setChecking] = useState(true);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("onboarding_complete").then((val) => {
      setOnboarded(!!val);
      setChecking(false);
    });
  }, []);

  if (isLoading || checking) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary }}>
        <ActivityIndicator color="#ffffff" size="large" />
      </View>
    );
  }

  if (!onboarded) return <Redirect href="/onboarding" />;
  if (!user) return <Redirect href="/login" />;
  return <Redirect href="/(tabs)" />;
}
