const BASE_URL = "https://ignitedsoft.in/anthony/api/v1";

export function stripId(id: string | number): string {
  return String(id).replace(/^[a-zA-Z]+/, "");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error?.message ?? "Request failed");
  }
  return json.data as T;
}

export interface ApiUser {
  id: string;
  username: string;
  role: "teacher" | "student";
  name: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  subject?: string;
  class?: string;
  section?: string;
  rollNumber?: string;
}

export interface ApiClass {
  id: number;
  name: string;
  section: string;
  studentCount: number;
  subject: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface ApiStudent {
  id: string;
  name: string;
  class: string;
  section: string;
  class_name: string;
  section_name: string;
  rollNumber: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface ApiTeacher {
  id: string;
  name: string;
  subject: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface ApiMessage {
  id: number;
  sender_id: string;
  sender_role: "teacher" | "student";
  receiver_id?: number;
  message: string;
  created_at: string;
}

export const loginApi = (username: string, password: string, role: string) =>
  request<{ token: string; user: ApiUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password, role }),
  });

export const logoutApi = (token: string) =>
  request<{ message: string }>("/auth/logout", { method: "POST" }, token);

export const getProfileApi = (token: string) =>
  request<ApiUser>("/profile", {}, token);

export const getClassesApi = (token: string) =>
  request<{ classes: ApiClass[] }>("/classes", {}, token);

export const getStudentsApi = (token: string, search?: string) =>
  request<{ students: ApiStudent[] }>(
    `/students${search ? `?search=${encodeURIComponent(search)}` : ""}`,
    {},
    token
  );

export const getTeachersApi = (token: string, search?: string) =>
  request<{ teachers: ApiTeacher[] }>(
    `/teachers${search ? `?search=${encodeURIComponent(search)}` : ""}`,
    {},
    token
  );

export const getClassMessagesApi = (token: string, classId: string | number) =>
  request<{ messages: ApiMessage[] }>(
    `/chats/class/${stripId(classId)}/messages`,
    {},
    token
  );

export const sendClassMessageApi = (
  token: string,
  classId: string | number,
  text: string
) =>
  request<{ message_id: number }>(
    `/chats/class/${stripId(classId)}/messages`,
    { method: "POST", body: JSON.stringify({ text }) },
    token
  );

export const getIndividualMessagesApi = (token: string, userId: string | number) =>
  request<{ messages: ApiMessage[] }>(
    `/chats/individual/${stripId(userId)}/messages`,
    {},
    token
  );

export const sendIndividualMessageApi = (
  token: string,
  userId: string | number,
  text: string
) =>
  request<{ message_id: number }>(
    `/chats/individual/${stripId(userId)}/messages`,
    { method: "POST", body: JSON.stringify({ text }) },
    token
  );
