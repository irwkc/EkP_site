import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { STUDIO } from "../data/sections";

const DRAW_MS = 680;
const BRUSH_COLOR = "#df3b1f";

type Point = { x: number; y: number };

function seededRandom(seed: number) {
  let s = seed % 2147483646 || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function buildZigzag(w: number, h: number): Point[] {
  const padY = h * 0.12;
  const y0 = padY;
  const y1 = h - padY;
  const midX = w / 2;
  const amp = w * 0.6;
  const steps = 9;
  const span = y1 - y0;
  const rand = seededRandom(Math.floor(w * 137 + h * 97));

  const yWeights: number[] = [0];
  let weightSum = 0;
  for (let i = 0; i < steps; i++) {
    weightSum += 0.65 + rand() * 0.7;
    yWeights.push(weightSum);
  }

  const pts: Point[] = [
    {
      x: midX + (rand() - 0.5) * w * 0.05,
      y: y0 + (rand() - 0.5) * span * 0.02,
    },
  ];

  for (let i = 1; i <= steps; i++) {
    const t = yWeights[i] / weightSum;
    const y = y0 + span * t + (rand() - 0.5) * span * 0.045;
    const side = i % 2 === 1 ? 1 : -1;
    const varPct = 0.01 + rand() * 0.03; // 1–4% from base
    const ampVar = amp * (1 + (rand() < 0.5 ? -1 : 1) * varPct);
    const xJitter = (rand() - 0.5) * w * 0.06;
    pts.push({ x: midX + side * ampVar + xJitter, y });
  }

  return pts;
}

export type TailPlacement = { x: number; y: number; angle: number };

/** Center + angle of the flat last tail stroke (mid → last vertex) */
export function getLastStrokePlacement(w: number, h: number): TailPlacement | null {
  const pts = buildZigzag(w, h);
  if (pts.length < 2) return null;

  const last = pts[pts.length - 1]!;
  const prev = pts[pts.length - 2]!;
  const mx = (prev.x + last.x) / 2;
  const my = (prev.y + last.y) / 2;
  const t = 0.4;
  const x = mx + (last.x - mx) * t;
  const y = my + (last.y - my) * t;
  const angle = (Math.atan2(last.y - my, last.x - mx) * 180) / Math.PI;

  return { x, y, angle };
}

/** Brush wide enough for text substrate, thin enough to keep zigzag edges visible */
function brushWidth(w: number) {
  return w * 0.22;
}

function slicePath(points: Point[], progress: number): Point[] {
  if (progress <= 0 || points.length < 2) return [points[0]];
  if (progress >= 1) return points;

  const segLens: number[] = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const len = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    segLens.push(len);
    total += len;
  }

  const target = total * progress;
  const out: Point[] = [points[0]];
  let acc = 0;

  for (let i = 1; i < points.length; i++) {
    const len = segLens[i - 1];
    if (acc + len < target) {
      out.push(points[i]);
      acc += len;
    } else {
      const t = (target - acc) / len;
      out.push({
        x: points[i - 1].x + (points[i].x - points[i - 1].x) * t,
        y: points[i - 1].y + (points[i].y - points[i - 1].y) * t,
      });
      break;
    }
  }
  return out;
}

function drawBrushPath(ctx: CanvasRenderingContext2D, points: Point[]) {
  ctx.moveTo(points[0].x, points[0].y);
  if (points.length === 2) {
    ctx.lineTo(points[1].x, points[1].y);
    return;
  }
  for (let i = 1; i < points.length - 1; i++) {
    const mx = (points[i].x + points[i + 1].x) / 2;
    const my = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, mx, my);
  }
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
}

