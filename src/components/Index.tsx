import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Section } from "../data/sections";
import { getSectionPath } from "../data/sections";
import { useSections } from "../hooks/useSections";
import { resetScrollPosition } from "../utils/scrollTo";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const LERP = 0.1;
const HOVER_BOOST = 2.8;

function navHeight() {
  const header = document.querySelector("header");
  return header?.getBoundingClientRect().height ?? 80;
}

function pickerCenterY() {
  const nav = navHeight();
  return nav + (window.innerHeight - nav) / 2;
}

function stickyOffset() {
  return navHeight() + 28;
}

function gaussianWeight(dist: number, sigma: number) {
  return Math.exp(-(dist * dist) / (2 * sigma * sigma));
}

function blendMeta(sections: Section[], weights: number[]) {
  const top = weights.indexOf(Math.max(...weights));
  const second = weights.reduce(
    (best, w, i) => (i !== top && w > weights[best] ? i : best),
    top
  );
  const t = weights[second] / (weights[top] + weights[second] + 0.0001);
  return { primary: top, secondary: second, mix: 1 - t };
}

type PreviewProps = {
  sections: Section[];
  imageRefs: React.MutableRefObject<(HTMLImageElement | null)[]>;
  titleARef: React.Ref<HTMLSpanElement>;
  titleBRef: React.Ref<HTMLSpanElement>;
  kickerARef: React.Ref<HTMLParagraphElement>;
  kickerBRef: React.Ref<HTMLParagraphElement>;
  indexRef: React.Ref<HTMLSpanElement>;
  metaRef?: React.Ref<HTMLParagraphElement>;
  compact?: boolean;
};

