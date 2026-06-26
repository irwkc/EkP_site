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

const STACK_DEPTH = 3;
const SWIPE_THRESHOLD = 56;
const SWIPE_VELOCITY = 420;

type ExitVector = { x: number; y: number; rotate: number };
type DeckDirection = "forward" | "back" | "jump";

function sectionPreview(section: Section) {
  return section.images[0] ?? null;
}

function getCircularStack(sections: Section[], startIndex: number, count: number) {
  const n = sections.length;
  if (n === 0) return [];
  const size = Math.min(count, n);
  return Array.from({ length: size }, (_, i) => ({
    section: sections[(startIndex + i) % n]!,
    offset: i,
  }));
}

function deckExitVector(direction: "forward" | "back", info?: PanInfo): ExitVector {
  const offsetX = info?.offset.x ?? 0;
  if (direction === "back") {
    return {
      x: Math.max(offsetX, 280) + 140,
      y: (info?.offset.y ?? 0) * 0.15,
      rotate: 12,
    };
  }
  return {
    x: Math.min(offsetX, -280) - 140,
    y: (info?.offset.y ?? 0) * 0.15,
    rotate: -12,
  };
}

function DeckCard({
  section,
  depth,
  isTop,
  total,
  exitVectorRef,
  directionRef,
  skipExitRef,
  onDismiss,
}: {
  section: Section;
  depth: number;
  isTop: boolean;
  total: number;
  exitVectorRef: RefObject<ExitVector>;
  directionRef: RefObject<DeckDirection>;
  skipExitRef: RefObject<boolean>;
  onDismiss: (info: PanInfo) => void;
}) {
  const reduceMotion = useReducedMotion();
  const src = sectionPreview(section);
  const indexNum = Number.parseInt(section.index, 10);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (!isTop) return;
    const { offset, velocity } = info;
    const swipedLeft =
      offset.x < -SWIPE_THRESHOLD || velocity.x < -SWIPE_VELOCITY;
    const swipedRight =
      offset.x > SWIPE_THRESHOLD || velocity.x > SWIPE_VELOCITY;

    if (swipedLeft || swipedRight) {
      onDismiss(info);
    }
  };

  const topInitial =
    directionRef.current === "back"
      ? { x: -72, opacity: 0.88, scale: 0.98 }
      : { scale: 0.97, y: 12, opacity: 0.9 };

  const cardVariants = {
    inStack: {
      x: 0,
      scale: 1 - depth * 0.045,
      y: depth * 14,
      rotate: depth * -2.5,
      opacity: 1 - depth * 0.1,
    },
    exit: () => {
      if (skipExitRef.current) {
        return { opacity: 0, transition: { duration: 0.12 } };
      }
      const v = exitVectorRef.current ?? { x: -420, y: 0, rotate: -12 };
      return {
        x: v.x,
        y: v.y,
        rotate: v.rotate,
        opacity: 0,
        transition: { type: "spring" as const, stiffness: 320, damping: 32 },
      };
    },
  };

  return (
    <motion.div
      className="absolute inset-x-0 top-0"
      style={{ zIndex: STACK_DEPTH - depth, touchAction: isTop ? "pan-y" : "none" }}
      variants={cardVariants}
      initial={isTop ? topInitial : false}
      animate="inStack"
      exit="exit"
      transition={{ type: "spring", stiffness: 440, damping: 36 }}
      drag={isTop && !reduceMotion ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.55}
      dragMomentum={false}
      dragDirectionLock
      onDragEnd={handleDragEnd}
      whileDrag={
        isTop
          ? {
              scale: 1.015,
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

        {isTop && !reduceMotion && (
          <div
            className="label pointer-events-none absolute inset-x-0 top-0 flex items-center justify-center gap-3 py-3 text-paper/45"
            aria-hidden
          >
            <span>←</span>
            <span>свайп</span>
            <span>→</span>
          </div>
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
              onPointerDown={(e) => e.stopPropagation()}
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
  const n = sections.length;
  const [deckIndex, setDeckIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const exitVectorRef = useRef<ExitVector>({ x: -420, y: 0, rotate: -12 });
  const directionRef = useRef<DeckDirection>("forward");
  const skipExitRef = useRef(false);

  const goTo = useCallback(
    (next: number, info: PanInfo | null, direction: DeckDirection) => {
      if (animating || n === 0 || next === deckIndex) return;

      directionRef.current = direction;
      skipExitRef.current = direction === "jump";

      if (direction === "jump") {
        setDeckIndex(next);
        return;
      }

      exitVectorRef.current = deckExitVector(
        direction === "back" ? "back" : "forward",
        info ?? undefined
      );
      setAnimating(true);
      setDeckIndex(next);
    },
    [animating, deckIndex, n]
  );

  const handleDismiss = useCallback(
    (info: PanInfo) => {
      const { offset, velocity } = info;
      const swipedRight =
        offset.x > SWIPE_THRESHOLD || velocity.x > SWIPE_VELOCITY;
      const next = swipedRight
        ? (deckIndex - 1 + n) % n
        : (deckIndex + 1) % n;
      goTo(next, info, swipedRight ? "back" : "forward");
    },
    [deckIndex, goTo, n]
  );

  const handleExitComplete = useCallback(() => {
    setAnimating(false);
    skipExitRef.current = false;
  }, []);

  const stack = getCircularStack(sections, deckIndex, STACK_DEPTH);

  return (
    <div className="md:hidden">
      <div
        className="relative mx-auto h-[min(68vh,520px)] max-w-md"
        style={{ touchAction: "pan-y" }}
      >
        <AnimatePresence mode="sync" initial={false} onExitComplete={handleExitComplete}>
          {[...stack].reverse().map(({ section, offset }) => {
            const depth = offset;
            const isTop = depth === 0;
            return (
              <DeckCard
                key={section.key}
                section={section}
                depth={depth}
                isTop={isTop}
                total={n}
                exitVectorRef={exitVectorRef}
                directionRef={directionRef}
                skipExitRef={skipExitRef}
                onDismiss={handleDismiss}
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
            disabled={animating}
            onClick={() => goTo(i, null, "jump")}
            className={`h-2 rounded-full transition-all duration-300 ease-art disabled:opacity-40 ${
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
              onClick={() => goTo(i, null, "jump")}
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
          : "Свайп влево или вправо · вертикально — скролл страницы"}
      </p>

      <ul className="mt-8 border-t border-line">
        {sections.map((s, i) => (
          <li key={s.key}>
            <Link
              to={getSectionPath(s.key)}
              onClick={resetScrollPosition}
              onFocus={() => goTo(i, null, "jump")}
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
