import { useEffect } from "react";
import { Link } from "react-router-dom";
import { PAINTINGS_PATH, PRICE_GROUPS, PRICES_PATH } from "../data/catalog";
import { STUDIO } from "../data/sections";
import ChapterPaintPour from "../components/ChapterPaintPour";
import { setScrollIntent } from "../utils/scrollIntent";

const DEFAULT_TITLE =
  "Сергиевская — Художественная мастерская в Рязани · живопись, реставрация, картины";

export default function PricesPage() {
  useEffect(() => {
    document.title = `Стоимость занятий — Сергиевская · Художественная мастерская`;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, []);

  return (
    <main className="relative bg-paper">
      <ChapterPaintPour chapterKey={PRICES_PATH} />
      <section className="relative border-b border-line">
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
              <span className="label text-signal">Прайс лист · 02</span>
              <h1 className="display mt-3 text-[clamp(2.25rem,9vw,5rem)] leading-[0.92]">
                Стоимость
                <br />
                <span className="serif-italic">занятий</span>
              </h1>
              <p className="label mt-4 text-ink-soft">
                Живопись · мастер-классы · курс · дополнительно
              </p>
            </div>

            <p className="display mt-8 max-w-2xl text-[clamp(1.15rem,3.5vw,1.75rem)] leading-tight text-ink md:mt-12">
              Все материалы включены, группы до шести человек. Точная стоимость
              выездных форматов и индивидуальных программ — по запросу.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-paper-dim px-4 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-8 flex flex-col gap-3 md:mb-12 md:flex-row md:items-end md:justify-between">
            <p className="label text-muted">Актуальный прайс</p>
            <Link to={PAINTINGS_PATH} className="label sweep text-signal">
              Картины в продаже →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {PRICE_GROUPS.map((group) => (
              <div key={group.id} className="border border-line bg-paper p-5 md:p-7">
                <span className="label text-signal">{group.kicker}</span>
                <h2 className="display mt-2 text-2xl md:text-3xl">{group.title}</h2>
                <ul className="mt-5 divide-y divide-line border-t border-line">
                  {group.items.map((item) => (
                    <li
                      key={item.name}
                      className="flex items-start justify-between gap-4 py-4"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium md:text-base">{item.name}</p>
                        {item.detail && (
                          <p className="mt-1 text-xs text-muted md:text-sm">
                            {item.detail}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-right text-sm tabular-nums text-signal md:text-base">
                        {item.price}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="section-cta"
        className="border-t border-line bg-ink px-4 pt-8 text-paper md:px-10 md:pt-16 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] md:pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))]"
      >
        <div className="mx-auto flex max-w-[1600px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between md:items-end">
          <div>
            <p className="label text-[0.58rem] text-signal">Запись</p>
            <h2 className="display mt-2 text-[clamp(1.65rem,6.5vw,3.5rem)] leading-[0.95] md:mt-3">
              Записаться на занятие
            </h2>
          </div>
          <a
            href={STUDIO.phoneHref}
            className="label inline-flex shrink-0 items-center justify-center border border-paper/30 px-8 py-3.5 transition-colors active:border-signal active:bg-signal md:px-10 md:py-4"
          >
            Записаться
          </a>
        </div>
      </section>
    </main>
  );
}
