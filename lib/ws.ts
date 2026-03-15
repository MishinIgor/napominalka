import Cookies from "js-cookie";

const API_WS = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000")
  .replace(/^http/, "ws");

type WsHandler = (data: Record<string, unknown>) => void;

let socket: WebSocket | null = null;
const handlers: WsHandler[] = [];

export function connectWs(groupId: number) {
  const token = Cookies.get("token");
  if (!token || socket?.readyState === WebSocket.OPEN) return;

  socket = new WebSocket(`${API_WS}/ws?token=${token}&group_id=${groupId}`);

  socket.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      handlers.forEach((h) => h(data));
    } catch {}
  };

  socket.onclose = () => {
    // Реконнект через 3 секунды
    setTimeout(() => connectWs(groupId), 3000);
  };
}

export function disconnectWs() {
  socket?.close();
  socket = null;
}

export function onWsMessage(handler: WsHandler) {
  handlers.push(handler);
  return () => {
    const i = handlers.indexOf(handler);
    if (i !== -1) handlers.splice(i, 1);
  };
}
