import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { loginApi, logoutApi, getProfileApi, getClassesApi } from "@/services/api";

export type UserRole = "teacher" | "student";

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  subject?: string;
  assignedClasses?: string[];
  dob?: string;
  class?: string;
  section?: string;
  rollNumber?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => false,
  logout: async () => {},
  refreshProfile: async () => {},
});

/** Extract DOB from API response regardless of field name */
function extractDob(src: Record<string, any>): string | undefined {
  const raw =
    src.dob ??
    src.date_of_birth ??
    src.dateOfBirth ??
    src.birthdate ??
    src.birth_date ??
    undefined;
  if (!raw) return undefined;
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return String(raw);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return String(raw);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet(["auth_user", "auth_token"]).then(
      ([[, storedUser], [, storedToken]]) => {
        if (storedUser && storedToken) {
          try {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
          } catch {}
        }
        setIsLoading(false);
      }
    );
  }, []);

  const login = useCallback(
    async (username: string, password: string, role: UserRole): Promise<boolean> => {
      try {
        const data = await loginApi(username, password, role);
        const { token: newToken, user: basicUser } = data;

        let fullUser: User = {
          id: String(basicUser.id ?? ""),
          username: basicUser.username ?? username,
          role,
          name: basicUser.name ?? "",
          email: basicUser.email ?? "",
          phone: basicUser.phone ?? "",
          profileImage: basicUser.profileImage,
          subject: basicUser.subject,
          class: basicUser.class,
          section: basicUser.section,
          rollNumber: basicUser.rollNumber,
          dob: extractDob(basicUser as any),
        };

        // Fetch full profile to enrich with all available fields
        try {
          const profile = await getProfileApi(newToken);
          const p = profile as Record<string, any>;
          fullUser = {
            ...fullUser,
            name: p.name ?? fullUser.name,
            email: p.email ?? fullUser.email,
            phone: p.phone ?? fullUser.phone,
            subject: p.subject ?? fullUser.subject,
            class: p.class ?? fullUser.class,
            section: p.section ?? fullUser.section,
            rollNumber: p.rollNumber ?? fullUser.rollNumber,
            dob: extractDob(p) ?? fullUser.dob,
          };
        } catch {}

        // Fetch assigned classes for teachers
        if (role === "teacher") {
          try {
            const classData = await getClassesApi(newToken);
            fullUser.assignedClasses = (classData.classes ?? []).map(
              (c) => `${c.name} ${c.section}`
            );
          } catch {}
        }

        await AsyncStorage.multiSet([
          ["auth_user", JSON.stringify(fullUser)],
          ["auth_token", newToken],
        ]);
        setUser(fullUser);
        setToken(newToken);
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const profile = await getProfileApi(token);
      const p = profile as Record<string, any>;
      setUser((prev) => {
        if (!prev) return prev;
        const updated: User = {
          ...prev,
          name: p.name ?? prev.name,
          email: p.email ?? prev.email,
          phone: p.phone ?? prev.phone,
          subject: p.subject ?? prev.subject,
          class: p.class ?? prev.class,
          section: p.section ?? prev.section,
          rollNumber: p.rollNumber ?? prev.rollNumber,
          dob: extractDob(p) ?? prev.dob,
        };
        AsyncStorage.setItem("auth_user", JSON.stringify(updated));
        return updated;
      });
    } catch {}
  }, [token]);

  const logout = useCallback(async () => {
    if (token) {
      try {
        await logoutApi(token);
      } catch {}
    }
    await AsyncStorage.multiRemove(["auth_user", "auth_token"]);
    setUser(null);
    setToken(null);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
