import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { STUDIO } from "../data/sections";
import { scrollToId } from "../utils/scrollTo";

const EASE = [0.16, 1, 0.3, 1] as const;

function Line({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <span className="hero-line-mask block">
      <motion.span
        className="inline-block"
        initial={{ y: "115%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const [animKey, setAnimKey] = useState(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const txtY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setAnimKey((key) => key + 1);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return (
    <section
      ref={ref}
      data-nav-theme="light"
      className="relative w-full overflow-x-clip"
    >
      <div className="mx-auto flex min-h-[100svh] w-full max-w-[1600px] flex-col justify-between px-4 pb-8 pt-[calc(5.25rem+env(safe-area-inset-top))] md:px-10 md:pb-10 md:pt-28 lg:pt-32">
        {/* top meta — compact on mobile */}
        <motion.div style={{ opacity: fade }} className="shrink-0">
          <div className="flex w-full items-start justify-between gap-3 sm:gap-4">
            <p className="label max-w-[14ch] text-ink-soft sm:max-w-[18ch] md:max-w-[16ch]">
              Авторская мастерская Екатерины Сергиевской
            </p>
            <p className="label shrink-0 text-right text-ink-soft">
              Рязань · {STUDIO.address}
              <br />
              <span className="text-signal">№ 2012—26</span>
            </p>
          </div>
        </motion.div>

        {/* headline — focal point on mobile */}
        <motion.div
          style={{ y: txtY }}
          className="flex flex-1 flex-col justify-center py-4 md:py-6 lg:py-10"
        >
          <motion.h1
            key={animKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="display relative z-10 text-ink"
          >
            <span className="hero-title-line block">
              <Line delay={0.2}>Интерьер,</Line>
            </span>
            <span className="hero-title-line block pl-3 sm:pl-[6vw]">
              <Line delay={0.3}>
                <span className="serif-italic text-signal">как искусство</span>
              </Line>
            </span>
            <span className="hero-title-line block">
              <Line delay={0.4}>
                <span className="outline">и&nbsp;ты</span>
              </Line>
            </span>
          </motion.h1>
        </motion.div>

        {/* bottom */}
        <motion.div
          style={{ opacity: fade }}
          className="flex shrink-0 flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.9 }}
            className="max-w-md text-base leading-relaxed text-ink-soft md:text-lg"
          >
            Живопись с нуля, реставрация мебели и авторские картины — в
            пространстве, где красоте учат каждого.
          </motion.p>

          <motion.a
            href="#index"
            onClick={(e) => {
              e.preventDefault();
              scrollToId("index");
            }}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.9 }}
            className="group flex w-full items-center justify-between gap-4 border-t border-line pt-5 md:w-auto md:justify-start md:border-t-0 md:pt-0"
          >
            <span className="label">Шесть направлений</span>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-ink transition-colors duration-300 active:border-signal active:bg-signal md:group-hover:border-signal md:group-hover:bg-signal">
              <span className="text-lg transition-colors duration-300 active:text-paper md:group-hover:text-paper">
                ↓
              </span>
            </span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
