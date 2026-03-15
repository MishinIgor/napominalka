"use client";
import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { getTasks } from "@/lib/api";
import { TaskListItem, TaskMode, TaskStatus } from "@/types";

const MODE_EMOJI: Record<string, string> = {
  calm: "🟢", planned: "🔵", important: "🟡", urgent: "🔴",
};
const STATUS_LABEL: Record<string, string> = {
  new: "Новая", accepted: "Принята", in_progress: "В процессе",
  done: "Выполнена", confirmed: "Подтверждена", returned: "Возвращена", rejected: "Отклонена",
};
const MODES: { value: string; label: string }[] = [
  { value: "", label: "Все" },
  { value: "urgent", label: "🔴 Срочно" },
  { value: "important", label: "🟡 Важно" },
  { value: "planned", label: "🔵 Запланировано" },
  { value: "calm", label: "🟢 Спокойно" },
];
const STATUSES: { value: string; label: string }[] = [
  { value: "", label: "Все" },
  { value: "new", label: "Новые" },
  { value: "accepted", label: "Принятые" },
  { value: "in_progress", label: "В процессе" },
  { value: "done", label: "Выполненные" },
];

function TaskCard({ task }: { task: TaskListItem }) {
  const deadline = task.deadline
    ? new Date(task.deadline).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })
    : null;
  const overdue = task.deadline && new Date(task.deadline) < new Date() &&
    !["done", "confirmed"].includes(task.status);

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5">{MODE_EMOJI[task.mode]}</span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{task.title}</div>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
            <span>{STATUS_LABEL[task.status]}</span>
            {task.checklist_total > 0 && (
              <span>· {task.checklist_done}/{task.checklist_total} подзадач</span>
            )}
          </div>
        </div>
        {deadline && (
          <span className={`text-xs font-medium shrink-0 ${overdue ? "text-red-500" : "text-gray-400"}`}>
            {overdue && "⚠️ "}{deadline}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function TasksPage() {
  const [mode, setMode] = useState("");
  const [status, setStatus] = useState("");

  const { data: tasks = [], isLoading, mutate } = useSWR(
    ["tasks", mode, status],
    () => getTasks({ mode: mode || undefined, status: status || undefined })
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mt-2">
        <h1 className="text-xl font-bold">Задачи</h1>
        <Link
          href="/tasks/new"
          className="bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors"
        >
          + Новая
        </Link>
      </div>

      {/* Фильтры */}
      <div className="space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {MODES.map(m => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`shrink-0 text-sm px-3 py-1 rounded-full border transition-colors ${
                mode === m.value
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={`shrink-0 text-sm px-3 py-1 rounded-full border transition-colors ${
                status === s.value
                  ? "bg-gray-700 text-white border-gray-700"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <div className="text-gray-400 text-center py-8">Загрузка...</div>}

      {!isLoading && tasks.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          Задач не найдено.<br />
          <Link href="/tasks/new" className="text-blue-500 mt-2 inline-block">Создать задачу</Link>
        </div>
      )}

      <div className="space-y-3">
        {tasks.map(task => <TaskCard key={task.id} task={task} />)}
      </div>
    </div>
  );
}
