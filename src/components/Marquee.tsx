import { motion } from "motion/react";

const WORDS = [
  "Живопись",
  "Реставрация",
  "Декор",
  "Картины",
  "Мастер-классы",
  "Редизайн мебели",
];

export default function Marquee() {
  const row = [...WORDS, ...WORDS];
  return (
    <div className="overflow-hidden border-y border-line bg-ink py-4 text-paper md:py-5">
      <motion.div
        className="flex w-max gap-8 whitespace-nowrap md:gap-10"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 26, ease: "linear", repeat: Infinity }}
      >
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="display text-[clamp(1.5rem,7vw,3rem)] md:text-5xl">{w}</span>
            <span className="text-signal">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export function PhotoStrip({ images }: { images: string[] }) {
  const row = [...images, ...images];
  return (
    <div className="overflow-hidden bg-paper py-8 md:py-10">
      <motion.div
        className="flex w-max gap-4"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, ease: "linear", repeat: Infinity }}
      >
        {row.map((src, i) => (
          <div
            key={i}
            className="h-36 w-48 shrink-0 overflow-hidden border border-line sm:h-44 sm:w-60 md:h-56 md:w-80"
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
