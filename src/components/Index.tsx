import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from "motion/react";
import { getSectionPath, type Section, type SectionKey } from "../data/sections";
import { useSections } from "../hooks/useSections";
import { useSiteContent } from "../context/ContentContext";
import { resolveDeckIndex, saveDeckSection } from "../utils/deckIntent";
import { vkMediaUrl } from "../utils/mediaUrl";
import { setScrollIntent } from "../utils/scrollIntent";

const STACK_DEPTH = 3;
const SWIPE_THRESHOLD = 48;
const SWIPE_VELOCITY = 340;
const SWIPE_COOLDOWN_MS = 240;
const INTENT_SLOP = 8;
/** Ниже = охотнее захватываем горизонтальный жест (диагональ тоже листает карточку) */
const HORIZONTAL_INTENT_RATIO = 0.38;
const HORIZONTAL_DISMISS_RATIO = 0.28;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const DRAG_PEEK_THRESHOLD = 12;
const SETTLE_SPRING = { type: "spring" as const, stiffness: 300, damping: 28, mass: 0.9 };
const STACK_SLOT = { y: 14, scale: 0.958, rotate: -2.2, opacity: 0.91 };

type SwipeGesture = {
  active: boolean;
  intent: "none" | "horizontal" | "vertical";
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  lastT: number;
  vx: number;
  vy: number;
};

function emptyGesture(): SwipeGesture {
  return {
    active: false,
    intent: "none",
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    lastT: 0,
    vx: 0,
    vy: 0,
  };
}

function isHorizontalGesture(dx: number, dy: number, ratio: number) {
  return Math.abs(dx) >= Math.abs(dy) * ratio;
}

function resolveSwipeDirection(
  offsetX: number,
  offsetY: number,
  vx: number,
  vy: number
): "forward" | "back" | null {
  const absX = Math.abs(offsetX);
  const absY = Math.abs(offsetY);
  const absVx = Math.abs(vx);
  const absVy = Math.abs(vy);

  const byOffset =
    absX > SWIPE_THRESHOLD && isHorizontalGesture(offsetX, offsetY, HORIZONTAL_DISMISS_RATIO);
  const byVelocity =
    absVx > SWIPE_VELOCITY && isHorizontalGesture(vx, vy, HORIZONTAL_DISMISS_RATIO);

  if (!byOffset && !byVelocity) return null;

  const axis = byVelocity && absVx >= absX * 0.5 ? vx : offsetX;
  return axis < 0 ? "back" : "forward";
}

function makePanInfo(g: SwipeGesture, endX: number, endY: number): PanInfo {
  return {
    offset: { x: endX - g.startX, y: endY - g.startY },
    velocity: { x: g.vx, y: g.vy },
    point: { x: endX, y: endY },
    delta: { x: endX - g.lastX, y: endY - g.lastY },
  };
}

type FlyawayOrigin = { x: number; rotateZ: number };
type FlyawayEnd = { x: number; y: number; rotateZ: number; scale: number };

type SettleFrom = { y: number; scale: number; rotate: number; opacity: number };

function settleStartPose(direction: "forward" | "back", info: PanInfo): SettleFrom {
  const peekProgress =
    direction === "back"
      ? Math.min(1, Math.max(0, -info.offset.x / 80))
      : 0;

  return {
    y: STACK_SLOT.y * (1 - peekProgress),
    scale: STACK_SLOT.scale + (1 - STACK_SLOT.scale) * peekProgress,
    rotate: STACK_SLOT.rotate * (1 - peekProgress),
    opacity: STACK_SLOT.opacity + (1 - STACK_SLOT.opacity) * peekProgress,
  };
}

