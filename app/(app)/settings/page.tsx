"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { getMe, updateMe } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsPage() {
  const { data: user, isLoading, mutate } = useSWR("me", getMe);
  const [quietStart, setQuietStart] = useState("23:00");
  const [quietEnd, setQuietEnd] = useState("08:00");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setQuietStart(user.quiet_start ?? "23:00");
      setQuietEnd(user.quiet_end ?? "08:00");
    }
  }, [user]);

  async function handleSave() {
    await updateMe({ quiet_start: quietStart, quiet_end: quietEnd });
    mutate();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (isLoading) return <div className="text-gray-400 text-center mt-12">Загрузка...</div>;

  return (
    <div className="space-y-5 mt-2">
      <h1 className="text-xl font-bold">⚙️ Настройки</h1>

      {/* Профиль */}
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-1">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Профиль</div>
        <div className="font-semibold">{user?.name}</div>
        {user?.username && <div className="text-sm text-gray-400">@{user.username}</div>}
        <div className="text-sm text-gray-400 capitalize">Роль: {user?.role}</div>
      </div>

      {/* Тихий час */}
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">🌙 Тихий час</div>
        <p className="text-sm text-gray-500">
          В это время уведомления не приходят (кроме режима 🔴 Срочно).
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400">Начало</label>
            <input
              type="time"
              value={quietStart}
              onChange={e => setQuietStart(e.target.value)}
              className="w-full mt-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Конец</label>
            <input
              type="time"
              value={quietEnd}
              onChange={e => setQuietEnd(e.target.value)}
              className="w-full mt-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`w-full py-3 rounded-xl font-medium transition-colors ${
            saved
              ? "bg-green-500 text-white"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {saved ? "✅ Сохранено!" : "Сохранить"}
        </button>
      </div>

      {/* Про бота */}
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-2">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Telegram бот</div>
        <p className="text-sm text-gray-500">
          Управляй задачами прямо в Telegram — все данные синхронизированы.
        </p>
        <a
          href={`https://t.me/${process.env.NEXT_PUBLIC_BOT_USERNAME}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-50 text-blue-600 text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-100"
        >
          Открыть бота →
        </a>
      </div>
    </div>
  );
}
