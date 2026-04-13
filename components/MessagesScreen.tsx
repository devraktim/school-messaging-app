import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import {
  ApiClass,
  ApiStudent,
  ApiTeacher,
  getClassesApi,
  getStudentsApi,
  getTeachersApi,
} from "@/services/api";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SettingsButton from "./SettingsButton";

type Tab = "classes" | "contacts";

// ─── Module-level cache (persists across navigation) ───────────────────────
const _cache: {
  classes?: ApiClass[];
  students?: ApiStudent[];
  teachers?: ApiTeacher[];
  token?: string;
} = {};

const REFRESH_INTERVAL_MS = 30_000;

// ─── Avatar ────────────────────────────────────────────────────────────────
function Avatar({
  name,
  size = 44,
  bgColor,
}: {
  name: string;
  size?: number;
  bgColor?: string;
}) {
  const colors = useColors();
  const initial = name?.charAt(0)?.toUpperCase() || "Anonymous";
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bgColor ?? colors.primary,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: size * 0.4,
          color: "#ffffff",
          fontFamily: "Inter_700Bold",
        }}
      >
        {initial}
      </Text>
    </View>
  );
}

// ─── ClassCard ─────────────────────────────────────────────────────────────
const ClassCard = React.memo(function ClassCard({
  item,
  onPress,
}: {
  item: ApiClass;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: colors.card,
        borderRadius: 14,
        marginHorizontal: 16,
        marginBottom: 10,
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        opacity: pressed ? 0.85 : 1,
      })}
      onPress={onPress}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Feather name="users" size={22} color="#ffffff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: colors.foreground,
            fontFamily: "Inter_600SemiBold",
          }}
        >
          {item.name} {item.section}
        </Text>
        {item.lastMessage ? (
          <Text
            style={{
              fontSize: 12,
              color: colors.mutedForeground,
              fontFamily: "Inter_400Regular",
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
        ) : null}
      </View>
      <View style={{ alignItems: "flex-end", gap: 4 }}>
        {item.lastMessageTime ? (
          <Text
            style={{
              fontSize: 11,
              color: colors.mutedForeground,
              fontFamily: "Inter_400Regular",
            }}
          >
            {item.lastMessageTime}
          </Text>
        ) : null}
        {item.studentCount > 0 ? (
          <View
            style={{
              backgroundColor: "rgba(21,101,192,0.1)",
              borderRadius: 8,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                color: colors.primary,
                fontFamily: "Inter_500Medium",
              }}
            >
              {item.studentCount} students
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
});

// ─── PersonCard ────────────────────────────────────────────────────────────
const PersonCard = React.memo(function PersonCard({
  name,
  sub,
  lastMsg,
  time,
  onPress,
  isTeacherCard,
}: {
  name: string;
  sub: string;
  lastMsg?: string;
  time?: string;
  onPress: () => void;
  isTeacherCard?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.card,
        borderRadius: 14,
        marginHorizontal: 16,
        marginBottom: 10,
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        opacity: pressed ? 0.85 : 1,
      })}
      onPress={onPress}
    >
      <Avatar name={name} bgColor={isTeacherCard ? colors.primary : "#4CAF50"} />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: colors.foreground,
            fontFamily: "Inter_600SemiBold",
          }}
        >
          {name}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: isTeacherCard ? colors.primary : colors.mutedForeground,
            fontFamily: "Inter_400Regular",
            marginTop: 1,
          }}
        >
          {sub}
        </Text>
        {lastMsg ? (
          <Text
            style={{
              fontSize: 12,
              color: colors.mutedForeground,
              fontFamily: "Inter_400Regular",
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {lastMsg}
          </Text>
        ) : null}
      </View>
      {time ? (
        <Text
          style={{
            fontSize: 11,
            color: colors.mutedForeground,
            fontFamily: "Inter_400Regular",
          }}
        >
          {time}
        </Text>
      ) : null}
    </Pressable>
  );
});

