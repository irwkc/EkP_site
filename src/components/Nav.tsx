import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { STUDIO } from "../data/sections";

const LINKS = [
  { href: "#index", label: "Направления", n: "01" },
  { href: "#founder", label: "Об авторе", n: "02" },
  { href: "#exhibition", label: "Работы", n: "03" },
  { href: "#contact", label: "Контакты", n: "04" },
];

export default function Nav() {
  const [solid, setSolid] = useState(false);
  const [dark, setDark] = useState(false);
  const lastY = useRef(0);
  const navY = useSpring(0, { stiffness: 420, damping: 40 });
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const delta = y - lastY.current;
    setSolid(y > 60);
    if (Math.abs(delta) > 4) {
      navY.set(delta > 0 && y > 320 ? -120 : 0);
    }
    lastY.current = y;
  });

  useEffect(() => {
    navY.set(0);
  }, [navY]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const contact = document.getElementById("contact");
        const navH = 80;
        setDark(!!(contact && contact.getBoundingClientRect().top < navH));
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      style={{ y: navY }}
      className={`fixed inset-x-0 top-0 z-[60] ${dark ? "text-paper" : "text-ink"}`}
    >
      <nav
        className={`mx-auto flex max-w-[1600px] items-center justify-between px-5 transition-[padding] duration-500 ease-art md:px-10 ${
          solid ? "py-3" : "py-5"
        }`}
      >
        <a href="#top" className="group flex flex-col leading-none" data-cursor>
          <span className="display text-xl tracking-tight transition-colors group-hover:text-signal md:text-2xl">
            Сергиевская
          </span>
          <span
            className={`label mt-1 text-[0.55rem] transition-colors ${
              dark ? "text-paper/50" : "text-muted"
            }`}
          >
            Мастерская · Рязань
          </span>
        </a>

        <div className="hidden items-center gap-9 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="group flex items-center gap-1.5"
              data-cursor
            >
              <span
                className={`label text-[0.58rem] transition-colors ${
                  dark ? "text-paper/40" : "text-muted"
                } group-hover:text-signal`}
              >
                {l.n}
              </span>
              <span className="sweep text-sm transition-colors group-hover:text-signal">
                {l.label}
              </span>
            </a>
          ))}
        </div>

        <a
          href={STUDIO.phoneHref}
          data-cursor
          className={`group relative hidden overflow-hidden border px-5 py-2.5 sm:block ${
            dark ? "border-paper/40" : "border-ink"
          }`}
        >
          <span className="relative z-10 text-sm transition-colors duration-300 group-hover:text-paper">
            Записаться
          </span>
          <span className="absolute inset-0 -translate-y-full bg-signal transition-transform duration-300 ease-art group-hover:translate-y-0" />
        </a>
      </nav>
      <motion.div
        animate={{ scaleX: solid ? 1 : 0, opacity: dark ? 0.25 : 0.16 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "0% 50%" }}
        className={`h-px w-full ${dark ? "bg-paper" : "bg-ink"}`}
      />
    </motion.header>
  );
}
