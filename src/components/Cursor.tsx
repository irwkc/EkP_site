import { useEffect, useRef } from "react";

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;

    const move = (e: MouseEvent) => {
      const el = dot.current;
      if (!el) return;
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;

      const t = e.target as HTMLElement;
      const interactive = !!t.closest("a,button,[data-cursor]");
      const dark = !!t.closest("#exhibition,#contact");
      el.dataset.active = interactive ? "1" : "0";
      el.dataset.dark = dark ? "1" : "0";
    };

    const hide = () => {
      if (dot.current) dot.current.style.opacity = "0";
    };
    const show = () => {
      if (dot.current) dot.current.style.opacity = "";
    };

    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseleave", hide);
    document.addEventListener("mouseenter", show);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", hide);
      document.removeEventListener("mouseenter", show);
    };
  }, []);

  return <div ref={dot} className="cur" data-active="0" data-dark="0" />;
}