/** Body ends at midpoint before last vertex — tail drawn separately with flat cap */
function drawBrushBody(
  ctx: CanvasRenderingContext2D,
  points: Point[]
): { mx: number; my: number; last: Point } | null {
  if (points.length < 3) return null;

  const last = points[points.length - 1]!;
  const prev = points[points.length - 2]!;
  const mx = (prev.x + last.x) / 2;
  const my = (prev.y + last.y) / 2;
  const body = points.slice(0, -1);

  ctx.moveTo(body[0].x, body[0].y);
  if (body.length === 2) {
    ctx.quadraticCurveTo(body[1].x, body[1].y, mx, my);
  } else {
    for (let i = 1; i < body.length - 1; i++) {
      const bx = (body[i].x + body[i + 1].x) / 2;
      const by = (body[i].y + body[i + 1].y) / 2;
      ctx.quadraticCurveTo(body[i].x, body[i].y, bx, by);
    }
    const i = body.length - 1;
    ctx.quadraticCurveTo(body[i].x, body[i].y, mx, my);
  }

  return { mx, my, last };
}

function offsetPoints(points: Point[], dx: number, dy: number): Point[] {
  return points.map((p) => ({ x: p.x + dx, y: p.y + dy }));
}

function strokeBrushLayer(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  brushW: number,
  alpha: number,
  dx: number,
  dy: number
) {
  const pts = offsetPoints(points, dx, dy);

  ctx.lineJoin = "round";
  ctx.globalAlpha = alpha;
  ctx.lineWidth = brushW;

  if (pts.length < 3) {
    ctx.lineCap = "round";
    ctx.beginPath();
    drawBrushPath(ctx, pts);
    ctx.stroke();
    return;
  }

  const last = pts[pts.length - 1]!;
  const prev = pts[pts.length - 2]!;
  const mx = (prev.x + last.x) / 2;
  const my = (prev.y + last.y) / 2;

  ctx.lineCap = "round";
  ctx.beginPath();
  drawBrushBody(ctx, pts);
  ctx.stroke();

  ctx.lineCap = "butt";
  ctx.beginPath();
  ctx.moveTo(mx, my);
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
}

function drawBrush(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  brushW: number,
  alpha = 1
) {
  if (points.length < 2) return;

  ctx.save();
  ctx.strokeStyle = BRUSH_COLOR;
  strokeBrushLayer(ctx, points, brushW, alpha, 0, 0);
  strokeBrushLayer(ctx, points, brushW * 0.92, alpha * 0.12, -1.5, 0);
  strokeBrushLayer(ctx, points, brushW * 0.92, alpha * 0.1, 1.2, -1);
  ctx.restore();
}

function setupCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
}

function easeBrush(t: number) {
  return 1 - Math.pow(1 - t, 2.4);
}

export type MenuLink = { href: string; label: string; n: string };

