import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useScroll, useTransform } from "motion/react";
import { FOUNDER } from "../data/sections";

const EASE = [0.16, 1, 0.3, 1] as const;

type PortraitRect = { top: number; left: number; width: number };

export default function Founder() {
  const sectionRef = useRef<HTMLElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const [mainEl, setMainEl] = useState<HTMLElement | null>(null);
  const [rect, setRect] = useState<PortraitRect | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);

  useLayoutEffect(() => {
    setMainEl(document.querySelector("main"));
  }, []);

  useLayoutEffect(() => {
    const slot = slotRef.current;
    const main = mainEl;
    if (!slot || !main) return;

    const update = () => {
      const sr = slot.getBoundingClientRect();
      const mr = main.getBoundingClientRect();
      setRect({
        top: sr.top - mr.top,
        left: sr.left - mr.left,
        width: sr.width,
      });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(slot);
    ro.observe(main);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [mainEl]);

  const portrait = (
    <div
      id="founder-portrait"
      className="pointer-events-none absolute z-20 mx-auto w-full max-w-sm md:max-w-none"
      style={
        rect
          ? { top: rect.top, left: rect.left, width: rect.width }
          : { visibility: "hidden" }
      }
    >
      <div className="absolute -left-3 -top-3 z-0 h-full w-full border border-signal" />
      <div className="relative z-10 overflow-hidden border-[6px] border-paper shadow-2xl">
        <motion.img
          src={FOUNDER.photo}
          alt={FOUNDER.name}
          style={{ y: imgY }}
          className="aspect-[4/5] w-full scale-110 object-cover"
        />
      </div>
      <p className="serif-italic absolute -bottom-5 right-2 z-20 text-3xl text-signal md:text-4xl">
        {FOUNDER.signature}
      </p>
    </div>
  );

  return (
    <>
      <section
        id="founder"
        data-nav-theme="light"
        ref={sectionRef}
        className="relative z-0 border-y border-line bg-paper-dim px-4 py-16 md:px-10 md:py-36"
      >
        <div className="mx-auto grid max-w-[1600px] items-center gap-12 md:grid-cols-[0.85fr_1.15fr] md:gap-20">
          {/* layout slot — portrait is portaled above the paint layer */}
          <div
            ref={slotRef}
            className="pointer-events-none mx-auto w-full max-w-sm pb-8 md:max-w-none"
            aria-hidden
          >
            <div className="aspect-[4/5] w-full" />
          </div>

          <div>
            <p className="label mb-6 text-signal">Основатель</p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: EASE }}
              className="display text-[clamp(1.6rem,5vw,3.4rem)] leading-tight md:text-[clamp(1.8rem,3.6vw,3.4rem)]"
            >
              «{FOUNDER.lead}»
            </motion.h2>

            <p className="mt-6 text-lg text-ink">{FOUNDER.name}</p>
            <p className="label mt-1 text-muted">{FOUNDER.role}</p>

            <div className="mt-8 max-w-xl space-y-4 text-ink-soft">
              {FOUNDER.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-x-10 gap-y-6 border-t border-line pt-8">
              {FOUNDER.stats.map((s) => (
                <div key={s.label} className="min-w-[5.5rem]">
                  <p className="display text-3xl md:text-5xl">{s.value}</p>
                  <p className="label mt-2 text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {mainEl && createPortal(portrait, mainEl)}
    </>
  );
}
