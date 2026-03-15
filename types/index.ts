export type TaskMode = "calm" | "planned" | "important" | "urgent";
export type TaskStatus =
  | "new" | "accepted" | "in_progress" | "done"
  | "confirmed" | "returned" | "rejected";

export interface ChecklistItem {
  id: number;
  item_text: string;
  is_done: boolean;
  order: number;
}

export interface TaskEvent {
  id: number;
  actor_id: number;
  event_type: string;
  comment: string | null;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  creator_id: number;
  assignee_id: number | null;
  group_id: number | null;
  mode: TaskMode;
  deadline: string | null;
  repeat_rule: string | null;
  status: TaskStatus;
  visibility: string;
  created_at: string;
  updated_at: string;
  checklist: ChecklistItem[];
  attachments: { id: number; file_id: string; file_type: string }[];
  events: TaskEvent[];
}

export interface TaskListItem {
  id: number;
  title: string;
  assignee_id: number | null;
  mode: TaskMode;
  deadline: string | null;
  status: TaskStatus;
  created_at: string;
  checklist_total: number;
  checklist_done: number;
}

export interface User {
  id: number;
  telegram_id: number;
  name: string;
  username: string | null;
  role: "admin" | "member" | "guest";
  quiet_start: string | null;
  quiet_end: string | null;
}

export interface FamilyMember extends User {
  active_tasks: number;
  completed_tasks: number;
}

export interface ParsedTask {
  title: string;
  description: string | null;
  mode: TaskMode;
  deadline: string | null;
  assignee_hint: string | null;
  checklist: string[];
}
