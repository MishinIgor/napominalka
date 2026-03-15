"use client";
import { useEffect } from "react";
import { useSWRConfig } from "swr";
import { connectWs, disconnectWs, onWsMessage } from "@/lib/ws";

export function useRealtimeSync(groupId: number | null) {
  const { mutate } = useSWRConfig();

  useEffect(() => {
    if (!groupId) return;

    connectWs(groupId);

    const off = onWsMessage((data) => {
      // При любом событии инвалидируем нужные кэши SWR
      if (data.event === "task_created" || data.event === "task_updated") {
        mutate("tasks");           // список задач
        mutate("inbox");           // входящие
        mutate(`task-${data.task_id}`); // конкретная задача
      }
    });

    return () => {
      off();
      disconnectWs();
    };
  }, [groupId, mutate]);
}
