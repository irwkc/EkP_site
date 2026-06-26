import { useCallback, useEffect, useState } from "react";
import { adminApi } from "./api";

export function useAdminAuth() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  const check = useCallback(async () => {
    const { ok } = await adminApi.me();
    setAuthed(ok);
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const login = async (username: string, password: string) => {
    await adminApi.login(username, password);
    const { ok } = await adminApi.me();
    if (!ok) {
      throw new Error("Не удалось сохранить сессию — обновите страницу и попробуйте снова");
    }
    setAuthed(true);
  };

  const logout = async () => {
    await adminApi.logout();
    setAuthed(false);
  };

  return { authed, login, logout, check };
}
