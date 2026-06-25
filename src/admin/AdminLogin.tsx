import { FormEvent, useState } from "react";
import { motion } from "motion/react";

interface Props {
  onLogin: (login: string, password: string) => Promise<void>;
}

export default function AdminLogin({ onLogin }: Props) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onLogin(login, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grain relative flex min-h-dvh items-center justify-center bg-paper px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(223,59,31,0.08),transparent_55%)]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md border border-line bg-paper p-8 shadow-[0_24px_80px_rgba(20,16,9,0.08)] md:p-10"
      >
        <p className="label text-signal">Админ · Сергиевская</p>
        <h1 className="display mt-3 text-4xl leading-[0.95] md:text-5xl">
          Вход
        </h1>
        <p className="mt-4 text-sm text-ink-soft">
          Управление фото и прайс-листом мастерской
        </p>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block">
            <span className="label mb-2 block text-muted">Логин</span>
            <input
              type="text"
              autoComplete="username"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full border border-line bg-paper-dim px-4 py-3 text-ink outline-none transition-colors focus:border-signal"
              required
            />
          </label>
          <label className="block">
            <span className="label mb-2 block text-muted">Пароль</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-line bg-paper-dim px-4 py-3 text-ink outline-none transition-colors focus:border-signal"
              required
            />
          </label>
          {error && <p className="text-sm text-signal">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="label w-full border border-ink bg-ink py-3.5 text-paper transition-colors hover:border-signal hover:bg-signal disabled:opacity-50"
          >
            {loading ? "Вход…" : "Войти"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