export default function MobileMenu({
  phase,
  links,
  onClose,
  onClosed,
  onDrawComplete,
}: {
  phase: "drawing" | "open" | "closing";
  links: MenuLink[];
  onClose: () => void;
  onClosed: () => void;
  onDrawComplete: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showItems, setShowItems] = useState(false);
  const [tailCta, setTailCta] = useState<TailPlacement | null>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    const updateTail = () => {
      setTailCta(
        getLastStrokePlacement(window.innerWidth, window.innerHeight)
      );
    };
    updateTail();
    window.addEventListener("resize", updateTail);
    return () => window.removeEventListener("resize", updateTail);
  }, []);

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  useEffect(() => {
    if (phase === "open") {
      setShowItems(true);
      return;
    }
    if (phase === "closing") {
      setShowItems(false);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "open") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => setupCanvas(canvas, ctx);
    resize();

    const w = () => window.innerWidth;
    const h = () => window.innerHeight;

    if (reducedMotion.current) {
      const pts = buildZigzag(w(), h());
      const brushW = brushWidth(w());
      ctx.clearRect(0, 0, w(), h());
      if (phase === "drawing") {
        drawBrush(ctx, pts, brushW);
        onDrawComplete();
      } else {
        onClosed();
      }
      return;
    }

    const closing = phase === "closing";
    const start = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      resize();
      const pts = buildZigzag(w(), h());
      const brushW = brushWidth(w());
      const elapsed = now - start;
      const raw = Math.min(1, elapsed / DRAW_MS);
      const eased = easeBrush(raw);
      const progress = closing ? 1 - eased : eased;

      ctx.clearRect(0, 0, w(), h());
      drawBrush(ctx, slicePath(pts, progress), brushW);

      if (raw < 1) {
        raf = requestAnimationFrame(frame);
      } else if (closing) {
        ctx.clearRect(0, 0, w(), h());
        onClosed();
      } else {
        onDrawComplete();
      }
    };

    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [phase, onClosed, onDrawComplete]);

  return (
    <div className="fixed inset-0 z-[80] overscroll-none md:hidden" data-mobile-menu>
      <div className="absolute inset-0 bg-paper/40 backdrop-blur-[2px]" aria-hidden />
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden />

      <motion.div
        className="relative mx-auto flex h-full w-full max-w-[min(52vw,13rem)] flex-col text-paper"
        initial={false}
        animate={{ opacity: showItems ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{ pointerEvents: showItems ? "auto" : "none" }}
      >
        <nav className="flex flex-1 flex-col items-center justify-center pb-6">
          <ul className="w-full space-y-0">
            {links.map((l, i) => (
              <motion.li
                key={l.href}
                initial={{ opacity: 0, y: 10 }}
                animate={showItems ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{
                  delay: showItems ? 0.04 + i * 0.05 : 0,
                  duration: 0.4,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <a
                  href={l.href}
                  onClick={onClose}
                  className={`group block py-3 text-center active:opacity-80 ${
                    i < links.length - 1 ? "border-b border-paper/20" : ""
                  }`}
                >
                  <span className="label text-[0.5rem] text-paper/70">{l.n}</span>
                  <span className="display mt-0.5 block text-[clamp(1.05rem,4.6vw,1.4rem)] leading-tight">
                    {l.label}
                  </span>
                </a>
              </motion.li>
            ))}
          </ul>
        </nav>
      </motion.div>

      {tailCta && (
        <motion.a
          href={STUDIO.phoneHref}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: showItems ? 1 : 0 }}
          transition={{
            delay: showItems ? 0.28 : 0,
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            left: tailCta.x,
            top: tailCta.y,
            transform: `translate(-50%, -50%) rotate(${tailCta.angle}deg)`,
            pointerEvents: showItems ? "auto" : "none",
          }}
          className="absolute z-10 flex items-center gap-3 whitespace-nowrap px-1 text-paper active:opacity-80"
        >
          <span>
            <span className="label block text-[0.5rem] text-paper/75">Записаться</span>
            <span className="mt-0.5 block text-[clamp(0.8rem,3.6vw,0.95rem)] tracking-tight">
              {STUDIO.phone}
            </span>
          </span>
          <motion.span
            className="cta-arrow-neon serif-italic mb-0.5 block shrink-0 text-xl"
            initial={false}
            animate={
              showItems
                ? reducedMotion.current
                  ? { opacity: 1, x: 0 }
                  : { opacity: 1, x: [0, 5, 0] }
                : { opacity: 0, x: -4 }
            }
            transition={
              showItems && !reducedMotion.current
                ? {
                    opacity: { delay: 0.42, duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                    x: {
                      delay: 0.55,
                      duration: 1.35,
                      repeat: Infinity,
                      repeatDelay: 2.1,
                      ease: [0.16, 1, 0.3, 1],
                    },
                  }
                : { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
            }
          >
            →
          </motion.span>
        </motion.a>
      )}

      <motion.p
        initial={false}
        animate={{ opacity: showItems ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="label pointer-events-none absolute inset-x-0 bottom-0 text-center text-[0.5rem] text-paper/55 safe-bottom"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        {STUDIO.city} · {STUDIO.address}
      </motion.p>
    </div>
  );
}
