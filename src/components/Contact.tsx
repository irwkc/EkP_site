import { motion } from "motion/react";
import { STUDIO } from "../data/sections";

const EASE = [0.16, 1, 0.3, 1] as const;

const ROWS = [
  { label: "Телефон", value: STUDIO.phone, href: STUDIO.phoneHref },
  { label: "Telegram", value: STUDIO.telegramLabel, href: STUDIO.telegram },
  { label: "ВКонтакте", value: STUDIO.vkLabel, href: STUDIO.vk },
];

export default function Contact() {
  const year = new Date().getFullYear();

  return (
    <section
      id="contact"
      className="relative bg-ink px-4 pt-16 text-paper pb-[max(1.5rem,env(safe-area-inset-bottom))] md:px-10 md:pb-10 md:pt-32"
    >
      <div className="mx-auto max-w-[1600px]">
        <p className="label mb-8 text-signal">Свяжитесь с нами</p>

        <motion.a
          href={STUDIO.phoneHref}
          data-cursor
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
          className="group block"
        >
          <h2 className="display text-[clamp(2.75rem,11vw,11rem)] leading-[0.9] transition-colors duration-300 group-hover:text-signal">
            Возьмите
            <br />
            <span className="serif-italic">кисть</span> →
          </h2>
        </motion.a>

        <div className="mt-12 grid gap-8 border-t border-paper/15 pt-10 md:mt-16 md:gap-10 md:pt-12 md:grid-cols-[1.2fr_1fr]">
          <div className="divide-y divide-paper/10 border-y border-paper/15 md:grid md:grid-cols-3 md:gap-px md:divide-y-0 md:border-y-0 md:bg-paper/15">
            {ROWS.map((r) => (
              <a
                key={r.label}
                href={r.href}
                target={r.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                data-cursor
                className="group block py-4 transition-colors active:bg-paper/[0.06] md:bg-ink md:p-5 md:hover:bg-paper/[0.04]"
              >
                <p className="label text-muted">{r.label}</p>
                <p className="mt-3 text-base group-active:text-signal sm:text-lg md:sweep md:group-hover:text-signal">
                  {r.value}
                </p>
              </a>
            ))}
          </div>

          <div className="flex flex-col justify-between gap-8">
            <div>
              <p className="label text-muted">Адрес</p>
              <p className="mt-3 text-lg">
                {STUDIO.city}, {STUDIO.address}
              </p>
              <p className="mt-1 text-paper/60">Мастерская на Соборной</p>
            </div>
            <div>
              <p className="label text-muted">Мастер</p>
              <p className="mt-3 text-lg">{STUDIO.owner}</p>
              <p className="mt-1 text-paper/60">{STUDIO.followers} подписчиков ВКонтакте</p>
            </div>
          </div>
        </div>

        <footer className="mt-12 border-t border-paper/15 pt-8 md:mt-20 md:pt-6">
          <div className="text-center md:hidden">
            <p className="label text-[0.62rem] leading-relaxed text-paper/45">
              © {year} Сергиевская · Художественная мастерская
            </p>
            <p className="label mt-3 text-paper/40">
              Рязань · с 2012 · made by{" "}
              <a
                href="https://github.com/irwkc"
                target="_blank"
                rel="noreferrer"
                data-cursor
                className="text-paper/65 transition-colors active:text-signal"
              >
                irwkc
              </a>
            </p>
          </div>
          <div className="hidden text-paper/50 md:flex md:items-center md:justify-between md:gap-3">
            <p className="label">© {year} Сергиевская · Художественная мастерская</p>
            <p className="label">
              made by{" "}
              <a
                href="https://github.com/irwkc"
                target="_blank"
                rel="noreferrer"
                data-cursor
                className="text-paper/70 transition-colors hover:text-signal"
              >
                irwkc
              </a>
            </p>
            <p className="label">Рязань · с 2012</p>
          </div>
        </footer>
      </div>
    </section>
  );
}
