"use client";
import useSWR from "swr";
import Link from "next/link";
import { getTasks } from "@/lib/api";
import { TaskListItem } from "@/types";

const MODE_EMOJI: Record<string, string> = {
  calm: "🟢", planned: "🔵", important: "🟡", urgent: "🔴",
};
const STATUS_LABEL: Record<string, string> = {
  new: "Новая", accepted: "Принята", in_progress: "В процессе",
  done: "Выполнена", confirmed: "Подтверждена", returned: "Возвращена", rejected: "Отклонена",
};

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-xl p-4 text-white ${color}`}>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm opacity-80">{label}</div>
    </div>
  );
}

function TaskRow({ task }: { task: TaskListItem }) {
  const deadline = task.deadline
    ? new Date(task.deadline).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })
    : "—";
  const overdue = task.deadline && new Date(task.deadline) < new Date() &&
    !["done", "confirmed"].includes(task.status);

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="flex items-center gap-3 py-3 border-b last:border-0 hover:bg-gray-50 rounded-lg px-2 transition-colors"
    >
      <span className="text-lg">{MODE_EMOJI[task.mode]}</span>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{task.title}</div>
        <div className="text-xs text-gray-400">{STATUS_LABEL[task.status]}</div>
      </div>
      <div className={`text-xs font-medium ${overdue ? "text-red-500" : "text-gray-400"}`}>
        {deadline}
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { data: tasks = [], isLoading } = useSWR("tasks", () => getTasks());

  const active = tasks.filter(t => !["done", "confirmed", "rejected"].includes(t.status));
  const today = tasks.filter(t => {
    if (!t.deadline) return false;
    const d = new Date(t.deadline);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });
  const overdue = tasks.filter(t =>
    t.deadline &&
    new Date(t.deadline) < new Date() &&
    !["done", "confirmed", "rejected"].includes(t.status)
  );
  const inbox = tasks.filter(t => t.status === "new");

  if (isLoading) {
    return <div className="text-gray-400 text-center mt-12">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold mt-2">Сводка</h1>

      {/* Статистика */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Активных" value={active.length} color="bg-blue-500" />
        <StatCard label="Входящих" value={inbox.length} color="bg-purple-500" />
        <StatCard label="Сегодня" value={today.length} color="bg-green-500" />
        <StatCard label="Просрочено" value={overdue.length} color="bg-red-500" />
      </div>

      {/* Срочные */}
      {overdue.length > 0 && (
        <section>
          <h2 className="font-semibold text-red-500 mb-2">⚠️ Просрочено</h2>
          <div className="bg-white rounded-xl shadow-sm px-2">
            {overdue.slice(0, 5).map(t => <TaskRow key={t.id} task={t} />)}
          </div>
        </section>
      )}

      {/* Сегодня */}
      {today.length > 0 && (
        <section>
          <h2 className="font-semibold text-gray-700 mb-2">📅 Сегодня</h2>
          <div className="bg-white rounded-xl shadow-sm px-2">
            {today.map(t => <TaskRow key={t.id} task={t} />)}
          </div>
        </section>
      )}

      {/* Все активные */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-700">Активные задачи</h2>
          <Link href="/tasks/new" className="text-blue-500 text-sm font-medium">+ Новая</Link>
        </div>
        {active.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            Нет активных задач.<br />
            <Link href="/tasks/new" className="text-blue-500 mt-2 inline-block">Создать первую</Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm px-2">
            {active.slice(0, 10).map(t => <TaskRow key={t.id} task={t} />)}
          </div>
        )}
      </section>
    </div>
  );
}
