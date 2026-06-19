import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SECTIONS, STUDIO, type SectionKey } from "../data/sections";
import { getLenis } from "../hooks/useLenis";

const EASE = [0.16, 1, 0.3, 1] as const;
const OPEN_MS = 700;
const CLOSE_MS = 400;

export default function Chapter({
  activeKey,
  onClose,
}: {
  activeKey: SectionKey | null;
  onClose: () => void;
}) {
  const section = activeKey ? SECTIONS.find((s) => s.key === activeKey)! : null;
  const [zoom, setZoom] = useState<string | null>(null);
  const [scrollReady, setScrollReady] = useState(false);
  const scrollYRef = useRef(0);
  const closeTimerRef = useRef(0);

  useEffect(() => {
    if (!activeKey) setZoom(null);
  }, [activeKey]);

  useEffect(() => {
    if (!activeKey) return;

    const lenis = getLenis();
    scrollYRef.current = window.scrollY;
    setScrollReady(false);
    lenis?.stop();

    const root = document.documentElement;
    root.classList.remove("chapter-closing", "chapter-open");
    root.classList.add("chapter-opening");

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollYRef.current}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    const openTimer = window.setTimeout(() => {
      root.classList.remove("chapter-opening");
      root.classList.add("chapter-open");
      setScrollReady(true);
    }, OPEN_MS);

    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(closeTimerRef.current);
      setScrollReady(false);

      root.classList.remove("chapter-opening", "chapter-open");
      root.classList.add("chapter-closing");

      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";

      closeTimerRef.current = window.setTimeout(() => {
        root.classList.remove("chapter-closing");
        window.scrollTo(0, scrollYRef.current);
        lenis?.start();
      }, CLOSE_MS);
    };
  }, [activeKey]);

  useEffect(() => {
    if (!activeKey) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (zoom) setZoom(null);
        else onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeKey, zoom, onClose]);

  return (
    <AnimatePresence>
      {section && (
        <motion.div
          key={section.key}
          className="chapter-panel fixed inset-0 z-[90] flex flex-col bg-paper"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-line bg-paper/85 px-5 py-4 backdrop-blur-md md:px-10">
            <div className="flex items-baseline gap-4">
              <span className="label text-signal">{section.index}</span>
              <h2 className="display text-2xl md:text-4xl">{section.title}</h2>
            </div>
            <button
              data-cursor
              onClick={onClose}
              className="group flex items-center gap-3"
            >
              <span className="label hidden sm:block">Закрыть</span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-ink transition-colors duration-300 group-hover:border-signal group-hover:bg-signal group-hover:text-paper">
                ✕
              </span>
            </button>
          </div>

          <div
            className={`chapter-scroll min-h-0 flex-1 overscroll-contain ${
              zoom ? "overflow-hidden" : "overflow-y-scroll"
            } ${scrollReady && !zoom ? "chapter-scroll--ready" : ""}`}
          >
            <div className="mx-auto max-w-[1600px] px-5 py-12 md:px-10 md:py-16">
              <div className="grid gap-8 md:grid-cols-[1fr_1.2fr] md:gap-16">
                <motion.p
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}
                  className="label text-ink-soft"
                >
                  {section.kicker}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.32 }}
                >
                  <p className="display text-[clamp(1.4rem,3vw,2.4rem)] leading-tight">
                    {section.blurb}
                  </p>
                  <p className="mt-6 text-sm text-muted">{section.meta}</p>
                  <a
                    href={STUDIO.phoneHref}
                    data-cursor
                    className="sweep mt-6 inline-block text-signal"
                  >
                    Записаться на {section.title.toLowerCase()} →
                  </a>
                </motion.div>
              </div>

              <div className="mt-14 columns-2 gap-3 md:columns-3 md:gap-4 lg:columns-4">
                {section.images.map((src, i) => (
                  <motion.button
                    key={src}
                    data-cursor
                    onClick={() => setZoom(src)}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                    transition={{ duration: 0.6, ease: EASE, delay: (i % 4) * 0.05 }}
                    className="mb-3 block w-full overflow-hidden border border-line md:mb-4"
                  >
                    <img
                      src={src}
                      alt={`${section.title} — работа ${i + 1}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full object-cover transition-transform duration-700 hover:scale-[1.04]"
                    />
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {zoom && (
              <motion.div
                className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/92 p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setZoom(null)}
                data-cursor
              >
                <motion.img
                  src={zoom}
                  alt=""
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.92, opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="max-h-[90vh] max-w-[92vw] border-[6px] border-paper object-contain shadow-2xl"
                />
                <button
                  className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full border border-paper/50 text-paper transition-colors hover:border-signal hover:bg-signal"
                  onClick={() => setZoom(null)}
                  data-cursor
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
