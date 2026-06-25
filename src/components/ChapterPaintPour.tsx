import { useEffect, useRef } from "react";

const OPEN_MS = 700;

/** Ease matching chapter wipe: cubic-bezier(0.76, 0, 0.24, 1) */
function easePour(t: number) {
  return 1 - Math.pow(1 - t, 2.65);
}

function drawPour(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  progress: number,
  fade: number
) {
  ctx.clearRect(0, 0, w, h);
  if (fade <= 0.01) return;

  const pourH = h * easePour(progress);
  const time = progress * Math.PI * 2;

  // main pour body — wavy leading edge
  ctx.fillStyle = `rgba(223, 59, 31, ${0.9 * fade})`;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w, 0);
  for (let x = w; x >= 0; x -= 2) {
    const wave =
      Math.sin(x * 0.012 + time * 1.4) * 16 +
      Math.sin(x * 0.035 + time * 2.1) * 9 +
      Math.sin(x * 0.006 + time * 0.7) * 22 * (1 - progress * 0.6);
    ctx.lineTo(x, pourH + wave);
  }
  ctx.closePath();
  ctx.fill();

  // lighter wash ahead of the front
  ctx.fillStyle = `rgba(223, 59, 31, ${0.22 * fade})`;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w, 0);
  for (let x = w; x >= 0; x -= 3) {
    const wave =
      Math.sin(x * 0.012 + time * 1.4) * 16 +
      Math.sin(x * 0.035 + time * 2.1) * 9;
    ctx.lineTo(x, pourH + wave + 28);
  }
  ctx.closePath();
  ctx.fill();

  // drips along the wave front
  const dripCount = Math.max(3, Math.floor(w / 90));
  for (let i = 0; i < dripCount; i++) {
    const x = (w / (dripCount + 1)) * (i + 1) + Math.sin(i * 2.1 + time) * 20;
    const wave =
      Math.sin(x * 0.012 + time * 1.4) * 16 +
      Math.sin(x * 0.035 + time * 2.1) * 9;
    const y0 = pourH + wave;
    const len = (18 + (i % 3) * 14) * (0.4 + progress * 0.6);
    const bulge = 5 + (i % 2) * 2;

    ctx.fillStyle = `rgba(182, 47, 23, ${0.85 * fade})`;
    ctx.beginPath();
    ctx.ellipse(x, y0 + len * 0.45, bulge, len * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(223, 59, 31, ${0.7 * fade})`;
    ctx.beginPath();
    ctx.ellipse(x, y0 + len * 0.85, bulge * 0.55, bulge * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // thin graphite tint at the very top edge
  const grad = ctx.createLinearGradient(0, 0, 0, 48);
  grad.addColorStop(0, `rgba(20, 16, 9, ${0.12 * fade})`);
  grad.addColorStop(1, "rgba(20, 16, 9, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, 48);
}

/**
 * Paint pour on section open — flows top → bottom, then fades.
 */
export default function ChapterPaintPour({ chapterKey }: { chapterKey: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = ref.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const nw = Math.round(rect.width);
      const nh = Math.round(rect.height);
      if (nw === w && nh === h) return;
      canvas.width = nw;
      canvas.height = nh;
      w = nw;
      h = nh;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    const start = performance.now();

    const frame = (now: number) => {
      resize();
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / OPEN_MS);
      const fade = progress < 0.62 ? 1 : 1 - (progress - 0.62) / 0.38;

      drawPour(ctx, w, h, progress, fade);

      if (progress < 1) {
        raf = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [chapterKey]);

  return <canvas ref={ref} className="chapter-paint-pour" aria-hidden />;
}
