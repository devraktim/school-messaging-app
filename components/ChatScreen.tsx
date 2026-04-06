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

// 🔥 Helper
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

  // ✅ NEW: local optimistic messages
  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  const flatListRef = useRef<FlatList>(null);

  // ✅ Merge API + local messages
  const allMessages = useMemo(() => {
    return [...messages, ...localMessages];
  }, [messages, localMessages]);

  // ✅ Process messages
  const processedMessages = useMemo(() => {
    const myId = getNumericId(user?.id);

    return allMessages.map((m: any) => {
      const senderId = getNumericId(m.sender_id);

      return {
        ...m,
        isOwn: senderId === myId || m.isOwn === true, // 🔥 FIX
      };
    });
  }, [allMessages, user]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    setInputText("");
    setSending(true);

    // ✅ Create temp message
    const tempMessage: any = {
      id: "temp-" + Date.now(),
      text,
      sender_id: user?.id || "",
      sender: "You",
      timestamp: new Date().toISOString(),
      isOwn: true, // 🔥 ensures right side
    };

    // ✅ Add instantly
    setLocalMessages((prev) => [...prev, tempMessage]);

    try {
      await onSend(text);

      // OPTIONAL: clear temp messages after API sync
      setLocalMessages([]);
    } catch (err) {
      console.log("Send failed", err);
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
  });

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    return d.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

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
            <Text style={{ fontSize: 10, color: colors.primary }}>
              Teacher
            </Text>
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
          {formatTime(item.timestamp)}
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