"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { getTask, changeTaskStatus, delegateTask, getFamily } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

const MODE_EMOJI: Record<string, string> = {
  calm: "🟢", planned: "🔵", important: "🟡", urgent: "🔴",
};
const STATUS_LABEL: Record<string, string> = {
  new: "🆕 Новая", accepted: "✅ Принята", in_progress: "🔄 В процессе",
  done: "🏁 Выполнена", confirmed: "✔️ Подтверждена",
  returned: "↩️ Возвращена", rejected: "🚫 Отклонена",
};

export default function TaskPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [showComment, setShowComment] = useState<string | null>(null);
  const [delegateTo, setDelegateTo] = useState<number | null>(null);

  const { data: task, isLoading, mutate } = useSWR(`task-${id}`, () => getTask(Number(id)));
  const { data: family = [] } = useSWR("family", getFamily);

  if (isLoading) return <div className="text-gray-400 text-center mt-12">Загрузка...</div>;
  if (!task) return <div className="text-gray-400 text-center mt-12">Задача не найдена</div>;

  const isAssignee = task.assignee_id === user?.id;
  const isCreator = task.creator_id === user?.id;
  const deadline = task.deadline
    ? new Date(task.deadline).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
    : "нет";

  async function doStatus(status: string) {
    await changeTaskStatus(task!.id, status, comment || undefined);
    setComment("");
    setShowComment(null);
    mutate();
  }

  async function doDelegate() {
    if (!delegateTo) return;
    await delegateTask(task!.id, delegateTo);
    setDelegateTo(null);
    mutate();
  }

  return (
    <div className="space-y-4 mt-2">
      <button onClick={() => router.back()} className="text-blue-500 text-sm">← Назад</button>

      {/* Карточка */}
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
        <div className="flex items-start gap-2">
          <span className="text-2xl">{MODE_EMOJI[task.mode]}</span>
          <h1 className="text-xl font-bold leading-tight">{task.title}</h1>
        </div>

        {task.description && <p className="text-gray-600 text-sm">{task.description}</p>}

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
          <span>{STATUS_LABEL[task.status]}</span>
          <span>📅 {deadline}</span>
        </div>

        {/* Чеклист */}
        {task.checklist.length > 0 && (
          <div className="space-y-1 pt-1">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Подзадачи</div>
            {task.checklist
              .sort((a, b) => a.order - b.order)
              .map(item => (
                <div key={item.id} className="flex items-center gap-2 text-sm">
                  <span>{item.is_done ? "☑️" : "☐"}</span>
                  <span className={item.is_done ? "line-through text-gray-400" : ""}>{item.item_text}</span>
                </div>
              ))}
          </div>
        )}

        {/* История */}
        {task.events.length > 0 && (
          <details className="pt-1">
            <summary className="text-xs font-semibold text-gray-400 uppercase tracking-wide cursor-pointer">
              История ({task.events.length})
            </summary>
            <div className="mt-2 space-y-1">
              {task.events.map(e => (
                <div key={e.id} className="text-xs text-gray-400">
                  {new Date(e.created_at).toLocaleString("ru-RU")} — {e.event_type}
                  {e.comment && <span className="italic"> «{e.comment}»</span>}
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Действия */}
      <div className="space-y-2">
        {/* Исполнитель */}
        {isAssignee && task.status === "new" && (
          <div className="flex gap-2">
            <button onClick={() => doStatus("accepted")}
              className="flex-1 bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600">
              ✅ Принять
            </button>
            <button onClick={() => setShowComment("rejected")}
              className="flex-1 bg-red-100 text-red-600 py-3 rounded-xl font-medium hover:bg-red-200">
              🚫 Отказаться
            </button>
          </div>
        )}

        {isAssignee && task.status === "accepted" && (
          <button onClick={() => doStatus("in_progress")}
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600">
            🔄 В процессе
          </button>
        )}

        {isAssignee && ["accepted", "in_progress"].includes(task.status) && (
          <button onClick={() => doStatus("done")}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700">
            🏁 Выполнено
          </button>
        )}

        {/* Создатель */}
        {isCreator && task.status === "done" && (
          <div className="flex gap-2">
            <button onClick={() => doStatus("confirmed")}
              className="flex-1 bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600">
              ✔️ Подтвердить
            </button>
            <button onClick={() => setShowComment("returned")}
              className="flex-1 bg-orange-100 text-orange-600 py-3 rounded-xl font-medium hover:bg-orange-200">
              ↩️ Вернуть
            </button>
          </div>
        )}

        {(isCreator || isAssignee) && (
          <button onClick={() => setDelegateTo(-1)}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200">
            👤 Делегировать
          </button>
        )}

        {/* Комментарий к отказу/возврату */}
        {showComment && (
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
            <div className="text-sm font-medium">
              {showComment === "rejected" ? "Причина отказа:" : "Что нужно доделать:"}
            </div>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm resize-none"
              rows={3}
              placeholder="Введи комментарий..."
            />
            <div className="flex gap-2">
              <button onClick={() => doStatus(showComment)}
                className="flex-1 bg-gray-800 text-white py-2 rounded-lg text-sm font-medium">
                Отправить
              </button>
              <button onClick={() => setShowComment(null)}
                className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm">
                Отмена
              </button>
            </div>
          </div>
        )}

        {/* Выбор делегата */}
        {delegateTo !== null && (
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
            <div className="text-sm font-medium">Кому передать задачу?</div>
            <div className="space-y-1">
              {family.filter(m => m.id !== user?.id).map(m => (
                <button key={m.id} onClick={() => setDelegateTo(m.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    delegateTo === m.id ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50"
                  }`}>
                  {m.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={doDelegate} disabled={!delegateTo || delegateTo === -1}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-40">
                Передать
              </button>
              <button onClick={() => setDelegateTo(null)}
                className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm">
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