// ─── Main Screen ───────────────────────────────────────────────────────────
export default function MessagesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, token } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("classes");
  const [search, setSearch] = useState("");
  const [studentDisplayLimit, setStudentDisplayLimit] = useState(15);

  const [classes, setClasses] = useState<ApiClass[]>(_cache.classes ?? []);
  const [students, setStudents] = useState<ApiStudent[]>(_cache.students ?? []);
  const [teachers, setTeachers] = useState<ApiTeacher[]>(_cache.teachers ?? []);
  const [loading, setLoading] = useState(!_cache.token || _cache.token !== token);
  const [refreshing, setRefreshing] = useState(false);

  const isTeacher = user?.role === "teacher";
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch data ──────────────────────────────────────────────────────────
  const fetchData = useCallback(
    async (showLoading = false) => {
      if (!token) return;
      if (showLoading) setLoading(true);

      const fresh = token !== _cache.token;

      try {
        if (fresh || !_cache.classes) {
          const d = await getClassesApi(token);
          _cache.classes = d.classes ?? [];
          setClasses(_cache.classes);
        } else {
          setClasses(_cache.classes);
        }

        if (isTeacher) {
          if (fresh || !_cache.students) {
            const d = await getStudentsApi(token);
            _cache.students = d.students ?? [];
            setStudents(_cache.students);
          } else {
            setStudents(_cache.students);
          }
        } else {
          if (fresh || !_cache.teachers) {
            const d = await getTeachersApi(token);
            _cache.teachers = d.teachers ?? [];
            setTeachers(_cache.teachers);
          } else {
            setTeachers(_cache.teachers);
          }
        }

        _cache.token = token;
      } catch {}

      setLoading(false);
      setRefreshing(false);
    },
    [token, isTeacher]
  );

  // ── Pull to refresh ─────────────────────────────────────────────────────
  const onRefresh = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    // Force fresh fetch
    _cache.token = undefined;
    await fetchData(false);
  }, [fetchData, token]);

  // ── Reset student display limit on search/tab change ───────────────────
  useEffect(() => {
    setStudentDisplayLimit(15);
  }, [search, activeTab]);

  // ── Scroll handler: load more students progressively ───────────────────
  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (activeTab !== "contacts" || !isTeacher) return;
      const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
      const nearBottom =
        layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;
      if (nearBottom) {
        setStudentDisplayLimit((prev) =>
          prev < filteredStudents.length ? prev + 15 : prev
        );
      }
    },
    [activeTab, isTeacher, filteredStudents]
  );

  // ── Mount + 30-second auto-refresh ─────────────────────────────────────
  useEffect(() => {
    fetchData(true);

    timerRef.current = setInterval(() => {
      _cache.token = undefined;
      fetchData(false);
    }, REFRESH_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchData]);

  // ── Navigation helpers ──────────────────────────────────────────────────
  const openClass = useCallback(
    (cls: ApiClass) => {
      router.push({
        pathname: "/chat",
        params: {
          chatType: "class",
          id: String(cls.id),
          title: `${cls.name} ${cls.section}`,
          subtitle: cls.studentCount > 0 ? `${cls.studentCount} students` : "",
        },
      });
    },
    [router]
  );

  const openStudent = useCallback(
    (s: ApiStudent) => {
      router.push({
        pathname: "/chat",
        params: {
          chatType: "individual",
          id: s.id,
          title: s.name,
          subtitle: `${s.class_name} ${s.section_name} · Student No. ${s.rollNumber}`,
        },
      });
    },
    [router]
  );

  const openTeacher = useCallback(
    (t: ApiTeacher) => {
      router.push({
        pathname: "/chat",
        params: {
          chatType: "individual",
          id: t.id,
          title: t.name,
          subtitle: t.subject,
        },
      });
    },
    [router]
  );

  // ── Filtered lists (memoized) ───────────────────────────────────────────
  const q = search.toLowerCase();
  const filteredClasses = useMemo(
    () => classes.filter((c) => `${c.name} ${c.section}`.toLowerCase().includes(q)),
    [classes, q]
  );
  const filteredStudents = useMemo(
    () =>
      students.filter(
        (s) =>
          (s.name || "").toLowerCase().includes(q) ||
          String(s.rollNumber).toLowerCase().includes(q)
      ),
    [students, q]
  );
  const filteredTeachers = useMemo(
    () =>
      teachers.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.subject || "").toLowerCase().includes(q)
      ),
    [teachers, q]
  );

  const TAB_BAR = Platform.OS === "web" ? 84 : 60;
  const bottomPad = TAB_BAR + insets.bottom + 20;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.primary,
      paddingTop: Platform.OS === "web" ? insets.top + 67 : insets.top,
      paddingBottom: 16,
      paddingHorizontal: 20,
    },
    headerFirstRow: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: Platform.OS === "web" ? 0 : 14,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: "#ffffff",
      fontFamily: "Inter_700Bold",
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.15)",
      borderRadius: 12,
      marginTop: 14,
      paddingHorizontal: 12,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      height: 42,
      fontSize: 14,
      color: "#ffffff",
      fontFamily: "Inter_400Regular",
    },
    tabRow: {
      flexDirection: "row",
      margin: 16,
      backgroundColor: colors.muted,
      borderRadius: 12,
      padding: 4,
    },
    tab: {
      flex: 1,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
    },
    tabActive: {
      backgroundColor: colors.card,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    tabText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
    tabTextActive: { color: colors.primary },
    tabTextInactive: { color: colors.mutedForeground },
    sectionTitle: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.mutedForeground,
      fontFamily: "Inter_700Bold",
      marginHorizontal: 20,
      marginBottom: 10,
      marginTop: 4,
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 60,
    },
    emptyText: {
      fontSize: 15,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 12,
    },
  });

  const tabLabel = isTeacher
    ? { classes: "Classes", contacts: "Students" }
    : { classes: "My Class", contacts: "Teachers" };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (activeTab === "classes") {
      return filteredClasses.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>
            {isTeacher ? "Group Chats" : "My Class"}
          </Text>
          {filteredClasses.map((cls) => (
            <ClassCard
              key={`${cls.id}_${cls.section}`}
              item={cls}
              onPress={() => openClass(cls)}
            />
          ))}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Feather name="search" size={32} color={colors.mutedForeground} />
          <Text style={styles.emptyText}>No classes found</Text>
        </View>
      );
    }

    if (isTeacher) {
      const visibleStudents = filteredStudents.slice(0, studentDisplayLimit);
      const hasMore = studentDisplayLimit < filteredStudents.length;
      return visibleStudents.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Students</Text>
          {visibleStudents.map((s) => (
            <PersonCard
              key={s.id}
              name={s.name}
              sub={`${s.class_name} ${s.section_name} · Student No. ${s.rollNumber}`}
              lastMsg={s.lastMessage}
              time={s.lastMessageTime}
              onPress={() => openStudent(s)}
            />
          ))}
          {hasMore && (
            <View style={{ alignItems: "center", paddingVertical: 16 }}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 6 }}>
                Scroll for more students…
              </Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Feather name="search" size={32} color={colors.mutedForeground} />
          <Text style={styles.emptyText}>No students found</Text>
        </View>
      );
    }

    return (
      <>
        <Text style={styles.sectionTitle}>Teachers</Text>
        {filteredTeachers.length > 0 ? (
          filteredTeachers.map((t) => (
            <PersonCard
              key={t.id}
              name={t.name}
              sub={t.subject}
              lastMsg={t.lastMessage}
              time={t.lastMessageTime}
              isTeacherCard
              onPress={() => openTeacher(t)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Feather name="search" size={32} color={colors.mutedForeground} />
            <Text style={styles.emptyText}>No teachers found</Text>
          </View>
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerFirstRow}>
          <Text style={styles.headerTitle}>Messages</Text>
          <SettingsButton />
        </View>
        <View style={styles.searchContainer}>
          <Feather name="search" size={16} color="rgba(255,255,255,0.7)" />
          <TextInput
            style={styles.searchInput}
            placeholder={
              activeTab === "classes"
                ? "Search classes..."
                : isTeacher
                ? "Search students..."
                : "Search teachers..."
            }
            placeholderTextColor="rgba(255,255,255,0.55)"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={16} color="rgba(255,255,255,0.7)" />
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.tabRow}>
        {(["classes", "contacts"] as Tab[]).map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab ? styles.tabActive : null]}
            onPress={() => {
              setActiveTab(tab);
              setSearch("");
            }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab ? styles.tabTextActive : styles.tabTextInactive,
              ]}
            >
              {tabLabel[tab]}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {renderContent()}
        <View style={{ height: bottomPad }} />
      </ScrollView>
    </View>
  );
}
