import { useEffect } from "react";
import Lenis from "lenis";

let lenisInstance: Lenis | null = null;

function isSafari() {
  const ua = navigator.userAgent;
  return (
    /Safari/i.test(ua) &&
    !/Chrome|Chromium|CriOS|Edg|OPR|Firefox|FxiOS/i.test(ua)
  );
}

export function getLenis() {
  return lenisInstance;
}

export function useLenis(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(hover: none)").matches) return;
    if (isSafari()) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
      syncTouch: true,
    });
    lenisInstance = lenis;

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    lenis.on("scroll", () => {
      window.dispatchEvent(new Event("scroll"));
    });

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisInstance = null;
    };
  }, [enabled]);
}
