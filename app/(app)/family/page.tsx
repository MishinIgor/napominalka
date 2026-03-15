"use client";
import useSWR from "swr";
import { getFamily } from "@/lib/api";

const ROLE_ICON: Record<string, string> = { admin: "👑", member: "👤", guest: "👁" };

export default function FamilyPage() {
  const { data: members = [], isLoading } = useSWR("family", getFamily);

  if (isLoading) return <div className="text-gray-400 text-center mt-12">Загрузка...</div>;

  return (
    <div className="space-y-4 mt-2">
      <h1 className="text-xl font-bold">👨‍👩‍👧 Семья</h1>

      {members.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          Ты пока один. Добавление участников — через Telegram бота.
        </div>
      ) : (
        <div className="space-y-3">
          {members.map(m => (
            <div key={m.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4">
              <div className="text-3xl">{ROLE_ICON[m.role]}</div>
              <div className="flex-1">
                <div className="font-semibold">{m.name}</div>
                {m.username && <div className="text-xs text-gray-400">@{m.username}</div>}
              </div>
              <div className="text-right text-sm">
                <div className="text-blue-500 font-semibold">{m.active_tasks}</div>
                <div className="text-xs text-gray-400">активных</div>
              </div>
              <div className="text-right text-sm">
                <div className="text-green-500 font-semibold">{m.completed_tasks}</div>
                <div className="text-xs text-gray-400">выполнено</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
