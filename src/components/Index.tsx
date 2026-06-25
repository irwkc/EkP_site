import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import type { Section } from "../data/sections";
import { getSectionPath } from "../data/sections";
import { useSections } from "../hooks/useSections";
import { resetScrollPosition } from "../utils/scrollTo";

const EASE = [0.16, 1, 0.3, 1] as const;
const HYSTERESIS = 40;

function navHeight() {
  const header = document.querySelector("header");
  return header?.getBoundingClientRect().height ?? 80;
}

function stickyTop() {
  return navHeight() + 24;
}

function scrollAnchorY(mobilePreviewBottom: number, desktop: boolean) {
  if (desktop) {
    const top = stickyTop();
    return top + (window.innerHeight - top) * 0.38;
  }
  return mobilePreviewBottom + Math.max(72, (window.innerHeight - mobilePreviewBottom) * 0.38);
}

function IndexPreview({ section, compact }: { section: Section; compact?: boolean }) {
  const src = section.images[0];

  return (
    <motion.div
      key={section.key}
      initial={{ opacity: 0, y: compact ? 6 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: compact ? -4 : -8 }}
      transition={{ duration: 0.38, ease: EASE }}
      className="index-preview-card catalog-photo relative overflow-hidden border border-line bg-paper shadow-[0_24px_70px_rgba(20,16,9,0.1)]"
    >
      <span
        className="pointer-events-none absolute -left-2 -top-2 z-0 hidden h-[calc(100%+1rem)] w-[calc(100%+1rem)] border border-signal/35 md:block"
        aria-hidden
      />
      <div className="relative z-10 overflow-hidden bg-paper-dim">
        <div className="relative aspect-[16/10] w-full overflow-hidden md:aspect-[5/3]">
          {src ? (
            <img src={src} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-paper-dim" />
          )}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent"
            aria-hidden
          />
        </div>
        <div className={`border-t border-line bg-paper ${compact ? "px-4 py-3" : "px-5 py-4 md:px-6 md:py-5"}`}>
          <span className="label text-signal">{section.index}</span>
          <p
            className={`display mt-1 leading-tight text-ink ${
              compact ? "text-xl" : "text-2xl md:text-3xl"
            }`}
          >
            {section.title}
          </p>
          <p className="label mt-1 text-muted">{section.kicker}</p>
          <p className="mt-2 hidden text-sm leading-relaxed text-ink-soft md:block">
            {section.meta}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ProgressRail({ sections, active }: { sections: Section[]; active: number }) {
  return (
    <div className="mt-5 flex items-center gap-2 md:mt-6" aria-hidden>
      {sections.map((s, i) => (
        <span
          key={s.key}
          className="index-progress-bar h-px flex-1 origin-left bg-line"
          style={{
            transform: i === active ? "scaleX(1)" : "scaleX(0.35)",
            background: i === active ? "var(--color-signal)" : undefined,
            opacity: i === active ? 1 : 0.4,
            transition: "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s, background 0.35s",
          }}
        />
      ))}
    </div>
  );
}

export default function Index() {
  const sections = useSections();
  const [active, setActive] = useState(0);
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches
  );

  const pickerRef = useRef<HTMLDivElement>(null);
  const mobilePreviewRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const activeRef = useRef(0);
  const activeDistRef = useRef(0);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let raf = 0;

    const tick = () => {
      const desktop = window.matchMedia("(min-width: 768px)").matches;
      const previewBottom =
        mobilePreviewRef.current?.getBoundingClientRect().bottom ?? navHeight() + 220;
      const anchor = scrollAnchorY(previewBottom, desktop);

      let best = activeRef.current;
      let bestDist = Infinity;

      sections.forEach((_, i) => {
        const el = rowRefs.current[i];
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        const dist = Math.abs(mid - anchor);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });

      if (best !== activeRef.current) {
        const shouldSwitch =
          activeDistRef.current === 0 ||
          bestDist + HYSTERESIS < activeDistRef.current;
        if (shouldSwitch) {
          activeRef.current = best;
          activeDistRef.current = bestDist;
          setActive(best);
        }
      } else {
        activeDistRef.current = bestDist;
      }

      sections.forEach((_, i) => {
        const row = rowRefs.current[i];
        if (!row) return;
        const rect = row.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        const dist = Math.abs(mid - anchor);
        const falloff = window.innerHeight * (desktop ? 0.28 : 0.32);
        const t = Math.min(1, dist / falloff);
        const on = i === activeRef.current;
        const emphasis = on ? 1 : 1 - t;

        const title = row.querySelector<HTMLElement>("[data-picker-title]");
        const num = row.querySelector<HTMLElement>("[data-picker-index]");
        const arrow = row.querySelector<HTMLElement>("[data-picker-arrow]");

        if (title) {
          title.style.opacity = String(desktop ? 0.35 + emphasis * 0.65 : on ? 1 : 0.42);
          title.style.transform = desktop ? `translateX(${emphasis * 8}px)` : "none";
          title.style.color = on ? "var(--color-ink)" : "var(--color-ink-soft)";
        }
        if (num) {
          num.style.color = on ? "var(--color-signal)" : "var(--color-muted)";
          num.style.opacity = String(on ? 1 : 0.55);
        }
        if (arrow) {
          arrow.style.opacity = String(on ? 0.85 : 0.25);
        }
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [sections]);

  const activeSection = sections[active];

  const pickerRows = (rowClass: string) =>
    sections.map((s, i) => (
      <li key={s.key} className="index-picker-item border-b border-line last:border-b-0">
        <Link
          ref={(el) => {
            rowRefs.current[i] = el;
          }}
          to={getSectionPath(s.key)}
          onClick={resetScrollPosition}
          data-cursor
          className={`index-picker-row flex cursor-pointer items-center justify-between gap-4 outline-none ${rowClass}`}
        >
          <div className="flex min-w-0 items-baseline gap-3 md:gap-8 lg:gap-10">
            <span data-picker-index className="label w-7 shrink-0 md:w-9">
              {s.index}
            </span>
            <span
              data-picker-title
              className="display leading-[0.95] text-[clamp(1.25rem,5vw,1.65rem)] md:text-[clamp(1.75rem,3.2vw,3.25rem)]"
            >
              {s.title}
            </span>
          </div>
          <span data-picker-arrow className="shrink-0 text-signal" aria-hidden>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-5 w-5 md:h-6 md:w-6"
            >
              <path d="M7 17L17 7M17 7H8M17 7V16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </Link>
      </li>
    ));

  return (
    <section id="index" className="relative bg-paper px-4 py-14 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between md:gap-8">
          <div>
            <p className="label mb-4 text-signal md:mb-5">Указатель · 6 разделов</p>
            <h2 className="display text-[clamp(2.75rem,11vw,7rem)] leading-[0.92]">
              Шесть
              <br />
              <span className="serif-italic">направлений</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-ink-soft md:max-w-xs md:text-right md:text-base">
            Листайте список — превью сменится по мере прокрутки. Нажмите, чтобы
            перейти к работам.
          </p>
        </div>

        <div ref={pickerRef} className="index-picker-stage border-t border-line">
          {!isDesktop ? (
            <>
              <div
                ref={mobilePreviewRef}
                className="index-mobile-preview sticky z-20 -mx-4 border-b border-line bg-paper px-4 pb-4 pt-3"
                style={{ top: stickyTop() }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {activeSection && (
                    <IndexPreview key={activeSection.key} section={activeSection} compact />
                  )}
                </AnimatePresence>
                <ProgressRail sections={sections} active={active} />
              </div>
              <ul className="index-picker-list">{pickerRows("py-5")}</ul>
            </>
          ) : (
            <div className="grid grid-cols-12 gap-10 lg:gap-14">
              <div className="index-preview-col col-span-5 lg:col-span-5">
                <div className="index-preview-pin" style={{ top: stickyTop() }}>
                  <AnimatePresence mode="wait" initial={false}>
                    {activeSection && <IndexPreview key={activeSection.key} section={activeSection} />}
                  </AnimatePresence>
                  <ProgressRail sections={sections} active={active} />
                  <p className="label mt-4 text-muted">
                    {String(active + 1).padStart(2, "0")} / {String(sections.length).padStart(2, "0")}
                  </p>
                </div>
              </div>
              <div className="index-picker-track col-span-7 lg:col-span-7">
                <ul className="index-picker-list pb-8">{pickerRows("py-12 lg:py-14")}</ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
