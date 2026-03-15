"use client";
import useSWR from "swr";
import Link from "next/link";
import { getTasks, changeTaskStatus } from "@/lib/api";

const MODE_EMOJI: Record<string, string> = {
  calm: "🟢", planned: "🔵", important: "🟡", urgent: "🔴",
};

export default function InboxPage() {
  const { data: tasks = [], isLoading, mutate } = useSWR(
    "inbox",
    () => getTasks({ status: "new" })
  );

  async function accept(id: number) {
    await changeTaskStatus(id, "accepted");
    mutate();
  }

  async function reject(id: number) {
    const reason = prompt("Причина отказа:");
    if (reason === null) return;
    await changeTaskStatus(id, "rejected", reason || undefined);
    mutate();
  }

  if (isLoading) return <div className="text-gray-400 text-center mt-12">Загрузка...</div>;

  return (
    <div className="space-y-4 mt-2">
      <h1 className="text-xl font-bold">📥 Входящие</h1>

      {tasks.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          Входящих задач нет.
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => {
            const deadline = task.deadline
              ? new Date(task.deadline).toLocaleDateString("ru-RU", { day: "2-digit", month: "long" })
              : null;
            return (
              <div key={task.id} className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-xl">{MODE_EMOJI[task.mode]}</span>
                  <div className="flex-1">
                    <Link href={`/tasks/${task.id}`} className="font-semibold hover:text-blue-600">
                      {task.title}
                    </Link>
                    {deadline && <div className="text-xs text-gray-400 mt-0.5">до {deadline}</div>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => accept(task.id)}
                    className="flex-1 bg-green-500 text-white py-2 rounded-xl text-sm font-medium hover:bg-green-600"
                  >
                    ✅ Принять
                  </button>
                  <button
                    onClick={() => reject(task.id)}
                    className="flex-1 bg-red-100 text-red-600 py-2 rounded-xl text-sm font-medium hover:bg-red-200"
                  >
                    🚫 Отказаться
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
