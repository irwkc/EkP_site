import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import type { Section } from "../data/sections";
import { getSectionPath } from "../data/sections";
import { useSections } from "../hooks/useSections";
import { resetScrollPosition } from "../utils/scrollTo";

const EASE = [0.16, 1, 0.3, 1] as const;
const LERP = 0.11;
const HYSTERESIS = 48;

function pickerCenterY() {
  const header = document.querySelector("header");
  const navH = header?.getBoundingClientRect().height ?? 80;
  return navH + (window.innerHeight - navH) / 2;
}

function PickerPreview({ section }: { section: Section }) {
  const src = section.images[0];
  if (!src) return null;

  return (
    <motion.div
      key={section.key}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.55, ease: EASE }}
      className="catalog-photo mx-auto w-full max-w-xl overflow-hidden border border-line bg-paper shadow-[0_20px_60px_rgba(20,16,9,0.12)]"
    >
      <img src={src} alt="" className="aspect-[16/10] w-full object-cover md:aspect-[2/1]" />
      <div className="border-t border-line bg-paper px-4 py-3 md:px-5 md:py-4">
        <span className="label text-signal">{section.index}</span>
        <p className="display mt-1 text-xl leading-tight text-ink md:text-2xl">
          {section.title}
        </p>
        <p className="label mt-1 text-muted">{section.kicker}</p>
      </div>
    </motion.div>
  );
}

export default function Index() {
  const sections = useSections();
  const [active, setActive] = useState(0);
  const [pickerInView, setPickerInView] = useState(false);

  const pickerRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeRef = useRef(0);
  const smoothRef = useRef({
    scales: sections.map((_, i) => (i === 0 ? 1 : 0.88)),
    opacities: sections.map((_, i) => (i === 0 ? 1 : 0.35)),
  });

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    smoothRef.current.scales = sections.map((_, i) => (i === activeRef.current ? 1 : 0.88));
    smoothRef.current.opacities = sections.map((_, i) => (i === activeRef.current ? 1 : 0.35));
  }, [sections.length]);

  useEffect(() => {
    const root = pickerRef.current;
    if (!root) return;

    const io = new IntersectionObserver(
      ([entry]) => setPickerInView(entry.isIntersecting),
      { threshold: 0.12 }
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    let raf = 0;

    const tick = () => {
      const center = pickerCenterY();
      const slot = slotRef.current;
      if (slot) slot.style.top = `${center}px`;

      const falloff = window.innerHeight * 0.38;
      let best = activeRef.current;
      let bestDist = Infinity;
      let activeDist = Infinity;

      const targets = sections.map((_, i) => {
        const el = rowRefs.current[i];
        if (!el) return { scale: 0.88, opacity: 0.35, dist: Infinity };

        const rect = el.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        const dist = Math.abs(mid - center);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
        if (i === activeRef.current) activeDist = dist;

        const t = Math.min(1, dist / falloff);
        return {
          scale: 1 - t * 0.13,
          opacity: 1 - t * 0.62,
          dist,
        };
      });

      if (best !== activeRef.current && bestDist + HYSTERESIS < activeDist) {
        activeRef.current = best;
        setActive(best);
      }

      const smooth = smoothRef.current;
      targets.forEach((target, i) => {
        smooth.scales[i] += (target.scale - smooth.scales[i]) * LERP;
        smooth.opacities[i] += (target.opacity - smooth.opacities[i]) * LERP;

        const row = rowRefs.current[i];
        if (!row) return;
        const s = smooth.scales[i];
        const o = smooth.opacities[i];
        row.style.transform = `scale(${s})`;
        row.style.opacity = String(o);
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [sections]);

  const activeSection = sections[active];

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
            Листайте — в центре раскроется направление с превью. Нажмите, чтобы
            открыть страницу с работами.
          </p>
        </div>

        <div ref={pickerRef} className="relative">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-paper to-transparent md:h-32"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-paper to-transparent md:h-32"
            aria-hidden
          />

          {pickerInView && activeSection && (
            <div
              ref={slotRef}
              className="pointer-events-none fixed inset-x-0 z-20 px-4 md:px-10"
              style={{ transform: "translateY(-50%)" }}
            >
              <AnimatePresence mode="wait">
                <PickerPreview section={activeSection} />
              </AnimatePresence>
            </div>
          )}

          <ul className="index-picker-list relative z-30 border-t border-line py-[32vh] md:py-[36vh]">
            {sections.map((s, i) => {
              const isActive = i === active;

              return (
                <li key={s.key} className="index-picker-item border-b border-line">
                  <Link
                    to={getSectionPath(s.key)}
                    onClick={resetScrollPosition}
                    data-cursor
                    className="block w-full py-[7vh] md:py-[8vh]"
                  >
                    <div
                      ref={(el) => {
                        rowRefs.current[i] = el;
                      }}
                      className="flex origin-left items-center justify-between gap-4 will-change-transform"
                      style={{ transformOrigin: "left center" }}
                    >
                      <div className="flex min-w-0 items-baseline gap-3 md:gap-10">
                        <span
                          className={`label w-7 shrink-0 md:w-8 ${
                            isActive ? "text-signal" : "text-muted"
                          }`}
                        >
                          {s.index}
                        </span>
                        <span
                          className={`display leading-[0.95] ${
                            isActive
                              ? "text-[clamp(1.75rem,7.5vw,4.25rem)] text-transparent"
                              : "text-[clamp(1.35rem,5.5vw,2.75rem)] text-ink"
                          }`}
                        >
                          {s.title}
                        </span>
                      </div>
                      <span
                        className={`shrink-0 transition-opacity duration-300 ${
                          isActive ? "opacity-0" : "text-lg text-signal/60 md:text-2xl"
                        }`}
                      >
                        ↗
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
