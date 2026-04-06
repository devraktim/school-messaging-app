import ChatScreen from "@/components/ChatScreen";
import { useAuth } from "@/context/AuthContext";
import { Message } from "@/data/mockData";
import {
  ApiMessage,
  getClassMessagesApi,
  getIndividualMessagesApi,
  sendClassMessageApi,
  sendIndividualMessageApi,
  stripId,
} from "@/services/api";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

const POLL_INTERVAL_MS = 4000;

// Show only time in 12 hours format
// function formatTimestamp(dateStr: string): string {
//   try {
//     const d = new Date(dateStr);
//     if (isNaN(d.getTime())) return dateStr;
//     const h = d.getHours();
//     const m = d.getMinutes();
//     const ampm = h >= 12 ? "PM" : "AM";
//     return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
//   } catch {
//     return dateStr;
//   }
// }

// Show date and time in 12 hours format
function formatTimestamp(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();

    const h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";

    const time = `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;

    return `${day}-${month}-${year} ${time}`;
  } catch {
    return dateStr;
  }
}

function formatNow(): string {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export default function ChatRoute() {
  const { chatType, id, title, subtitle } = useLocalSearchParams<{
    chatType: string;
    id: string;
    title: string;
    subtitle: string;
  }>();

  const { user, token } = useAuth();
  const isGroup = chatType === "class";

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Numeric ID of the logged-in user for isOwn comparison
  const myNumericId = user?.id ? parseInt(stripId(user.id), 10) : -1;

  // Guard against overlapping poll requests
  const isFetching = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const mapMessage = useCallback(
    (msg: ApiMessage): Message => {
      const isOwn = msg.sender_id == myNumericId;
      let sender: string;
      if (isOwn) {
        sender = user?.name ?? "You";
      } else if (isGroup) {
        sender = msg.sender_role === "teacher" ? "Teacher" : "Student";
      } else {
        sender = title ?? "Unknown";
      }
      return {
        id: String(msg.id),
        sender,
        sender_id: msg.sender_id,
        senderRole: msg.sender_role,
        text: msg.message ?? "",
        timestamp: formatTimestamp(msg.created_at ?? ""),
        isOwn,
      };
    },
    [myNumericId, user?.name, isGroup, title]
  );

  const fetchMessages = useCallback(
    async (initial = false) => {
      if (!token || !id) return;
      if (isFetching.current) return;
      isFetching.current = true;
      try {
        const data = isGroup
          ? await getClassMessagesApi(token, id)
          : await getIndividualMessagesApi(token, id);
        const mapped = (data.messages ?? []).map(mapMessage);
        setMessages(mapped);
      } catch {
      } finally {
        isFetching.current = false;
        if (initial) setIsLoading(false);
      }
    },
    [token, id, isGroup, mapMessage]
  );

  // Initial load + 2-second polling
  useEffect(() => {
    fetchMessages(true);

    intervalRef.current = setInterval(() => {
      fetchMessages(false);
    }, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchMessages]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!token || !id) return;
      const tempId = `tmp-${Date.now()}`;
      const optimistic: Message = {
        id: tempId,
        sender: user?.name ?? "You",
        senderRole: user?.role ?? "student",
        text,
        timestamp: formatNow(),
        isOwn: true,
      };
      setMessages((prev) => [...prev, optimistic]);
      try {
        if (isGroup) {
          await sendClassMessageApi(token, id, text);
        } else {
          await sendIndividualMessageApi(token, id, text);
        }
      } catch (err: any) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        Alert.alert(
          "Send Failed",
          err.message ?? "Could not send message. Please try again."
        );
      }
    },
    [token, id, isGroup, user]
  );

  return (
    <ChatScreen
      title={title ?? "Chat"}
      subtitle={subtitle}
      messages={messages}
      isGroup={isGroup}
      isLoading={isLoading}
      onSend={handleSend}
    />
  );
}
