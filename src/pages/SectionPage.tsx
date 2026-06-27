import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  STUDIO,
  getAdjacentSections,
  getSectionPath,
  isSectionKey,
} from "../data/sections";
import { useSections } from "../hooks/useSections";
import ChapterPaintPour from "../components/ChapterPaintPour";
import ChapterGallery from "../components/ChapterGallery";
import { setScrollIntent } from "../utils/scrollIntent";

const EASE = [0.16, 1, 0.3, 1] as const;
const DEFAULT_TITLE =
  "Сергиевская — Художественная мастерская в Рязани · живопись, реставрация, картины";

function SectionContactNote({ note }: { note: "conditions" | "program" }) {
  return (
    <p className="mt-6 text-sm leading-relaxed text-muted md:mt-8 md:text-base">
      {note === "program" ? (
        <>
          Подробности программы —{" "}
          <a href={STUDIO.phoneHref} className="sweep text-ink-soft">
            по телефону
          </a>{" "}
          или в{" "}
          <a
            href={STUDIO.vk}
            target="_blank"
            rel="noopener noreferrer"
            className="sweep text-ink-soft"
          >
            группе VK
          </a>
          .
        </>
      ) : (
        <>
          Уточнить условия можно{" "}
          <a href={STUDIO.phoneHref} className="sweep text-ink-soft">
            по телефону
          </a>{" "}
          или через{" "}
          <a
            href={STUDIO.vk}
            target="_blank"
            rel="noopener noreferrer"
            className="sweep text-ink-soft"
          >
            группу в VK
          </a>
          .
        </>
      )}
    </p>
  );
}

export default function SectionPage() {
  const { sectionKey } = useParams<{ sectionKey: string }>();
  const [zoom, setZoom] = useState<string | null>(null);

  const sections = useSections();
  const valid = !!sectionKey && isSectionKey(sectionKey);
  const showSection = valid ? sections.find((s) => s.key === sectionKey) : undefined;
  const adjacent = valid ? getAdjacentSections(sectionKey) : { prev: null, next: null };

  useEffect(() => {
    if (!showSection) return;
    document.title = `${showSection.title} — Сергиевская · Художественная мастерская`;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [showSection]);

  useEffect(() => {
    setZoom(null);
  }, [sectionKey]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && zoom) setZoom(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom]);

  if (!showSection) {
    return <Navigate to="/" replace />;
  }

  const section = showSection;

  const { prev, next } = adjacent;

  return (
    <main className="relative bg-paper">
      <ChapterPaintPour chapterKey={section.key} />
      <section className="relative border-b border-line" data-nav-theme="light">
        <div className="relative md:min-h-0">
          <div className="relative z-[1] mx-auto max-w-[1600px] px-4 pb-12 pt-[calc(5.5rem+env(safe-area-inset-top))] md:px-10 md:pb-16 md:pt-32">
            <Link
              to="/"
              state={{ scrollTo: "index" }}
              onClick={() => setScrollIntent("index")}
              className="label inline-flex items-center gap-2 text-muted transition-colors active:text-signal"
            >
              ← Все направления
            </Link>

            <div className="mt-8 md:mt-10">
              <span className="label text-signal">{section.index}</span>
              <h1 className="display mt-3 text-[clamp(2.25rem,9vw,5rem)] leading-[0.92]">
                {section.title}
              </h1>
              <p className="label mt-4 text-ink-soft">{section.kicker}</p>
            </div>

            <div className="mt-8 grid gap-8 md:mt-12 md:grid-cols-[1fr_1.2fr] md:gap-16">
              {section.features?.length ? (
                <div>
                  <ul className="space-y-3 text-[clamp(1.05rem,2.8vw,1.45rem)] leading-snug text-ink">
                    {section.features.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-[0.55em] h-px w-4 shrink-0 bg-signal" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  {section.contactNote && <SectionContactNote note={section.contactNote} />}
                </div>
              ) : (
                <div>
                  <p className="display text-[clamp(1.2rem,4vw,2rem)] leading-tight text-ink">
                    {section.blurb}
                  </p>
                  {section.contactNote && <SectionContactNote note={section.contactNote} />}
                </div>
              )}
              <div>
                <p className="text-sm text-muted md:text-base">{section.meta}</p>
                <a
                  href={STUDIO.phoneHref}
                  className="sweep mt-5 inline-block text-signal md:mt-6"
                >
                  Записаться →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 py-12 md:px-10 md:py-16">
        <p className="label mb-8 text-muted md:mb-10">
          {section.images.length} работ в собрании
        </p>
        <ChapterGallery
          images={section.images}
          title={section.title}
          sectionKey={section.key}
          onPick={setZoom}
        />
      </section>

      <section className="border-t border-line bg-paper-dim">
        <div className="mx-auto max-w-[1600px] divide-y divide-line md:grid md:grid-cols-2 md:divide-x md:divide-y-0">
          {prev && (
            <Link
              to={getSectionPath(prev.key)}
              className="group flex flex-col gap-1 px-4 py-5 active:bg-paper md:gap-2 md:px-10 md:py-12"
            >
              <span className="label text-[0.58rem] text-muted">← Предыдущее</span>
              <span className="display text-lg leading-tight transition-colors group-active:text-signal md:text-3xl md:group-hover:text-signal">
                {prev.title}
              </span>
            </Link>
          )}
          {next && (
            <Link
              to={getSectionPath(next.key)}
              className="group flex flex-col gap-1 px-4 py-5 active:bg-paper md:items-end md:gap-2 md:px-10 md:py-12 md:text-right"
            >
              <span className="label text-[0.58rem] text-muted">Следующее →</span>
              <span className="display text-lg leading-tight transition-colors group-active:text-signal md:text-3xl md:group-hover:text-signal">
                {next.title}
              </span>
            </Link>
          )}
        </div>
      </section>

      <section
        id="section-cta"
        data-nav-theme="dark"
        className="border-t border-line bg-ink px-4 pt-8 text-paper md:px-10 md:pt-16 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] md:pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))]"
      >
        <div className="mx-auto flex max-w-[1600px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between md:items-end">
          <div>
            <p className="label text-[0.58rem] text-signal">Запись</p>
            <h2 className="display mt-2 text-[clamp(1.65rem,6.5vw,3.5rem)] leading-[0.95] md:mt-3">
              Готовы взять кисть?
            </h2>
          </div>
          <a
            href={STUDIO.phoneHref}
            className="label inline-flex shrink-0 items-center justify-center border border-paper/30 px-8 py-3.5 transition-colors active:border-signal active:bg-signal md:px-10 md:py-4"
          >
            Записаться
          </a>
        </div>
      </section>

      <AnimatePresence>
        {zoom && (
          <motion.div
            className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/92 p-4 safe-top safe-bottom md:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setZoom(null)}
          >
            <motion.img
              src={zoom}
              alt=""
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="max-h-[85dvh] max-w-[94vw] border-4 border-paper object-contain shadow-2xl md:max-h-[90vh] md:max-w-[92vw] md:border-[6px]"
            />
            <button
              type="button"
              aria-label="Закрыть просмотр"
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-paper/50 text-paper active:border-signal active:bg-signal md:right-6 md:top-6 md:h-12 md:w-12"
              onClick={() => setZoom(null)}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
