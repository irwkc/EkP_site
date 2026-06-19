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
    <div className="overflow-hidden border-y border-line bg-ink py-5 text-paper">
      <motion.div
        className="flex w-max gap-10 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 26, ease: "linear", repeat: Infinity }}
      >
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="display text-3xl md:text-5xl">{w}</span>
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
    <div className="overflow-hidden bg-paper py-10">
      <motion.div
        className="flex w-max gap-4"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, ease: "linear", repeat: Infinity }}
      >
        {row.map((src, i) => (
          <div
            key={i}
            className="h-44 w-60 shrink-0 overflow-hidden border border-line md:h-56 md:w-80"
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
