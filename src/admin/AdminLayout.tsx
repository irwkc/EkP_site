import { NavLink, Outlet } from "react-router-dom";
import { adminPath } from "../utils/adminHost";

const LINKS = [
  { to: adminPath("photos"), label: "Фото" },
  { to: adminPath("prices"), label: "Прайс" },
  { to: adminPath("paintings"), label: "Картины" },
];

interface Props {
  onLogout: () => void;
}

export default function AdminLayout({ onLogout }: Props) {
  return (
    <div className="grain min-h-dvh bg-paper text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-4 md:px-8">
          <div>
            <p className="label text-signal">Админ</p>
            <h1 className="display text-2xl leading-none md:text-3xl">Сергиевская</h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={import.meta.env.DEV ? "/" : "https://se-art.ru"}
              className="label hidden text-muted transition-colors hover:text-signal sm:inline"
            >
              На сайт →
            </a>
            <button
              type="button"
              onClick={onLogout}
              className="label border border-line px-4 py-2 transition-colors hover:border-signal hover:text-signal"
            >
              Выйти
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-4 pb-3 md:px-8">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `label shrink-0 border px-5 py-2 transition-colors ${
                  isActive
                    ? "border-signal bg-signal text-paper"
                    : "border-line text-muted hover:border-ink hover:text-ink"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-[1400px] px-4 py-8 md:px-8 md:py-10">
        <Outlet />
      </main>
    </div>
  );
}
