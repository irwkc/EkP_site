import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import gallery from "../data/gallery.json";

const EASE = [0.16, 1, 0.3, 1] as const;

// Curated wall — mixed works across the studio.
const PICKS: { src: string; cap: string; span: string }[] = [
  { src: gallery.kartiny[5], cap: "Авторская картина", span: "md:col-span-5 md:row-span-2" },
  { src: gallery.zhivopis[3], cap: "Живопись с нуля", span: "md:col-span-3" },
  { src: gallery.mebel[2], cap: "Реставрация комода", span: "md:col-span-4 md:row-span-2" },
  { src: gallery.masterclass[7], cap: "Вечер с красками", span: "md:col-span-3" },
  { src: gallery.kartiny[14], cap: "Натюрморт", span: "md:col-span-4" },
  { src: gallery.masterskaya[6], cap: "В мастерской", span: "md:col-span-4" },
  { src: gallery.kurs[4], cap: "Курс декора", span: "md:col-span-4" },
];

export default function Exhibition() {
  const [zoom, setZoom] = useState<string | null>(null);

  return (
    <section id="exhibition" className="relative bg-ink px-5 py-24 text-paper md:px-10 md:py-36">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="display text-[clamp(2.4rem,8vw,7rem)]">
            Избранное
          </h2>
          <p className="max-w-xs text-paper/60 md:text-right">
            Фрагмент живого собрания мастерской — картины, мебель и работы
            учеников. Нажмите, чтобы рассмотреть.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:auto-rows-[200px] md:grid-cols-12 md:gap-4">
          {PICKS.map((p, i) => (
            <motion.button
              key={p.src + i}
              data-cursor
              onClick={() => setZoom(p.src)}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -12% 0px" }}
              transition={{ duration: 0.7, ease: EASE, delay: (i % 3) * 0.08 }}
              className={`group relative overflow-hidden border border-paper/15 ${p.span}`}
            >
              <img
                src={p.src}
                alt={p.cap}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-[900ms] ease-art group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="label absolute bottom-3 left-3 translate-y-2 text-paper opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                {p.cap}
              </span>
            </motion.button>
          ))}
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
    </section>
  );
}
