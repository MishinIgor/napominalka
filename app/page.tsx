"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import TelegramLoginButton from "@/components/ui/TelegramLoginButton";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <div className="text-5xl mb-4">🔔</div>
        <h1 className="text-3xl font-bold mb-2">Family Task Bot</h1>
        <p className="text-gray-500 max-w-sm">
          Семейный менеджер задач. Управляй через Telegram или браузер — данные всегда синхронизированы.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center gap-4 w-full max-w-sm">
        <p className="text-gray-600 font-medium">Войти через Telegram</p>
        <TelegramLoginButton />
      </div>
    </main>
  );
}
