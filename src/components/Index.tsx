import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from "motion/react";
import { getSectionPath, type Section } from "../data/sections";
import { useSections } from "../hooks/useSections";
import { resetScrollPosition } from "../utils/scrollTo";

const STACK_DEPTH = 3;
const SWIPE_THRESHOLD = 52;
const SWIPE_VELOCITY = 380;
const SWIPE_COOLDOWN_MS = 240;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const STACK_SPRING = { type: "spring" as const, stiffness: 290, damping: 34, mass: 0.95 };

type FlyawayOrigin = { x: number; rotateZ: number };
type FlyawayEnd = { x: number; y: number; rotateZ: number; scale: number };

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

function dragTilt(x: number) {
  return Math.max(-11, Math.min(11, x * 0.065));
}

function flyawayEnd(direction: "forward" | "back", info: PanInfo): FlyawayEnd {
  const { offset, velocity } = info;
  const boost = Math.min(Math.abs(velocity.x) * 0.12, 100);
  const baseX = offset.x + velocity.x * 0.18;

  if (direction === "back") {
    const x = Math.max(baseX, 120) + 260 + boost;
    return { x, y: 72, rotateZ: 11 + boost * 0.04, scale: 0.9 };
  }

  const x = Math.min(baseX, -120) - 260 - boost;
  return { x, y: 72, rotateZ: -11 - boost * 0.04, scale: 0.9 };
}