function IndexPreview({
  sections,
  imageRefs,
  titleARef,
  titleBRef,
  kickerARef,
  kickerBRef,
  indexRef,
  metaRef,
  compact,
}: PreviewProps) {
  return (
    <div className="index-preview-card catalog-photo relative overflow-hidden border border-line bg-paper shadow-[0_24px_70px_rgba(20,16,9,0.1)]">
      <span
        className="pointer-events-none absolute -left-2 -top-2 z-0 hidden h-[calc(100%+1rem)] w-[calc(100%+1rem)] border border-signal/35 md:block"
        aria-hidden
      />
      <div className="relative z-10 overflow-hidden bg-paper-dim">
        <div className="relative aspect-[16/10] w-full md:aspect-[5/3]">
          {sections.map((s, i) => {
            const src = s.images[0];
            if (!src) return null;
            return (
              <img
                key={s.key}
                ref={(el) => {
                  imageRefs.current[i] = el;
                }}
                src={src}
                alt=""
                className="absolute inset-0 h-full w-full object-cover will-change-[opacity,transform]"
                style={{ opacity: i === 0 ? 1 : 0 }}
              />
            );
          })}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent"
            aria-hidden
          />
        </div>
        <div className={`border-t border-line bg-paper ${compact ? "px-4 py-3" : "px-5 py-4 md:px-6 md:py-5"}`}>
          <span ref={indexRef} className="label text-signal">
            {sections[0]?.index}
          </span>
          <div className="relative mt-1 min-h-[2.6rem] md:min-h-[3rem]">
            <span
              ref={titleARef}
              className={`display absolute inset-x-0 top-0 leading-tight text-ink ${
                compact ? "text-xl" : "text-2xl md:text-3xl"
              }`}
            >
              {sections[0]?.title}
            </span>
            <span
              ref={titleBRef}
              className={`display absolute inset-x-0 top-0 leading-tight text-ink ${
                compact ? "text-xl" : "text-2xl md:text-3xl"
              }`}
              style={{ opacity: 0 }}
            >
              {sections[1]?.title ?? sections[0]?.title}
            </span>
          </div>
          <div className="relative mt-1 min-h-[1rem]">
            <p ref={kickerARef} className="label text-muted">
              {sections[0]?.kicker}
            </p>
            <p ref={kickerBRef} className="label absolute inset-x-0 top-0 text-muted" style={{ opacity: 0 }}>
              {sections[1]?.kicker ?? sections[0]?.kicker}
            </p>
          </div>
          <p ref={metaRef} className="mt-2 hidden text-sm leading-relaxed text-ink-soft md:block">
            {sections[0]?.meta}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProgressRail({
  sections,
  active,
  barRefs,
}: {
  sections: Section[];
  active: number;
  barRefs: React.MutableRefObject<(HTMLSpanElement | null)[]>;
}) {
  return (
    <div className="mt-5 flex items-center gap-2 md:mt-6" aria-hidden>
      {sections.map((s, i) => (
        <span
          key={s.key}
          ref={(el) => {
            barRefs.current[i] = el;
          }}
          className="index-progress-bar h-px flex-1 origin-left bg-line"
          style={{
            transform: i === active ? "scaleX(1)" : "scaleX(0.35)",
            background: i === active ? "var(--color-signal)" : undefined,
            opacity: i === active ? 1 : 0.45,
            transition: `transform 0.45s ${EASE}, opacity 0.35s ${EASE}, background 0.35s ${EASE}`,
          }}
        />
      ))}
    </div>
  );
}

export default function Index() {
  const sections = useSections();
  const [active, setActive] = useState(0);
  const [pickerInView, setPickerInView] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const pickerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const arrowRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const mobileImageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const titleARef = useRef<HTMLSpanElement>(null);
  const titleBRef = useRef<HTMLSpanElement>(null);
  const kickerARef = useRef<HTMLParagraphElement>(null);
  const kickerBRef = useRef<HTMLParagraphElement>(null);
  const indexRef = useRef<HTMLSpanElement>(null);
  const metaRef = useRef<HTMLParagraphElement>(null);
  const mTitleARef = useRef<HTMLSpanElement>(null);
  const mTitleBRef = useRef<HTMLSpanElement>(null);
  const mKickerARef = useRef<HTMLParagraphElement>(null);
  const mKickerBRef = useRef<HTMLParagraphElement>(null);
  const mIndexRef = useRef<HTMLSpanElement>(null);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const weightsRef = useRef<number[]>(sections.map((_, i) => (i === 0 ? 1 : 0)));
  const activeRef = useRef(0);
  const hoverRef = useRef<number | null>(null);
  const reducedRef = useRef(false);
  const metaPairRef = useRef({ primary: 0, secondary: 1 });

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
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    const root = pickerRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      ([entry]) => setPickerInView(entry.isIntersecting),
      { threshold: 0.08 }
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    weightsRef.current = sections.map((_, i) => (i === activeRef.current ? 1 : 0));
  }, [sections.length]);

  const applyMeta = (
    pair: { primary: number; secondary: number; mix: number },
    imgs: (HTMLImageElement | null)[],
    titleA: HTMLSpanElement | null,
    titleB: HTMLSpanElement | null,
    kickerA: HTMLParagraphElement | null,
    kickerB: HTMLParagraphElement | null,
    indexEl: HTMLSpanElement | null,
    metaEl: HTMLParagraphElement | null | undefined
  ) => {
    const { primary, secondary, mix } = pair;
    if (indexEl) indexEl.textContent = sections[primary]?.index ?? "";
    if (metaEl) metaEl.textContent = sections[primary]?.meta ?? "";
    if (titleA) {
      titleA.textContent = sections[primary]?.title ?? "";
      titleA.style.opacity = String(mix);
    }
    if (titleB) {
      titleB.textContent = sections[secondary]?.title ?? "";
      titleB.style.opacity = String(1 - mix);
    }
    if (kickerA) {
      kickerA.textContent = sections[primary]?.kicker ?? "";
      kickerA.style.opacity = String(mix);
    }
    if (kickerB) {
      kickerB.textContent = sections[secondary]?.kicker ?? "";
      kickerB.style.opacity = String(1 - mix);
    }
    imgs.forEach((img, i) => {
      if (!img) return;
      const w = weightsRef.current[i] ?? 0;
      img.style.opacity = String(w);
      img.style.transform = `scale(${1 + w * 0.04})`;
    });
  };

  useEffect(() => {
    let raf = 0;

    const tick = () => {
      const desktop = window.matchMedia("(min-width: 768px)").matches;
      const center = desktop ? pickerCenterY() : pickerCenterY();
      const sigma = window.innerHeight * (desktop ? 0.2 : 0.26);
      const lerp = reducedRef.current ? 1 : LERP;

      if (!desktop && slotRef.current) {
        slotRef.current.style.top = `${center}px`;
      }
      if (desktop && stickyRef.current) {
        stickyRef.current.style.top = `${stickyOffset()}px`;
      }

      const raw = sections.map((_, i) => {
        const el = rowRefs.current[i];
        if (!el) return 0;
        const rect = el.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        let w = gaussianWeight(Math.abs(mid - center), sigma);
        if (hoverRef.current === i) w *= HOVER_BOOST;
        return w;
      });

      const sum = raw.reduce((a, b) => a + b, 0) || 1;
      const targets = raw.map((w) => w / sum);

      const weights = weightsRef.current.map((w, i) => w + (targets[i] - w) * lerp);
      const wSum = weights.reduce((a, b) => a + b, 0) || 1;
      const normalized = weights.map((w) => w / wSum);
      weightsRef.current = normalized;

      const nextActive = normalized.indexOf(Math.max(...normalized));
      if (nextActive !== activeRef.current) {
        activeRef.current = nextActive;
        setActive(nextActive);
      }

      const pair = blendMeta(sections, normalized);
      if (pair.primary !== metaPairRef.current.primary || pair.secondary !== metaPairRef.current.secondary) {
        metaPairRef.current = { primary: pair.primary, secondary: pair.secondary };
      }

      applyMeta(
        pair,
        imageRefs.current,
        titleARef.current,
        titleBRef.current,
        kickerARef.current,
        kickerBRef.current,
        indexRef.current,
        metaRef.current
      );
      applyMeta(
        pair,
        mobileImageRefs.current,
        mTitleARef.current,
        mTitleBRef.current,
        mKickerARef.current,
        mKickerBRef.current,
        mIndexRef.current,
        null
      );

      sections.forEach((_, i) => {
        const row = rowRefs.current[i];
        const arrow = arrowRefs.current[i];
        const w = normalized[i];
        const emphasis = Math.min(1, w * 2.2);

        if (row) {
          const title = row.querySelector<HTMLElement>("[data-picker-title]");
          const num = row.querySelector<HTMLElement>("[data-picker-index]");
          if (title) {
            if (desktop) {
              title.style.opacity = String(0.38 + emphasis * 0.62);
              title.style.transform = `translateX(${emphasis * 10}px)`;
            } else {
              title.style.opacity = String(Math.max(0.12, 0.65 - emphasis * 0.5));
              title.style.transform = `translateX(${emphasis * 4}px)`;
            }
            title.style.color =
              emphasis > 0.55 ? "var(--color-ink)" : "var(--color-ink-soft)";
          }
          if (num) {
            num.style.color =
              emphasis > 0.55 ? "var(--color-signal)" : "var(--color-muted)";
            num.style.opacity = String(0.5 + emphasis * 0.5);
          }
        }
        if (arrow) {
          arrow.style.opacity = String(0.15 + emphasis * 0.55);
          arrow.style.transform = `translate(${emphasis * 3}px, ${-emphasis * 3}px)`;
        }
        const bar = barRefs.current[i];
        if (bar) {
          const on = i === nextActive;
          bar.style.transform = `scaleX(${on ? 1 : 0.35})`;
          bar.style.opacity = String(on ? 1 : 0.35 + w * 0.25);
          bar.style.background = on ? "var(--color-signal)" : "rgba(20, 16, 9, 0.16)";
        }
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [sections]);

  const previewProps = {
    sections,
    imageRefs,
    titleARef,
    titleBRef,
    kickerARef,
    kickerBRef,
    indexRef,
    metaRef,
  };

  const mobilePreviewProps = {
    sections,
    imageRefs: mobileImageRefs,
    titleARef: mTitleARef,
    titleBRef: mTitleBRef,
    kickerARef: mKickerARef,
    kickerBRef: mKickerBRef,
    indexRef: mIndexRef,
    compact: true,
  };

  return (
    <section id="index" className="relative bg-paper px-4 py-14 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-10 flex flex-col gap-4 md:mb-16 md:flex-row md:items-end md:justify-between md:gap-8">
          <div>
            <p className="label mb-4 text-signal md:mb-5">Указатель · 6 разделов</p>
            <h2 className="display text-[clamp(2.75rem,11vw,7rem)] leading-[0.92]">
              Шесть
              <br />
              <span className="serif-italic">направлений</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-ink-soft md:max-w-xs md:text-right md:text-base">
            Пролистайте список — превью плавно сменится в центре. Нажмите на
            направление, чтобы открыть работы.
          </p>
        </div>

        <div ref={pickerRef} className="index-picker-stage relative border-t border-line">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-paper via-paper/80 to-transparent md:h-28"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-paper via-paper/80 to-transparent md:h-28"
            aria-hidden
          />

          <div
            className="index-picker-rail pointer-events-none absolute left-4 z-[15] hidden w-px bg-signal/25 md:left-10 md:block"
            style={{ top: "12%", bottom: "12%" }}
            aria-hidden
          />

          {!isDesktop && pickerInView && (
            <div
              ref={slotRef}
              className="index-picker-slot pointer-events-none fixed inset-x-0 z-20 px-4"
              style={{ transform: "translateY(-50%)" }}
            >
              <IndexPreview {...mobilePreviewProps} />
            </div>
          )}

          <div className="relative z-20 grid md:grid-cols-12 md:gap-10 lg:gap-14">
            <div className="hidden md:col-span-5 md:block lg:col-span-5">
              <div ref={stickyRef} className="index-preview-sticky">
                <IndexPreview {...previewProps} />
                <ProgressRail sections={sections} active={active} barRefs={barRefs} />
                <p className="label mt-4 text-muted">
                  {String(active + 1).padStart(2, "0")} / {String(sections.length).padStart(2, "0")}
                </p>
              </div>
            </div>

            <div
              ref={trackRef}
              className="index-picker-track md:col-span-7 lg:col-span-7"
            >
              <ul className={`index-picker-list ${isDesktop ? "md:py-6" : "py-[30vh] md:py-6"}`}>
                {sections.map((s, i) => (
                  <li key={s.key} className="index-picker-item border-b border-line last:border-b-0">
                    <Link
                      ref={(el) => {
                        rowRefs.current[i] = el;
                      }}
                      to={getSectionPath(s.key)}
                      onClick={resetScrollPosition}
                      onMouseEnter={() => {
                        hoverRef.current = i;
                      }}
                      onMouseLeave={() => {
                        hoverRef.current = null;
                      }}
                      onFocus={() => {
                        hoverRef.current = i;
                      }}
                      onBlur={() => {
                        hoverRef.current = null;
                      }}
                      data-cursor
                      className="group index-picker-row flex w-full cursor-pointer items-center justify-between gap-4 py-[6.5vh] outline-none md:py-10 lg:py-12"
                    >
                      <div className="flex min-w-0 items-baseline gap-3 md:gap-8 lg:gap-10">
                        <span
                          data-picker-index
                          className="label w-7 shrink-0 transition-colors duration-300 md:w-9"
                        >
                          {s.index}
                        </span>
                        <span
                          data-picker-title
                          className="display text-[clamp(1.4rem,5.2vw,3.25rem)] leading-[0.95] will-change-transform"
                        >
                          {s.title}
                        </span>
                      </div>
                      <span
                        ref={(el) => {
                          arrowRefs.current[i] = el;
                        }}
                        className="index-picker-arrow shrink-0 text-lg text-signal will-change-transform md:text-2xl"
                        aria-hidden
                      >
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
                ))}
              </ul>

              {!isDesktop && (
                <ProgressRail sections={sections} active={active} barRefs={barRefs} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
