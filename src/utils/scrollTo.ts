import { getLenis } from "../hooks/useLenis";

/** Matches CSS --ease-art: cubic-bezier(0.16, 1, 0.3, 1) */
function siteEase(t: number): number {
  const x1 = 0.16;
  const y1 = 1;
  const x2 = 0.3;
  const y2 = 1;

  const ax = 1 - 3 * x2 + 3 * x1;
  const bx = 3 * x2 - 6 * x1;
  const cx = 3 * x1;
  const ay = 1 - 3 * y2 + 3 * y1;
  const by = 3 * y2 - 6 * y1;
  const cy = 3 * y1;

  const sampleX = (u: number) => ((ax * u + bx) * u + cx) * u;
  const sampleY = (u: number) => ((ay * u + by) * u + cy) * u;
  const sampleDX = (u: number) => (3 * ax * u + 2 * bx) * u + cx;

  let u = t;
  for (let i = 0; i < 6; i++) {
    const dx = sampleX(u) - t;
    if (Math.abs(dx) < 1e-5) break;
    const slope = sampleDX(u);
    if (slope === 0) break;
    u -= dx / slope;
  }

  return sampleY(u);
}

let activeRaf = 0;
let detachUserListeners: (() => void) | null = null;

function cancelActiveScroll() {
  if (activeRaf) {
    cancelAnimationFrame(activeRaf);
    activeRaf = 0;
  }
  detachUserListeners?.();
  detachUserListeners = null;
}

function animateScrollTo(targetY: number, durationMs: number) {
  cancelActiveScroll();

  const start = window.scrollY;
  const diff = targetY - start;
  if (Math.abs(diff) < 1) return;

  const startTime = performance.now();
  let stopped = false;

  const stop = () => {
    if (stopped) return;
    stopped = true;
    cancelActiveScroll();
  };

  const onUserInput = () => stop();

  const onKeyScroll = (e: KeyboardEvent) => {
    const keys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
    if (keys.includes(e.key)) stop();
  };

  const opts = { capture: true, passive: true } as const;
  window.addEventListener("wheel", onUserInput, opts);
  window.addEventListener("touchstart", onUserInput, opts);
  window.addEventListener("pointerdown", onUserInput, opts);
  window.addEventListener("keydown", onKeyScroll, { capture: true });

  detachUserListeners = () => {
    window.removeEventListener("wheel", onUserInput, opts);
    window.removeEventListener("touchstart", onUserInput, opts);
    window.removeEventListener("pointerdown", onUserInput, opts);
    window.removeEventListener("keydown", onKeyScroll, { capture: true });
  };

  const step = (now: number) => {
    if (stopped) return;

    const t = Math.min(1, (now - startTime) / durationMs);
    window.scrollTo(0, start + diff * siteEase(t));
    window.dispatchEvent(new Event("scroll"));

    if (t < 1) {
      activeRaf = requestAnimationFrame(step);
    } else {
      activeRaf = 0;
      detachUserListeners?.();
      detachUserListeners = null;
    }
  };

  activeRaf = requestAnimationFrame(step);
}

/**
 * Smooth scroll to a section. Uses Lenis when active (Chrome/Firefox desktop).
 * Falls back to RAF animation on Safari desktop, touch devices, and reduced-motion
 * — Lenis is intentionally disabled there (see useLenis).
 */
export function scrollToId(id: string, durationMs = 1400) {
  const el = document.getElementById(id);
  if (!el) return;

  const target = el.getBoundingClientRect().top + window.scrollY;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    cancelActiveScroll();
    window.scrollTo(0, target);
    return;
  }

  const lenis = getLenis();
  if (lenis) {
    cancelActiveScroll();
    lenis.scrollTo(el, { duration: durationMs / 1000 });
    return;
  }

  animateScrollTo(target, durationMs);
}
