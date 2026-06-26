import { Link } from "react-router-dom";
import { getSectionPath } from "../data/sections";
import { useSections } from "../hooks/useSections";
import { resetScrollPosition } from "../utils/scrollTo";

export default function Index() {
  const sections = useSections();
  return (
    <section id="index" className="relative bg-paper px-4 py-14 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between md:gap-6">
          <div>
            <p className="label mb-4 text-signal md:mb-5">Указатель · 6 разделов</p>
            <h2 className="display text-[clamp(2.75rem,11vw,7rem)] leading-[0.92]">
              Шесть
              <br />
              <span className="serif-italic">направлений</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-ink-soft md:max-w-xs md:text-right md:text-base">
            От первого мазка до фамильного комода. Выберите направление —
            откроется отдельная страница с работами.
          </p>
        </div>

        <ul className="border-t border-line">
          {sections.map((s) => (
            <li key={s.key}>
              <Link
                to={getSectionPath(s.key)}
                onClick={resetScrollPosition}
                className="group flex w-full items-start justify-between gap-4 border-b border-line py-5 transition-colors active:bg-paper-dim md:items-center md:py-9"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-3 md:gap-10">
                    <span className="label w-7 shrink-0 text-muted md:w-8">
                      {s.index}
                    </span>
                    <span className="display text-[clamp(1.65rem,7.5vw,4.5rem)] leading-[0.95] transition-colors group-active:text-signal md:transition-all md:duration-500 md:ease-art md:group-hover:translate-x-3 md:group-hover:text-signal">
                      {s.title}
                    </span>
                  </div>
                  <p className="label mt-2 pl-10 text-muted md:hidden">{s.kicker}</p>
                </div>
                <span className="mt-2 shrink-0 text-xl text-signal md:mt-0 md:text-3xl">
                  ↗
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
