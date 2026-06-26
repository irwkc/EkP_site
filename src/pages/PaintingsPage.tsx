import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useSiteContent } from "../context/ContentContext";
import { PAINTINGS_PATH, PRICES_PATH, formatPrice } from "../data/catalog";
import { STUDIO } from "../data/sections";
import ChapterPaintPour from "../components/ChapterPaintPour";
import { setScrollIntent } from "../utils/scrollIntent";

const EASE = [0.16, 1, 0.3, 1] as const;
const DEFAULT_TITLE =
  "Сергиевская — Художественная мастерская в Рязани · живопись, реставрация, картины";

export default function PaintingsPage() {
  const [zoom, setZoom] = useState<string | null>(null);

  useEffect(() => {
    document.title = `Картины в продаже — Сергиевская · Художественная мастерская`;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && zoom) setZoom(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom]);

  const { paintingsForSale } = useSiteContent();
  const available = paintingsForSale.filter((p) => p.available);

  return (
    <main className="relative bg-paper">
      <ChapterPaintPour chapterKey={PAINTINGS_PATH} />
      <section className="relative border-b border-line" data-nav-theme="light">
        <div className="relative md:min-h-0">
          <div className="relative z-[1] mx-auto max-w-[1600px] px-4 pb-12 pt-[calc(5.5rem+env(safe-area-inset-top))] md:px-10 md:pb-16 md:pt-32">
            <Link
              to="/"
              state={{ scrollTo: "pricelist" }}
              onClick={() => setScrollIntent("pricelist")}
              className="label inline-flex items-center gap-2 text-muted transition-colors active:text-signal"
            >
              ← На главную
            </Link>

            <div className="mt-8 md:mt-10">
              <span className="label text-signal">Прайс лист · 01</span>
              <h1 className="display mt-3 text-[clamp(2.25rem,9vw,5rem)] leading-[0.92]">
                Картины
                <br />
                <span className="serif-italic">в продаже</span>
              </h1>
              <p className="label mt-4 text-ink-soft">
                Авторские работы · оригиналы · доставка по РФ
              </p>
            </div>

            <p className="display mt-8 max-w-2xl text-[clamp(1.15rem,3.5vw,1.75rem)] leading-tight text-ink md:mt-12">
              Каждая картина — в единственном экземпляре. Картина на заказ: любой
              размер и сюжет, обсудим сроки и стоимость.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-line px-4 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-8 flex flex-col gap-3 md:mb-12 md:flex-row md:items-end md:justify-between">
            <p className="label text-muted">{available.length} доступно</p>
            <Link
              to={PRICES_PATH}
              className="label sweep text-signal"
            >
              Стоимость занятий →
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paintingsForSale.map((p) => (
              <article
                key={p.id}
                className={`flex flex-col border border-line ${p.available ? "" : "opacity-55"}`}
              >
                <button
                  type="button"
                  onClick={() => p.available && setZoom(p.image)}
                  disabled={!p.available}
                  className="catalog-photo relative aspect-[4/5] w-full overflow-hidden disabled:cursor-default"
                >
                  <img
                    src={p.image}
                    alt={p.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 active:scale-105 md:hover:scale-[1.03]"
                  />
                  {!p.available && (
                    <span className="label absolute inset-0 flex items-center justify-center bg-ink/50 text-paper">
                      Продано
                    </span>
                  )}
                </button>
                <div className="flex flex-1 flex-col gap-2 p-4 md:p-5">
                  <h2 className="display text-xl leading-tight md:text-2xl">{p.title}</h2>
                  <p className="text-sm text-muted">
                    {p.medium} · {p.size}
                  </p>
                  <div className="mt-auto flex items-baseline justify-between gap-3 pt-3">
                    <span className="display text-lg text-signal tabular-nums md:text-xl">
                      {formatPrice(p.price)}
                    </span>
                    {p.available && (
                      <a href={STUDIO.phoneHref} className="label sweep text-signal">
                        Узнать →
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="section-cta"
        data-nav-theme="dark"
        className="border-t border-line bg-ink px-4 pt-8 text-paper md:px-10 md:pt-16 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] md:pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))]"
      >
        <div className="mx-auto flex max-w-[1600px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between md:items-end">
          <div>
            <p className="label text-[0.58rem] text-signal">Запись</p>
            <h2 className="display mt-2 text-[clamp(1.65rem,6.5vw,3.5rem)] leading-[0.95] md:mt-3">
              Заинтересовала работа?
            </h2>
          </div>
          <a
            href={STUDIO.phoneHref}
            className="label inline-flex shrink-0 items-center justify-center border border-paper/30 px-8 py-3.5 transition-colors active:border-signal active:bg-signal md:px-10 md:py-4"
          >
            Связаться
          </a>
        </div>
      </section>

      <AnimatePresence>
        {zoom && (
          <motion.div
            className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/92 p-4 safe-top safe-bottom md:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setZoom(null)}
          >
            <motion.img
              src={zoom}
              alt=""
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="max-h-[85dvh] max-w-[94vw] border-4 border-paper object-contain shadow-2xl md:max-h-[90vh] md:max-w-[92vw] md:border-[6px]"
            />
            <button
              type="button"
              aria-label="Закрыть просмотр"
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-paper/50 text-paper active:border-signal active:bg-signal md:right-6 md:top-6 md:h-12 md:w-12"
              onClick={() => setZoom(null)}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
