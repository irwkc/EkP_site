import { useCallback, useRef, useState, type RefObject } from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from "motion/react";
import { getSectionPath, type Section } from "../data/sections";
import { useSections } from "../hooks/useSections";
import { resetScrollPosition } from "../utils/scrollTo";

const EASE = [0.16, 1, 0.3, 1] as const;
const STACK_DEPTH = 3;
const SWIPE_THRESHOLD = 72;

function sectionPreview(section: Section) {
  return section.images[0] ?? null;
}

type ExitVector = { x: number; y: number; rotate: number };

function deckExitVector(info: PanInfo): ExitVector {
  const { offset } = info;
  if (Math.abs(offset.x) >= Math.abs(offset.y)) {
    return {
      x: offset.x >= 0 ? 420 : -420,
      y: offset.y * 0.35,
      rotate: offset.x >= 0 ? 14 : -14,
    };
  }
  return { x: offset.x * 0.35, y: -520, rotate: offset.x >= 0 ? 6 : -6 };
}

function DeckCard({
  section,
  depth,
  isTop,
  total,
  exitVectorRef,
  onDismiss,
}: {
  section: Section;
  depth: number;
  isTop: boolean;
  total: number;
  exitVectorRef: RefObject<ExitVector>;
  onDismiss: (info: PanInfo) => void;
}) {
  const reduceMotion = useReducedMotion();
  const src = sectionPreview(section);
  const indexNum = Number.parseInt(section.index, 10);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (!isTop) return;
    const { offset } = info;
    if (
      Math.abs(offset.x) > SWIPE_THRESHOLD ||
      offset.y < -SWIPE_THRESHOLD
    ) {
      onDismiss(info);
    }
  };

  const cardVariants = {
    inStack: {
      scale: 1 - depth * 0.045,
      y: depth * 16,
      rotate: depth * -2.8,
      opacity: 1 - depth * 0.12,
    },
    exit: () => {
      const v = exitVectorRef.current ?? { x: 420, y: 0, rotate: 12 };
      return {
        x: v.x,
        y: v.y,
        rotate: v.rotate,
        opacity: 0,
        transition: { type: "spring" as const, stiffness: 280, damping: 28 },
      };
    },
  };

  return (
    <motion.div
      className="absolute inset-x-0 top-0 touch-pan-y"
      style={{ zIndex: STACK_DEPTH - depth }}
      variants={cardVariants}
      initial={isTop ? { scale: 0.96, y: 18, opacity: 0.85 } : false}
      animate="inStack"
      exit="exit"
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
      drag={isTop && !reduceMotion ? true : false}
      dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
      dragElastic={0.72}
      onDragEnd={handleDragEnd}
      whileDrag={
        isTop
          ? {
              scale: 1.02,
              rotate: 0,
              cursor: "grabbing",
            }
          : undefined
      }
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden border border-line bg-paper-dim shadow-[0_24px_60px_-20px_rgba(20,16,9,0.35)]">
        {src ? (
          <img
            src={src}
            alt={section.title}
            loading={depth === 0 ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
            className="pointer-events-none h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-paper-dim">
            <span className="label text-muted">Скоро</span>
          </div>
        )}

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/88 via-ink/25 to-ink/10"
          aria-hidden
        />

        {isTop && (
          <p className="label pointer-events-none absolute left-4 top-4 text-paper/55">
            Свайп →
          </p>
        )}

        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="label mb-2 text-paper/65">
            {String(indexNum).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
          <p className="label text-signal">{section.kicker}</p>
          <h3 className="display mt-1 text-[clamp(1.65rem,7.5vw,2.25rem)] leading-[0.95] text-paper">
            {section.title}
          </h3>

          {isTop && (
            <Link
              to={getSectionPath(section.key)}
              onClick={resetScrollPosition}
              className="label mt-4 inline-flex items-center gap-2 border border-paper/35 bg-paper/10 px-4 py-2.5 text-paper backdrop-blur-sm transition-colors duration-200 active:border-signal active:bg-signal active:text-paper"
            >
              Смотреть работы
              <span aria-hidden>↗</span>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function MobileDeck({ sections }: { sections: Section[] }) {
  const reduceMotion = useReducedMotion();
  const [deckIndex, setDeckIndex] = useState(0);
  const exitVectorRef = useRef<ExitVector>({ x: 420, y: 0, rotate: 12 });

  const advance = useCallback(
    (info: PanInfo) => {
      exitVectorRef.current = deckExitVector(info);
      setDeckIndex((i) => (i + 1) % sections.length);
    },
    [sections.length]
  );

  const stackSections = sections.slice(deckIndex, deckIndex + STACK_DEPTH);

  return (
    <div className="md:hidden">
      <div className="relative mx-auto h-[min(68vh,520px)] max-w-md">
        <AnimatePresence mode="popLayout" initial={false}>
          {[...stackSections].reverse().map((section, reverseIdx) => {
            const depth = reverseIdx;
            const isTop = depth === 0;
            return (
              <DeckCard
                key={section.key}
                section={section}
                depth={depth}
                isTop={isTop}
                total={sections.length}
                exitVectorRef={exitVectorRef}
                onDismiss={advance}
              />
            );
          })}
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        {sections.map((s, i) => (
          <button
            key={s.key}
            type="button"
            aria-label={`${s.title}, карточка ${i + 1}`}
            aria-current={i === deckIndex ? "true" : undefined}
            onClick={() => setDeckIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 ease-art ${
              i === deckIndex
                ? "w-7 bg-signal"
                : "w-2 bg-line active:bg-muted"
            }`}
          />
        ))}
      </div>

      {reduceMotion && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {sections.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setDeckIndex(i)}
              className={`label border px-3 py-1.5 transition-colors ${
                i === deckIndex
                  ? "border-signal text-signal"
                  : "border-line text-muted"
              }`}
            >
              {s.index}
            </button>
          ))}
        </div>
      )}

      <p className="label mt-5 text-center text-muted">
        {reduceMotion
          ? "Выберите направление кнопкой или точками"
          : "Смахните карточку — следующее направление · или откройте раздел"}
      </p>

      <ul className="mt-8 border-t border-line">
        {sections.map((s, i) => (
          <li key={s.key}>
            <Link
              to={getSectionPath(s.key)}
              onClick={resetScrollPosition}
              onFocus={() => setDeckIndex(i)}
              className={`flex w-full items-center justify-between gap-3 border-b border-line py-4 transition-colors active:bg-paper-dim ${
                i === deckIndex ? "text-signal" : "text-ink"
              }`}
            >
              <span className="label w-7 shrink-0 text-muted">{s.index}</span>
              <span className="display min-w-0 flex-1 text-[clamp(1.2rem,5vw,1.5rem)] leading-none">
                {s.title}
              </span>
              <span className="shrink-0 text-lg">↗</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DesktopIndex({ sections }: { sections: Section[] }) {
  return (
    <ul className="hidden border-t border-line md:block">
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
  );
}

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

        <MobileDeck sections={sections} />
        <DesktopIndex sections={sections} />
      </div>
    </section>
  );
}
