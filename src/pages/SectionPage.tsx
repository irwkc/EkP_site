import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  SECTIONS,
  STUDIO,
  getAdjacentSections,
  getSectionPath,
  isSectionKey,
} from "../data/sections";
import ChapterPaintPour from "../components/ChapterPaintPour";
import { setScrollIntent } from "../utils/scrollIntent";

const EASE = [0.16, 1, 0.3, 1] as const;
const DEFAULT_TITLE =
  "Сергиевская — Художественная мастерская в Рязани · живопись, реставрация, картины";

export default function SectionPage() {
  const { sectionKey } = useParams<{ sectionKey: string }>();
  const [zoom, setZoom] = useState<string | null>(null);

  const valid = !!sectionKey && isSectionKey(sectionKey);
  const section = valid ? SECTIONS.find((s) => s.key === sectionKey)! : null;
  const adjacent = valid ? getAdjacentSections(sectionKey) : { prev: null, next: null };

  useEffect(() => {
    if (!section) return;
    document.title = `${section.title} — Сергиевская · Художественная мастерская`;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [section]);

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

  if (!section) {
    return <Navigate to="/" replace />;
  }

  const { prev, next } = adjacent;

  return (
    <main className="relative bg-paper">
      <section className="relative border-b border-line">
        <div className="relative min-h-[50vh] overflow-hidden md:min-h-0">
          <ChapterPaintPour chapterKey={section.key} />
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
              <p className="display text-[clamp(1.2rem,4vw,2rem)] leading-tight text-ink">
                {section.blurb}
              </p>
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
        <div className="chapter-gallery columns-2 gap-3 md:columns-3 md:gap-4 lg:columns-4">
          {section.images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setZoom(src)}
              className="chapter-gallery-item mb-3 block w-full overflow-hidden border border-line md:mb-4"
            >
              <img
                src={src}
                alt={`${section.title} — работа ${i + 1}`}
                loading={i < 8 ? "eager" : "lazy"}
                decoding="async"
                className="w-full object-cover"
              />
            </button>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-paper-dim">
        <div className="mx-auto grid max-w-[1600px] grid-cols-2 divide-x divide-line">
          {prev ? (
            <Link
              to={getSectionPath(prev.key)}
              className="group flex flex-col gap-2 px-4 py-8 active:bg-paper md:px-10 md:py-12"
            >
              <span className="label text-muted">← Предыдущее</span>
              <span className="display text-xl transition-colors group-active:text-signal md:text-3xl md:group-hover:text-signal">
                {prev.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              to={getSectionPath(next.key)}
              className="group flex flex-col items-end gap-2 px-4 py-8 text-right active:bg-paper md:px-10 md:py-12"
            >
              <span className="label text-muted">Следующее →</span>
              <span className="display text-xl transition-colors group-active:text-signal md:text-3xl md:group-hover:text-signal">
                {next.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </section>

      <section
        id="section-cta"
        className="border-t border-line bg-ink px-4 py-14 text-paper safe-bottom md:px-10 md:py-20"
      >
        <div className="mx-auto flex max-w-[1600px] flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="label text-signal">Запись</p>
            <h2 className="display mt-4 text-[clamp(2rem,8vw,4rem)] leading-tight">
              Готовы взять кисть?
            </h2>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href={STUDIO.phoneHref}
              className="flex items-center justify-center border border-paper/30 px-8 py-4 text-lg active:border-signal active:bg-signal"
            >
              {STUDIO.phone}
            </a>
            <Link
              to="/"
              state={{ scrollTo: "contact" }}
              onClick={() => setScrollIntent("contact")}
              className="label flex items-center justify-center border border-paper/30 px-8 py-4 active:border-signal"
            >
              Контакты
            </Link>
          </div>
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
