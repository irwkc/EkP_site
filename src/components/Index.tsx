import { SECTIONS, type SectionKey } from "../data/sections";

export default function Index({
  onOpen,
}: {
  onOpen: (key: SectionKey) => void;
}) {
  return (
    <section id="index" className="relative bg-paper px-5 py-24 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="label mb-5 text-signal">Указатель · 6 разделов</p>
            <h2 className="display text-[clamp(2.4rem,8vw,7rem)]">
              Шесть
              <br />
              <span className="serif-italic">направлений</span>
            </h2>
          </div>
          <p className="max-w-xs text-ink-soft md:text-right">
            От первого мазка до фамильного комода. Нажмите, чтобы открыть
            собрание работ.
          </p>
        </div>

        <ul className="border-t border-line">
          {SECTIONS.map((s) => (
            <li key={s.key}>
              <button
                data-cursor
                onClick={() => onOpen(s.key)}
                className="group flex w-full items-center justify-between gap-4 border-b border-line py-6 text-left transition-colors md:py-9"
              >
                <div className="flex items-baseline gap-5 md:gap-10">
                  <span className="label w-8 text-muted transition-colors group-hover:text-signal">
                    {s.index}
                  </span>
                  <span className="display text-[clamp(1.8rem,5.5vw,4.5rem)] transition-all duration-500 ease-art group-hover:translate-x-3 group-hover:text-signal">
                    {s.title}
                  </span>
                </div>
                <div className="flex items-center gap-5">
                  <span className="hidden max-w-[12rem] text-right text-xs text-muted lg:block">
                    {s.kicker}
                  </span>
                  <span className="text-2xl transition-all duration-500 ease-art group-hover:translate-x-2 group-hover:text-signal md:text-3xl">
                    ↗
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
