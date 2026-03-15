import Cookies from "js-cookie";
import { ParsedTask, Task, TaskListItem, FamilyMember, User } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function getToken(): string | undefined {
  return Cookies.get("token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Ошибка запроса");
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ────────────────────────────────────────────────────────────────────

export async function telegramLogin(payload: Record<string, string | number>) {
  const data = await request<{ access_token: string }>("/auth/telegram", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  Cookies.set("token", data.access_token, { expires: 30 });
  return data;
}

export function logout() {
  Cookies.remove("token");
}

export async function devLogin() {
  const data = await request<{ access_token: string }>("/auth/dev-login", {
    method: "POST",
  });
  Cookies.set("token", data.access_token, { expires: 30 });
  return data;
}

// ── Tasks ───────────────────────────────────────────────────────────────────

export async function getTasks(params?: {
  status?: string;
  mode?: string;
  assignee_id?: number;
}): Promise<TaskListItem[]> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.mode) qs.set("mode", params.mode);
  if (params?.assignee_id) qs.set("assignee_id", String(params.assignee_id));
  return request(`/tasks?${qs}`);
}

export async function getTask(id: number): Promise<Task> {
  return request(`/tasks/${id}`);
}

export async function createTask(data: {
  title: string;
  description?: string;
  assignee_id?: number;
  group_id?: number;
  mode: string;
  deadline?: string;
  visibility?: string;
  checklist?: { item_text: string; order: number }[];
}): Promise<Task> {
  return request("/tasks", { method: "POST", body: JSON.stringify(data) });
}

export async function updateTask(id: number, data: Partial<Task>): Promise<Task> {
  return request(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function changeTaskStatus(
  id: number,
  status: string,
  comment?: string
): Promise<Task> {
  return request(`/tasks/${id}/status`, {
    method: "POST",
    body: JSON.stringify({ status, comment }),
  });
}

export async function delegateTask(
  id: number,
  new_assignee_id: number,
  comment?: string
): Promise<Task> {
  return request(`/tasks/${id}/delegate`, {
    method: "POST",
    body: JSON.stringify({ new_assignee_id, comment }),
  });
}

export async function parseTask(text: string): Promise<ParsedTask> {
  return request("/tasks/parse", { method: "POST", body: JSON.stringify({ text }) });
}

// ── Users ───────────────────────────────────────────────────────────────────

export async function getMe(): Promise<User> {
  return request("/users/me");
}

export async function updateMe(data: {
  quiet_start?: string;
  quiet_end?: string;
}): Promise<User> {
  return request("/users/me", { method: "PATCH", body: JSON.stringify(data) });
}

export async function getFamily(): Promise<FamilyMember[]> {
  return request("/users/family");
}
