import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { STUDIO } from "../data/sections";

const EASE = [0.16, 1, 0.3, 1] as const;

function Line({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <span className="reveal-mask">
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
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const txtY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] w-full flex-col justify-between overflow-hidden pb-8 pt-28 md:pb-10 md:pt-32"
    >
      {/* top meta row */}
      <motion.div
        style={{ opacity: fade }}
        className="mx-auto flex w-full max-w-[1600px] items-start justify-between px-5 md:px-10"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="label max-w-[16ch] text-ink-soft"
        >
          Авторская мастерская Екатерины Сергиевской
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="label text-right text-ink-soft"
        >
          Рязань · {STUDIO.address}
          <br />
          <span className="text-signal">№ 2012—26</span>
        </motion.p>
      </motion.div>

      {/* headline block */}
      <motion.div
        style={{ y: txtY }}
        className="relative mx-auto w-full max-w-[1600px] px-5 md:px-10"
      >
        <h1 className="display relative z-10 text-ink">
          <span className="block text-[clamp(2.9rem,13vw,12.5rem)]">
            <Line delay={0.25}>Холст,</Line>
          </span>
          <span className="block pl-[6vw] text-[clamp(2.9rem,13vw,12.5rem)]">
            <Line delay={0.36}>
              <span className="serif-italic text-signal">краски</span>
            </Line>
          </span>
          <span className="block text-[clamp(2.9rem,13vw,12.5rem)]">
            <Line delay={0.47}>
              <span className="outline">и&nbsp;ты</span>
            </Line>
          </span>
        </h1>
      </motion.div>

      {/* bottom row */}
      <motion.div
        style={{ opacity: fade }}
        className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-5 md:flex-row md:items-end md:justify-between md:px-10"
      >
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.9 }}
          className="max-w-sm text-base leading-relaxed text-ink-soft md:text-lg"
        >
          Живопись с нуля, реставрация мебели и авторские картины —
          в пространстве, где красоте учат каждого.
        </motion.p>

        <motion.a
          href="#index"
          data-cursor
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.9 }}
          className="group flex items-center gap-4"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-ink transition-colors duration-300 group-hover:border-signal group-hover:bg-signal">
            <span className="text-xl transition-colors duration-300 group-hover:text-paper">
              ↓
            </span>
          </span>
          <span className="label">Шесть направлений</span>
        </motion.a>
      </motion.div>
    </section>
  );
}
