import { motion } from "motion/react";
import { STUDIO } from "../data/sections";

const EASE = [0.16, 1, 0.3, 1] as const;

const ROWS = [
  { label: "Телефон", value: STUDIO.phone, href: STUDIO.phoneHref },
  { label: "Telegram", value: STUDIO.telegramLabel, href: STUDIO.telegram },
  { label: "ВКонтакте", value: STUDIO.vkLabel, href: STUDIO.vk },
];

export default function Contact() {
  return (
    <section id="contact" className="relative bg-ink px-4 pb-8 pt-16 text-paper safe-bottom md:px-10 md:pb-10 md:pt-32">
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
          <div className="grid grid-cols-1 gap-px bg-paper/15 sm:grid-cols-3">
            {ROWS.map((r) => (
              <a
                key={r.label}
                href={r.href}
                target={r.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                data-cursor
                className="group bg-ink p-5 transition-colors active:bg-paper/[0.06] md:hover:bg-paper/[0.04]"
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

        <div className="mt-14 border-t border-paper/15 pt-6 md:mt-20">
          <div className="flex flex-col gap-4 text-paper/50 md:flex-row md:items-center md:justify-between md:gap-3">
            <p className="label text-[0.58rem] leading-relaxed md:text-[0.66rem]">
              © {new Date().getFullYear()} Сергиевская · Художественная мастерская
            </p>
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
        </div>
      </div>
    </section>
  );
}