function CardFace({
  section,
  total,
  showHint,
  showCta,
}: {
  section: Section;
  total: number;
  showHint?: boolean;
  showCta?: boolean;
}) {
  const src = sectionPreview(section);
  const indexNum = Number.parseInt(section.index, 10);

  return (
    <div className="deck-card-face relative aspect-[3/4] w-full overflow-hidden border border-line bg-paper-dim">
      {src ? (
        <img
          src={src}
          alt={section.title}
          loading="eager"
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

      {showHint && (
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

        {showCta && (
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
  );
}

function DeckCard({
  section,
  depth,
  isTop,
  total,
  reduceMotion,
  onDismiss,
}: {
  section: Section;
  depth: number;
  isTop: boolean;
  total: number;
  reduceMotion: boolean;
  onDismiss: (info: PanInfo) => void;
}) {
  const dragX = useMotionValue(0);
  const rotateZ = useTransform(dragX, [-140, 140], [-11, 11]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (!isTop) return;
    const { offset, velocity } = info;
    const swipedLeft =
      offset.x < -SWIPE_THRESHOLD || velocity.x < -SWIPE_VELOCITY;
    const swipedRight =
      offset.x > SWIPE_THRESHOLD || velocity.x > SWIPE_VELOCITY;

    if (swipedLeft || swipedRight) {
      onDismiss(info);
      return;
    }

    animate(dragX, 0, { type: "spring", stiffness: 420, damping: 36 });
  };

  return (
    <motion.div
      layout
      className="deck-card absolute inset-x-0 top-0"
      style={{
        zIndex: STACK_DEPTH - depth,
        touchAction: isTop ? "pan-y" : "none",
        x: isTop ? dragX : 0,
        rotateZ: isTop ? rotateZ : undefined,
      }}
      animate={{
        scale: 1 - depth * 0.042,
        y: depth * 14,
        opacity: 1 - depth * 0.09,
        rotateZ: isTop ? 0 : depth * -2.2,
      }}
      transition={{
        ...STACK_SPRING,
        layout: STACK_SPRING,
      }}
      drag={isTop && !reduceMotion ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.42}
      dragMomentum={false}
      dragDirectionLock
      onDragEnd={handleDragEnd}
      whileDrag={
        isTop
          ? {
              scale: 1.012,
              y: -2,
            }
          : undefined
      }
    >
      <CardFace
        section={section}
        total={total}
        showHint={isTop && !reduceMotion}
        showCta={isTop}
      />
    </motion.div>
  );
}

function FlyawayCard({
  id,
  section,
  total,
  origin,
  end,
  direction,
  onDone,
}: {
  id: number;
  section: Section;
  total: number;
  origin: FlyawayOrigin;
  end: FlyawayEnd;
  direction: "forward" | "back";
  onDone: (id: number) => void;
}) {
  const smearSide = direction === "forward" ? "right" : "left";

  return (
    <motion.div
      className="deck-flyaway pointer-events-none absolute inset-x-0 top-0 z-50"
      initial={{
        x: origin.x,
        y: 0,
        rotateZ: origin.rotateZ,
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
      }}
      animate={{
        x: [origin.x, origin.x + (end.x - origin.x) * 0.45, end.x],
        y: [0, -28, end.y],
        rotateZ: [origin.rotateZ, origin.rotateZ * 0.55, end.rotateZ],
        scale: [1, 1.02, end.scale],
        opacity: [1, 0.98, 0],
        filter: ["blur(0px)", "blur(0px)", "blur(2px)"],
      }}
      transition={{
        duration: 0.78,
        ease: EASE_OUT,
        times: [0, 0.32, 1],
      }}
      onAnimationComplete={() => onDone(id)}
    >
      <motion.div
        className="deck-card-face relative shadow-[0_28px_80px_-16px_rgba(20,16,9,0.5)]"
        animate={{
          boxShadow: [
            "0 28px 80px -16px rgba(20,16,9,0.45)",
            "0 36px 90px -12px rgba(20,16,9,0.35)",
            "0 8px 24px -8px rgba(20,16,9,0.1)",
          ],
        }}
        transition={{ duration: 0.78, ease: EASE_OUT, times: [0, 0.35, 1] }}
      >
        <CardFace section={section} total={total} />
        <motion.div
          className="pointer-events-none absolute inset-y-6 w-20"
          style={{
            [smearSide]: "-12px",
            background:
              smearSide === "right"
                ? "linear-gradient(90deg, transparent 0%, rgba(223,59,31,0.12) 35%, rgba(223,59,31,0.65) 70%, rgba(223,59,31,0) 100%)"
                : "linear-gradient(270deg, transparent 0%, rgba(223,59,31,0.12) 35%, rgba(223,59,31,0.65) 70%, rgba(223,59,31,0) 100%)",
          }}
          initial={{ opacity: 0, scaleX: 0.3 }}
          animate={{ opacity: [0, 0.85, 0], scaleX: [0.3, 1.15, 0.7] }}
          transition={{ duration: 0.55, ease: EASE_OUT, times: [0, 0.4, 1] }}
          aria-hidden
        />
      </motion.div>
    </motion.div>
  );
}

function MobileDeck({ sections }: { sections: Section[] }) {
  const reduceMotion = useReducedMotion();
  const n = sections.length;
  const [deckIndex, setDeckIndex] = useState(0);
  const [flyaway, setFlyaway] = useState<{
    id: number;
    section: Section;
    origin: FlyawayOrigin;
    end: FlyawayEnd;
    direction: "forward" | "back";
  } | null>(null);

  const lastSwipeRef = useRef(0);
  const flyawayIdRef = useRef(0);

  const performSwipe = useCallback(
    (direction: "forward" | "back", info: PanInfo) => {
      if (n === 0) return;

      const now = Date.now();
      if (now - lastSwipeRef.current < SWIPE_COOLDOWN_MS) return;
      lastSwipeRef.current = now;

      const current = sections[deckIndex];
      if (!current) return;

      const next =
        direction === "back"
          ? (deckIndex - 1 + n) % n
          : (deckIndex + 1) % n;

      if (reduceMotion) {
        setDeckIndex(next);
        return;
      }

      setFlyaway({
        id: ++flyawayIdRef.current,
        section: current,
        origin: { x: info.offset.x, rotateZ: dragTilt(info.offset.x) },
        end: flyawayEnd(direction, info),
        direction,
      });
      setDeckIndex(next);
    },
    [deckIndex, n, reduceMotion, sections]
  );

  const handleDismiss = useCallback(
    (info: PanInfo) => {
      const { offset, velocity } = info;
      const swipedRight =
        offset.x > SWIPE_THRESHOLD || velocity.x > SWIPE_VELOCITY;
      performSwipe(swipedRight ? "back" : "forward", info);
    },
    [performSwipe]
  );

  const clearFlyaway = useCallback((id: number) => {
    setFlyaway((prev) => (prev?.id === id ? null : prev));
  }, []);

  const jumpTo = useCallback(
    (index: number) => {
      if (index === deckIndex || n === 0) return;
      setFlyaway(null);
      lastSwipeRef.current = 0;
      setDeckIndex(index);
    },
    [deckIndex, n]
  );

  const stack = getCircularStack(sections, deckIndex, STACK_DEPTH);

  return (
    <div className="md:hidden">
      <div
        className="deck-stage relative mx-auto h-[min(68vh,520px)] max-w-md"
        style={{ touchAction: "pan-y" }}
      >
        {stack.map(({ section, offset }) => (
          <DeckCard
            key={section.key}
            section={section}
            depth={offset}
            isTop={offset === 0}
            total={n}
            reduceMotion={!!reduceMotion}
            onDismiss={handleDismiss}
          />
        ))}

        {flyaway && (
          <FlyawayCard
            id={flyaway.id}
            section={flyaway.section}
            total={n}
            origin={flyaway.origin}
            end={flyaway.end}
            direction={flyaway.direction}
            onDone={clearFlyaway}
          />
        )}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        {sections.map((s, i) => (
          <button
            key={s.key}
            type="button"
            aria-label={`${s.title}, карточка ${i + 1}`}
            aria-current={i === deckIndex ? "true" : undefined}
            onClick={() => jumpTo(i)}
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
              onClick={() => jumpTo(i)}
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
              onFocus={() => jumpTo(i)}
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