function stackPose(depth: number, backDrag: boolean, isTop: boolean): SettleFrom {
  if (isTop) {
    return { y: 0, scale: 1, rotate: 0, opacity: 1 };
  }

  return {
    y: depth * 14,
    scale: 1 - depth * 0.042,
    rotate: depth * -2.2,
    opacity: backDrag ? 0.1 : 1 - depth * 0.09,
  };
}
function previewCandidates(section: Section) {
  const list: string[] = [];
  if (section.preview) list.push(section.preview);
  for (const src of section.images) {
    if (!list.includes(src)) list.push(src);
  }
  return list;
}

function DeckPreviewImage({ section, alt }: { section: Section; alt: string }) {
  const { assetVersions } = useSiteContent();
  const candidates = useMemo(() => previewCandidates(section), [section]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [candidates]);

  const src = index < candidates.length ? candidates[index] : null;

  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-paper-dim">
        <span className="label text-muted">Скоро</span>
      </div>
    );
  }

  return (
    <img
      key={src}
      src={vkMediaUrl(src, assetVersions)}
      alt={alt}
      loading="eager"
      decoding="async"
      draggable={false}
      onError={() => {
        setIndex((current) => {
          const next = current + 1;
          return next <= candidates.length ? next : current;
        });
      }}
      className="deck-preview-img pointer-events-none h-full w-full object-cover"
    />
  );
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

  if (direction === "forward") {
    const x = Math.max(baseX, 120) + 280 + boost;
    return { x, y: 80, rotateZ: 12 + boost * 0.04, scale: 0.88 };
  }

  const x = Math.min(baseX, -120) - 280 - boost;
  return { x, y: 80, rotateZ: -12 - boost * 0.04, scale: 0.88 };
}

function goToSection(key: SectionKey) {
  saveDeckSection(key);
  setScrollIntent("index");
}

