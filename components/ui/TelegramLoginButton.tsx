"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { telegramLogin, devLogin } from "@/lib/api";

const isDev = process.env.NODE_ENV === "development";

export default function TelegramLoginButton() {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const botName = process.env.NEXT_PUBLIC_BOT_USERNAME ?? "";

  useEffect(() => {
    if (!ref.current) return;

    (window as any).onTelegramAuth = async (user: Record<string, string | number>) => {
      try {
        await telegramLogin(user);
        router.replace("/dashboard");
      } catch (e) {
        alert("Ошибка авторизации. Попробуй снова.");
      }
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "8");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    ref.current.appendChild(script);

    return () => {
      delete (window as any).onTelegramAuth;
    };
  }, [botName, router]);

  async function handleDevLogin() {
    try {
      await devLogin();
      router.replace("/dashboard");
    } catch (e) {
      alert("Ошибка dev-входа");
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={ref} />
      {isDev && (
        <button
          onClick={handleDevLogin}
          className="text-xs text-gray-400 underline hover:text-gray-600"
        >
          [DEV] Войти как тест-пользователь
        </button>
      )}
    </div>
  );
}
