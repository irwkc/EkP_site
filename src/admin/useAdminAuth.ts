import { useCallback, useEffect, useState } from "react";
import { adminApi } from "./api";

export function useAdminAuth() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  const check = useCallback(async () => {
    try {
      await adminApi.me();
      setAuthed(true);
    } catch {
      setAuthed(false);
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const login = async (username: string, password: string) => {
    await adminApi.login(username, password);
    setAuthed(true);
  };

  const logout = async () => {
    await adminApi.logout();
    setAuthed(false);
  };

  return { authed, login, logout, check };
}
