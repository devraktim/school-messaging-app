import { useAuth } from "@/context/AuthContext";
import { Message } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ChatScreenProps {
  title: string;
  subtitle?: string;
  messages: Message[];
  isGroup?: boolean;
  isLoading?: boolean;
  onSend: (text: string) => Promise<void>;
}

// 🔥 Helper: remove s/t prefix (s1 → 1, t5 → 5)
const getNumericId = (id?: string) => {
  if (!id) return "";
  return id.replace(/^[a-zA-Z]/, "");
};

export default function ChatScreen({
  title,
  subtitle,
  messages,
  isGroup,
  isLoading,
  onSend,
}: ChatScreenProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  // ✅ Process messages with correct ownership
  const processedMessages = useMemo(() => {
    const myId = getNumericId(user?.id);


    let messagesData =  messages.map((m) => {
      const senderId = getNumericId(m.sender_id);

      const isOwn = senderId === myId;

      return {
        ...m,
        isOwn,
      };
    });


    return messagesData
  }, [messages, user]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    setInputText("");
    setSending(true);

    try {
      await onSend(text);
    } finally {
      setSending(false);
    }

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    header: {
      backgroundColor: colors.primary,
      paddingTop: Platform.OS === "web" ? insets.top + 67 : insets.top,
      paddingBottom: 14,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
    },

    headerInfo: { flex: 1 },

    headerTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: "#ffffff",
      fontFamily: "Inter_700Bold",
    },

    headerSubtitle: {
      fontSize: 12,
      color: "rgba(255,255,255,0.75)",
      fontFamily: "Inter_400Regular",
      marginTop: 1,
    },

    messagesArea: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },

    msgRow: { marginBottom: 10 },
    msgRowOwn: { alignItems: "flex-end" },
    msgRowOther: { alignItems: "flex-start" },

    senderName: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: "Inter_500Medium",
      marginBottom: 3,
      marginLeft: 4,
    },

    bubble: {
      maxWidth: "75%",
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },

    bubbleOwn: {
      backgroundColor: colors.chatBubbleSent,
      borderBottomRightRadius: 4,
    },

    bubbleOther: {
      backgroundColor: colors.chatBubbleReceived,
      borderBottomLeftRadius: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 2,
    },

    bubbleText: {
      fontSize: 15,
      lineHeight: 21,
      fontFamily: "Inter_400Regular",
    },

    bubbleTextOwn: { color: colors.chatBubbleSentText },
    bubbleTextOther: { color: colors.chatBubbleReceivedText },

    bubbleTime: {
      fontSize: 10,
      marginTop: 4,
      fontFamily: "Inter_400Regular",
    },

    bubbleTimeOwn: {
      color: "rgba(255,255,255,0.65)",
      textAlign: "right",
    },

    bubbleTimeOther: { color: colors.mutedForeground },

    inputRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      padding: 12,
      paddingBottom:
        Platform.OS === "web"
          ? insets.bottom + 12
          : insets.bottom + 8,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 10,
    },

    textInput: {
      flex: 1,
      minHeight: 44,
      maxHeight: 120,
      backgroundColor: colors.background,
      borderRadius: 22,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 15,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
      borderWidth: 1,
      borderColor: colors.border,
    },

    sendBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },

    dateChip: {
      alignSelf: "center",
      backgroundColor: colors.muted,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: 8,
    },

    dateChipText: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: "Inter_500Medium",
    },

    teacherBadge: {
      fontSize: 10,
      color: colors.primary,
      fontFamily: "Inter_600SemiBold",
      backgroundColor: "rgba(21,101,192,0.1)",
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: 4,
      alignSelf: "flex-start",
      marginBottom: 2,
      marginLeft: 4,
    },
  });

  const renderMessage = ({ item }: { item: any }) => (
    <View
      style={[
        styles.msgRow,
        item.isOwn ? styles.msgRowOwn : styles.msgRowOther,
      ]}
    >
      {!item.isOwn && isGroup && (
        <>
          {item.senderRole === "teacher" && (
            <Text style={styles.teacherBadge}>Teacher</Text>
          )}
          <Text style={styles.senderName}>{item.sender}</Text>
        </>
      )}

      <View
        style={[
          styles.bubble,
          item.isOwn ? styles.bubbleOwn : styles.bubbleOther,
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            item.isOwn
              ? styles.bubbleTextOwn
              : styles.bubbleTextOther,
          ]}
        >
          {item.text}
        </Text>

        <Text
          style={[
            styles.bubbleTime,
            item.isOwn
              ? styles.bubbleTimeOwn
              : styles.bubbleTimeOther,
          ]}
        >
          {item.timestamp}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#ffffff" />
        </Pressable>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.headerSubtitle}>{subtitle}</Text>
          )}
        </View>

        <Feather
          name="more-vertical"
          size={20}
          color="rgba(255,255,255,0.8)"
        />
      </View>

      {/* BODY */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <FlatList
          ref={flatListRef}
          data={processedMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesArea}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.dateChip}>
              <Text style={styles.dateChipText}>Today</Text>
            </View>
          }
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={{ marginTop: 48 }}
              />
            ) : (
              <View style={{ alignItems: "center", marginTop: 48 }}>
                <Feather
                  name="message-circle"
                  size={36}
                  color={colors.mutedForeground}
                />
                <Text
                  style={{
                    marginTop: 12,
                    fontSize: 14,
                    color: colors.mutedForeground,
                    fontFamily: "Inter_400Regular",
                  }}
                >
                  No messages yet. Say hello!
                </Text>
              </View>
            )
          }
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
        />

        {/* INPUT */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={colors.mutedForeground}
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={!sending}
          />

          <Pressable
            style={({ pressed }) => [
              styles.sendBtn,
              { opacity: pressed || sending ? 0.7 : 1 },
            ]}
            onPress={handleSend}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Feather name="send" size={18} color="#ffffff" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}