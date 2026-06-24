import { useEffect, useRef } from "react";

/**
 * Persistent paint trail — canvas scrolls with the page in document coordinates.
 * Desktop only; sits above page content (z-10), #founder-portrait at z-20.
 */
export default function PaintTrail() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let has = false;
    let lx = 0;
    let ly = 0;

    const ensureSize = () => {
      const nw = document.documentElement.clientWidth;
      const nh = Math.max(
        document.documentElement.scrollHeight,
        window.innerHeight
      );
      if (nw === w && nh === h) return;
      const prev = document.createElement("canvas");
      prev.width = canvas.width || 1;
      prev.height = canvas.height || 1;
      prev.getContext("2d")!.drawImage(canvas, 0, 0);
      canvas.width = nw;
      canvas.height = nh;
      ctx.drawImage(prev, 0, 0);
      w = nw;
      h = nh;
    };

    const isDarkAt = (cx: number, cy: number) => {
      const el = document.elementFromPoint(cx, cy) as HTMLElement | null;
      return !!el && !!el.closest("#exhibition, #contact");
    };

    const dab = (x: number, y: number, dark: boolean) => {
      if (x < 0 || y < 0 || x > w || y > h) return;
      ctx.fillStyle = dark
        ? "rgba(223, 59, 31, 0.09)"
        : "rgba(20, 16, 9, 0.05)";
      ctx.beginPath();
      ctx.ellipse(x, y, 5.5, 4.2, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    const onMove = (e: MouseEvent) => {
      const x = e.clientX + window.scrollX;
      const y = e.clientY + window.scrollY;
      const dark = isDarkAt(e.clientX, e.clientY);

      if (!has) {
        has = true;
        lx = x;
        ly = y;
        dab(x, y, dark);
        return;
      }
      const dx = x - lx;
      const dy = y - ly;
      const dist = Math.hypot(dx, dy);
      if (dist < 0.01) return;

      const step = 5;
      if (dist < step) {
        dab(x, y, dark);
      } else {
        const n = Math.ceil(dist / step);
        for (let i = 1; i <= n; i++) {
          const t = i / n;
          dab(lx + dx * t, ly + dy * t, dark);
        }
      }
      lx = x;
      ly = y;
    };

    const onScroll = () => {
      has = false;
    };

    ensureSize();
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", ensureSize);
    const ro = new ResizeObserver(ensureSize);
    ro.observe(document.body);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", ensureSize);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="paint-trail" aria-hidden />;
}
