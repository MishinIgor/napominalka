"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTask, parseTask, getFamily } from "@/lib/api";
import useSWR from "swr";
import { ParsedTask } from "@/types";

const MODE_OPTIONS = [
  { value: "calm", label: "🟢 Спокойно" },
  { value: "planned", label: "🔵 Запланировано" },
  { value: "important", label: "🟡 Важно" },
  { value: "urgent", label: "🔴 Срочно" },
];

export default function NewTaskPage() {
  const router = useRouter();
  const { data: family = [] } = useSWR("family", getFamily);

  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState("planned");
  const [deadline, setDeadline] = useState("");
  const [assigneeId, setAssigneeId] = useState<number | "">("");
  const [checklist, setChecklist] = useState<string[]>([""]);
  const [saving, setSaving] = useState(false);

  async function handleAiParse() {
    if (!aiText.trim()) return;
    setAiLoading(true);
    setAiError("");
    try {
      const parsed: ParsedTask = await parseTask(aiText);
      setTitle(parsed.title);
      setDescription(parsed.description ?? "");
      setMode(parsed.mode);
      if (parsed.deadline) setDeadline(parsed.deadline.slice(0, 16));
      if (parsed.checklist.length > 0) setChecklist(parsed.checklist);
    } catch {
      setAiError("GigaChat недоступен — заполни форму вручную.");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const items = checklist.filter(t => t.trim()).map((text, i) => ({
        item_text: text,
        order: i,
      }));
      const task = await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        mode,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        assignee_id: assigneeId ? Number(assigneeId) : undefined,
        checklist: items,
      });
      router.replace(`/tasks/${task.id}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 mt-2">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-blue-500 text-sm">← Назад</button>
        <h1 className="text-xl font-bold">Новая задача</h1>
      </div>

      {/* AI-ввод */}
      <div className="bg-blue-50 rounded-2xl p-4 space-y-2">
        <div className="text-sm font-semibold text-blue-700">✨ Умный ввод (GigaChat)</div>
        <textarea
          value={aiText}
          onChange={e => setAiText(e.target.value)}
          placeholder='Опиши задачу свободно. Например: "Купить лекарства до пятницы, напомни маме"'
          className="w-full bg-white border border-blue-200 rounded-xl p-3 text-sm resize-none"
          rows={3}
        />
        {aiError && <div className="text-red-500 text-xs">{aiError}</div>}
        <button
          onClick={handleAiParse}
          disabled={aiLoading || !aiText.trim()}
          className="bg-blue-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-blue-600 disabled:opacity-40 transition-colors"
        >
          {aiLoading ? "Разбираю..." : "Разобрать"}
        </button>
      </div>

      {/* Форма */}
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Название *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Что нужно сделать?"
            className="w-full mt-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Описание</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Подробности (необязательно)"
            className="w-full mt-1 border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
            rows={2}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Режим срочности</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {MODE_OPTIONS.map(o => (
              <button
                key={o.value}
                onClick={() => setMode(o.value)}
                className={`py-2 px-3 rounded-xl text-sm border transition-colors ${
                  mode === o.value
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Дедлайн</label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            className="w-full mt-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {family.length > 0 && (
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Исполнитель</label>
            <select
              value={assigneeId}
              onChange={e => setAssigneeId(e.target.value ? Number(e.target.value) : "")}
              className="w-full mt-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">Без исполнителя</option>
              {family.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Подзадачи</label>
          <div className="mt-1 space-y-1">
            {checklist.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={item}
                  onChange={e => {
                    const next = [...checklist];
                    next[i] = e.target.value;
                    setChecklist(next);
                  }}
                  placeholder={`Подзадача ${i + 1}`}
                  className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                {checklist.length > 1 && (
                  <button onClick={() => setChecklist(checklist.filter((_, j) => j !== i))}
                    className="text-red-400 hover:text-red-600 px-2">✕</button>
                )}
              </div>
            ))}
            <button
              onClick={() => setChecklist([...checklist, ""])}
              className="text-blue-500 text-sm hover:underline"
            >
              + Добавить подзадачу
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={!title.trim() || saving}
        className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 disabled:opacity-40 transition-colors"
      >
        {saving ? "Сохраняю..." : "Создать задачу"}
      </button>
    </div>
  );
}