function CardFace({
  section,
  total,
  reduceMotion,
}: {
  section: Section;
  total: number;
  reduceMotion?: boolean;
}) {
  const indexNum = Number.parseInt(section.index, 10);

  return (
    <div className="deck-card-face relative aspect-[3/4] w-full overflow-hidden border border-line bg-paper-dim">
      <DeckPreviewImage section={section} alt={section.title} />

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/88 via-ink/25 to-ink/10"
        aria-hidden
      />

      {!reduceMotion && (
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

        <Link
          to={getSectionPath(section.key)}
          onClick={() => goToSection(section.key)}
          onPointerDown={(e) => e.stopPropagation()}
          className="label mt-4 inline-flex items-center gap-2 border border-paper/35 bg-paper/10 px-4 py-2.5 text-paper backdrop-blur-sm transition-colors duration-200 active:border-signal active:bg-signal active:text-paper"
        >
          Смотреть работы
          <span aria-hidden>↗</span>
        </Link>
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
  dragOffset,
  isSettling,
  settleTick,
  settleFrom,
  onDismiss,
  onDragChange,
  onSettleComplete,
}: {
  section: Section;
  depth: number;
  isTop: boolean;
  total: number;
  reduceMotion: boolean;
  dragOffset: number;
  isSettling: boolean;
  settleTick: number;
  settleFrom?: SettleFrom;
  onDismiss: (info: PanInfo) => void;
  onDragChange: (x: number) => void;
  onSettleComplete?: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<SwipeGesture>(emptyGesture());
  const [lockScroll, setLockScroll] = useState(false);

  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const rotateZ = useTransform(dragX, [-140, 140], [-11, 11]);

  const backDrag = dragOffset < -DRAG_PEEK_THRESHOLD;
  const pose = stackPose(depth, backDrag, isTop && !isSettling);

  const poseY = useMotionValue(pose.y);
  const poseScale = useMotionValue(pose.scale);
  const poseRotate = useMotionValue(pose.rotate);
  const poseOpacity = useMotionValue(pose.opacity);

  useEffect(() => {
    if (!isTop) {
      dragX.set(0);
      dragY.set(0);
      gestureRef.current = emptyGesture();
      setLockScroll(false);
    }
  }, [isTop, dragX, dragY]);

  useEffect(() => {
    if (isSettling) return;
    poseY.set(pose.y);
    poseScale.set(pose.scale);
    poseRotate.set(pose.rotate);
    poseOpacity.set(pose.opacity);
  }, [isSettling, pose.y, pose.scale, pose.rotate, pose.opacity, poseY, poseScale, poseRotate, poseOpacity]);

  useEffect(() => {
    if (!isTop || !isSettling || !settleFrom || reduceMotion) return;

    let cancelled = false;

    poseY.set(settleFrom.y);
    poseScale.set(settleFrom.scale);
    poseRotate.set(settleFrom.rotate);
    poseOpacity.set(settleFrom.opacity);

    const run = async () => {
      await Promise.all([
        animate(poseY, 0, SETTLE_SPRING),
        animate(poseScale, 1, SETTLE_SPRING),
        animate(poseRotate, 0, SETTLE_SPRING),
        animate(poseOpacity, 1, SETTLE_SPRING),
      ]);
      if (!cancelled) onSettleComplete?.();
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [
    isTop,
    isSettling,
    settleTick,
    settleFrom,
    reduceMotion,
    onSettleComplete,
    poseY,
    poseScale,
    poseRotate,
    poseOpacity,
  ]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || !isTop || reduceMotion) return;

    const resetGesture = () => {
      gestureRef.current = emptyGesture();
      setLockScroll(false);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0]!;
      const now = performance.now();
      gestureRef.current = {
        active: true,
        intent: "none",
        startX: t.clientX,
        startY: t.clientY,
        lastX: t.clientX,
        lastY: t.clientY,
        lastT: now,
        vx: 0,
        vy: 0,
      };
    };

    const onTouchMove = (e: TouchEvent) => {
      const g = gestureRef.current;
      if (!g.active || e.touches.length !== 1) return;

      const t = e.touches[0]!;
      const dx = t.clientX - g.startX;
      const dy = t.clientY - g.startY;
      const now = performance.now();
      const dt = now - g.lastT;

      if (dt > 0) {
        g.vx = ((t.clientX - g.lastX) / dt) * 1000;
        g.vy = ((t.clientY - g.lastY) / dt) * 1000;
      }
      g.lastX = t.clientX;
      g.lastY = t.clientY;
      g.lastT = now;

      if (g.intent === "none") {
        if (Math.hypot(dx, dy) < INTENT_SLOP) return;

        if (isHorizontalGesture(dx, dy, HORIZONTAL_INTENT_RATIO)) {
          g.intent = "horizontal";
          setLockScroll(true);
        } else if (isHorizontalGesture(dy, dx, HORIZONTAL_INTENT_RATIO)) {
          g.intent = "vertical";
          g.active = false;
          return;
        } else {
          return;
        }
      }

      if (g.intent === "horizontal") {
        e.preventDefault();
        dragX.set(dx);
        dragY.set(dy * 0.14);
        onDragChange(dx);
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      const g = gestureRef.current;
      if (!g.active || g.intent !== "horizontal") {
        resetGesture();
        return;
      }

      const t = e.changedTouches[0]!;
      const dx = t.clientX - g.startX;
      const dy = t.clientY - g.startY;
      const direction = resolveSwipeDirection(dx, dy, g.vx, g.vy);

      if (direction) {
        onDismiss(makePanInfo(g, t.clientX, t.clientY));
      } else {
        animate(dragX, 0, { type: "spring", stiffness: 420, damping: 36 });
        animate(dragY, 0, { type: "spring", stiffness: 420, damping: 36 });
      }

      onDragChange(0);
      resetGesture();
    };

    const onTouchCancel = () => {
      animate(dragX, 0, { type: "spring", stiffness: 420, damping: 36 });
      animate(dragY, 0, { type: "spring", stiffness: 420, damping: 36 });
      onDragChange(0);
      resetGesture();
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchCancel, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchCancel);
    };
  }, [isTop, reduceMotion, onDismiss, onDragChange, dragX, dragY]);

  return (
    <motion.div
      ref={cardRef}
      className="deck-card absolute inset-x-0 top-0"
      style={{
        zIndex: STACK_DEPTH - depth,
        touchAction: lockScroll ? "none" : isTop ? "pan-y" : "none",
        x: isTop ? dragX : 0,
        y: isTop ? dragY : 0,
        rotateZ: isTop && !isSettling ? rotateZ : 0,
      }}
    >
      <motion.div
        className="deck-card"
        style={{
          y: poseY,
          scale: poseScale,
          rotateZ: poseRotate,
          opacity: poseOpacity,
        }}
      >
        <CardFace section={section} total={total} reduceMotion={reduceMotion} />
      </motion.div>
    </motion.div>
  );
}

function BackPeekCard({
  section,
  total,
  dragOffset,
  reduceMotion,
}: {
  section: Section;
  total: number;
  dragOffset: number;
  reduceMotion: boolean;
}) {
  const progress = Math.min(1, Math.max(0, -dragOffset / 80));
  const y = 14 - progress * 14;
  const scale = 1 - 0.042 + progress * 0.042;
  const rotate = -2.2 + progress * 2.2;

  return (
    <div
      className="deck-card absolute inset-x-0 top-0"
      style={{
        zIndex: STACK_DEPTH - 1,
        opacity: 0.91 + progress * 0.09,
        transform: `translateY(${y}px) scale(${scale}) rotate(${rotate}deg)`,
        transformOrigin: "50% 92%",
      }}
    >
      <CardFace section={section} total={total} reduceMotion={reduceMotion} />
    </div>
  );
}

function FlyawayCard({
  id,
  section,
  total,
  origin,
  end,
  onDone,
}: {
  id: number;
  section: Section;
  total: number;
  origin: FlyawayOrigin;
  end: FlyawayEnd;
  onDone: (id: number) => void;
}) {
  return (
    <motion.div
      className="deck-flyaway pointer-events-none absolute inset-x-0 top-0 z-50"
      initial={{
        x: origin.x,
        y: 0,
        rotateZ: origin.rotateZ,
        scale: 1,
        opacity: 1,
      }}
      animate={{
        x: [origin.x, origin.x + (end.x - origin.x) * 0.42, end.x],
        y: [0, -34, end.y],
        rotateZ: [origin.rotateZ, origin.rotateZ * 0.5, end.rotateZ],
        scale: [1, 1.03, end.scale],
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: 0.88,
        ease: EASE_OUT,
        times: [0, 0.34, 1],
      }}
      onAnimationComplete={() => onDone(id)}
    >
      <div className="deck-card-face relative">
        <CardFace section={section} total={total} />
      </div>
    </motion.div>
  );
}

function MobileDeck({ sections }: { sections: Section[] }) {
  const reduceMotion = useReducedMotion();
  const n = sections.length;
  const [deckIndex, setDeckIndex] = useState(() => resolveDeckIndex(sections));
  const [dragOffset, setDragOffset] = useState(0);
  const [settling, setSettling] = useState<{
    key: string;
    tick: number;
    from: SettleFrom;
  } | null>(null);
  const [flyaway, setFlyaway] = useState<{
    id: number;
    section: Section;
    origin: FlyawayOrigin;
    end: FlyawayEnd;
    direction: "forward" | "back";
  } | null>(null);

  const lastSwipeRef = useRef(0);
  const flyawayIdRef = useRef(0);

  useEffect(() => {
    const section = sections[deckIndex];
    if (section) saveDeckSection(section.key);
  }, [deckIndex, sections]);

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
      setSettling({
        key: sections[next]!.key,
        tick: Date.now(),
        from: settleStartPose(direction, info),
      });
      setDragOffset(0);
      setDeckIndex(next);
    },
    [deckIndex, n, reduceMotion, sections]
  );

  const handleDismiss = useCallback(
    (info: PanInfo) => {
      const direction = resolveSwipeDirection(
        info.offset.x,
        info.offset.y,
        info.velocity.x,
        info.velocity.y
      );
      if (direction) performSwipe(direction, info);
    },
    [performSwipe]
  );

  const clearFlyaway = useCallback((id: number) => {
    setFlyaway((prev) => (prev?.id === id ? null : prev));
  }, []);

  const clearSettle = useCallback(() => {
    setSettling(null);
  }, []);

  const jumpTo = useCallback(
    (index: number) => {
      if (index === deckIndex || n === 0) return;
      setFlyaway(null);
      setSettling(null);
      lastSwipeRef.current = 0;
      setDeckIndex(index);
    },
    [deckIndex, n]
  );

  const stack = getCircularStack(sections, deckIndex, STACK_DEPTH);
  const backPeekSection =
    n > 0 ? sections[(deckIndex - 1 + n) % n]! : null;
  const showBackPeek =
    dragOffset < -DRAG_PEEK_THRESHOLD && backPeekSection !== null;

  const handleDragChange = useCallback((x: number) => {
    setDragOffset(x);
  }, []);

  return (
    <div>
      <div
        className="deck-stage relative mx-auto h-[min(68vh,520px)] max-w-md overflow-visible"
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
            dragOffset={dragOffset}
            isSettling={offset === 0 && settling?.key === section.key}
            settleTick={settling?.tick ?? 0}
            settleFrom={
              offset === 0 && settling?.key === section.key ? settling.from : undefined
            }
            onDismiss={handleDismiss}
            onDragChange={handleDragChange}
            onSettleComplete={offset === 0 ? clearSettle : undefined}
          />
        ))}

        {showBackPeek && (
          <BackPeekCard
            section={backPeekSection}
            total={n}
            dragOffset={dragOffset}
            reduceMotion={!!reduceMotion}
          />
        )}

        {flyaway && (
          <FlyawayCard
            id={flyaway.id}
            section={flyaway.section}
            total={n}
            origin={flyaway.origin}
            end={flyaway.end}
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
              onClick={() => goToSection(s.key)}
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

function usePointerUI() {
  const [pointerUI, setPointerUI] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setPointerUI(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return pointerUI;
}

function DesktopIndex({ sections }: { sections: Section[] }) {
  return (
    <ul className="border-t border-line">
      {sections.map((s) => (
        <li key={s.key}>
          <Link
            to={getSectionPath(s.key)}
            onClick={() => goToSection(s.key)}
            className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 border-b border-line py-6 transition-colors hover:bg-paper-dim md:grid-cols-[auto_1fr_auto_auto] md:gap-8 md:py-9 lg:gap-12"
          >
            <span className="label w-8 shrink-0 text-muted">{s.index}</span>

            <div className="min-w-0">
              <span className="display block text-[clamp(1.65rem,4.5vw,4.5rem)] leading-[0.95] transition-all duration-500 ease-art group-hover:translate-x-2 group-hover:text-signal">
                {s.title}
              </span>
              <p className="label mt-4 text-muted md:mt-5">{s.kicker}</p>
            </div>

            <div className="index-desktop-preview hidden aspect-[3/4] w-28 shrink-0 overflow-hidden border border-line bg-paper-dim transition-colors duration-500 group-hover:border-signal md:block lg:w-36 xl:w-40">
              <DeckPreviewImage section={s} alt={s.title} />
            </div>

            <span className="shrink-0 text-2xl text-signal transition-transform duration-500 ease-art group-hover:translate-x-1 md:text-3xl">
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
  const pointerUI = usePointerUI();

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

        {pointerUI ? (
          <DesktopIndex sections={sections} />
        ) : (
          <MobileDeck sections={sections} />
        )}
      </div>
    </section>
  );
}
