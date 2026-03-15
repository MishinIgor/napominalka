"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { logout } from "@/lib/api";

const NAV = [
  { href: "/dashboard", label: "Сводка", icon: "🏠" },
  { href: "/tasks", label: "Задачи", icon: "📋" },
  { href: "/inbox", label: "Входящие", icon: "📥" },
  { href: "/family", label: "Семья", icon: "👨‍👩‍👧" },
  { href: "/settings", label: "Настройки", icon: "⚙️" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  useRealtimeSync(user?.id ?? null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Загрузка...
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <span className="font-bold text-lg">🔔 Family Tasks</span>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>{user?.name}</span>
          <button
            onClick={() => { logout(); router.replace("/"); }}
            className="text-red-400 hover:text-red-600"
          >
            Выйти
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4">{children}</main>

      {/* Bottom nav */}
      <nav className="bg-white border-t fixed bottom-0 left-0 right-0 flex justify-around py-2 z-10">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center text-xs gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                active ? "text-blue-600 font-semibold" : "text-gray-400 hover:text-gray-700"
              }`}
            >
              <span className="text-xl">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom nav spacer */}
      <div className="h-16" />
    </div>
  );
}
