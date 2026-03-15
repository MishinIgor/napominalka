"use client";
import useSWR from "swr";
import Cookies from "js-cookie";
import { getMe } from "@/lib/api";
import { User } from "@/types";

export function useAuth() {
  const token = typeof window !== "undefined" ? Cookies.get("token") : null;

  const { data: user, error, isLoading, mutate } = useSWR<User>(
    token ? "/users/me" : null,
    () => getMe(),
    { revalidateOnFocus: false }
  );

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    mutate,
  };
}
