import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import Logo from "./Logo";
import { STUDIO } from "../data/sections";
import { scrollToId } from "../utils/scrollTo";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section
      ref={ref}
      data-nav-theme="light"
      className="relative w-full overflow-x-clip"
    >
      <div className="mx-auto flex min-h-[100svh] w-full max-w-[1600px] flex-col justify-between px-4 pb-8 pt-[calc(5.25rem+env(safe-area-inset-top))] md:px-10 md:pb-10 md:pt-28 lg:pt-32">
        {/* top meta — street address stretched across the top edge */}
        <motion.div style={{ opacity: fade }} className="shrink-0">
          <div className="flex w-full flex-wrap items-start justify-between gap-x-3 gap-y-1 sm:gap-x-4">
            <p className="label whitespace-nowrap text-ink-soft">{STUDIO.city}</p>
            <p className="label whitespace-nowrap text-ink-soft">
              {STUDIO.address.split(" · ")[0]}
            </p>
            <p className="label whitespace-nowrap text-signal">№ 2012—26</p>
          </div>
        </motion.div>

        {/* focal — large logo above studio name */}
        <motion.div
          style={{ y }}
          className="flex flex-1 flex-col items-center justify-center gap-6 py-4 md:gap-10 md:py-6 lg:gap-14 lg:py-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
          >
            <Logo className="w-75 text-ink md:w-87 lg:w-[26rem]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
            className="display max-w-5xl text-center text-ink [text-wrap:balance]"
          >
            <p className="label text-ink">Художественная мастерская</p>
            <span className="label text-signal">Сергиевской Екатерины</span>
          </motion.h1>
        </motion.div>

        {/* bottom */}
        <motion.div
          style={{ opacity: fade }}
          className="flex shrink-0 flex-col md:flex-row md:items-end md:justify-end"
        >
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
