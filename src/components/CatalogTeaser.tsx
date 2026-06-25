import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  PAINTINGS_FOR_SALE,
  PAINTINGS_PATH,
  PRICE_GROUPS,
  PRICES_PATH,
  formatPrice,
} from "../data/catalog";

const EASE = [0.16, 1, 0.3, 1] as const;

const PREVIEW_PAINTINGS = PAINTINGS_FOR_SALE.filter((p) => p.available).slice(0, 3);
const PREVIEW_PRICES = PRICE_GROUPS.slice(0, 2).flatMap((g) =>
  g.items.slice(0, 1).map((item) => ({ group: g.title, ...item }))
);

export default function CatalogTeaser() {
  const minPrice = Math.min(
    ...PAINTINGS_FOR_SALE.filter((p) => p.available).map((p) => p.price)
  );

  return (
    <section
      id="pricelist"
      className="relative border-y border-line bg-paper-dim px-4 py-14 md:px-10 md:py-24"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between md:gap-6">
          <div>
            <p className="label mb-4 text-signal md:mb-5">Прайс лист</p>
            <h2 className="display text-[clamp(2.5rem,10vw,6rem)] leading-[0.92]">
              Картины
              <br />
              <span className="serif-italic">и&nbsp;занятия</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-ink-soft md:max-w-xs md:text-right md:text-base">
            Авторские работы в единственном экземпляре и занятия в мастерской.
          </p>
        </div>

        <div className="grid gap-px border border-line bg-line md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="bg-paper p-5 md:p-8"
          >
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <span className="label text-muted">01</span>
                <h3 className="display mt-2 text-2xl md:text-3xl">В продаже</h3>
              </div>
              <span className="label text-signal">от {formatPrice(minPrice)}</span>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 md:gap-3">
              {PREVIEW_PAINTINGS.map((p) => (
                <div
                  key={p.id}
                  className="catalog-photo aspect-[4/5] overflow-hidden border border-line"
                >
                  <img
                    src={p.image}
                    alt={p.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>

            <p className="mt-5 text-sm text-muted md:mt-6">
              {PAINTINGS_FOR_SALE.filter((p) => p.available).length} работ доступно
              · оригиналы · доставка по РФ
            </p>

            <Link
              to={PAINTINGS_PATH}
              className="group mt-6 inline-flex items-center gap-3 border border-ink px-6 py-3 transition-colors active:border-signal active:bg-signal active:text-paper md:mt-8 md:hover:border-signal md:hover:bg-signal md:hover:text-paper"
            >
              <span className="label">Все картины</span>
              <span className="transition-transform duration-300 group-active:translate-x-1 md:group-hover:translate-x-1">
                →
              </span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
            className="bg-paper p-5 md:p-8"
          >
            <div>
              <span className="label text-muted">02</span>
              <h3 className="display mt-2 text-2xl md:text-3xl">Стоимость</h3>
            </div>

            <ul className="mt-6 divide-y divide-line border-t border-line">
              {PREVIEW_PRICES.map((item) => (
                <li
                  key={item.group + item.name}
                  className="flex items-baseline justify-between gap-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium md:text-base">{item.name}</p>
                    <p className="label mt-1 text-muted">{item.group}</p>
                  </div>
                  <span className="shrink-0 text-sm tabular-nums text-signal md:text-base">
                    {item.price}
                  </span>
                </li>
              ))}
              <li className="flex items-baseline justify-between gap-4 py-4">
                <p className="text-sm text-muted md:text-base">
                  Курс, мастер-классы, заказ
                </p>
                <span className="label text-muted">в прайсе</span>
              </li>
            </ul>

            <Link
              to={PRICES_PATH}
              className="group mt-6 inline-flex items-center gap-3 border border-ink px-6 py-3 transition-colors active:border-signal active:bg-signal active:text-paper md:mt-8 md:hover:border-signal md:hover:bg-signal md:hover:text-paper"
            >
              <span className="label">Полный прайс</span>
              <span className="transition-transform duration-300 group-active:translate-x-1 md:group-hover:translate-x-1">
                →
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
