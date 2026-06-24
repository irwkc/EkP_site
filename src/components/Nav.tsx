import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { getLenis } from "../hooks/useLenis";
import { STUDIO } from "../data/sections";
import MobileMenu from "./MobileMenu";

const LINKS = [
  { href: "/#index", label: "Направления", n: "01" },
  { href: "/#founder", label: "Об авторе", n: "02" },
  { href: "/#exhibition", label: "Работы", n: "03" },
  { href: "/#contact", label: "Контакты", n: "04" },
];

type MenuPhase = "closed" | "drawing" | "open" | "closing";

export default function Nav() {
  const [solid, setSolid] = useState(false);
  const [dark, setDark] = useState(false);
  const [menuPhase, setMenuPhase] = useState<MenuPhase>("closed");
  const menuOpenRef = useRef(false);
  const lastY = useRef(0);
  const navY = useSpring(0, { stiffness: 420, damping: 40 });
  const { scrollY } = useScroll();

  const menuOpen = menuPhase !== "closed";

  useMotionValueEvent(scrollY, "change", (y) => {
    const delta = y - lastY.current;
    setSolid(y > 48);
    if (Math.abs(delta) > 4 && !menuOpenRef.current) {
      const isTouch = window.matchMedia("(hover: none)").matches;
      const threshold = isTouch ? 64 : 320;
      navY.set(delta > 0 && y > threshold ? -110 : 0);
    }
    lastY.current = y;
  });

  useEffect(() => {
    menuOpenRef.current = menuPhase === "drawing" || menuPhase === "open";
    if (menuOpenRef.current) navY.set(0);
  }, [menuPhase, navY]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const contact = document.getElementById("contact");
        const sectionCta = document.getElementById("section-cta");
        const navH = 72;
        setDark(
          !!(
            (contact && contact.getBoundingClientRect().top < navH) ||
            (sectionCta && sectionCta.getBoundingClientRect().top < navH)
          )
        );
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const locked = menuPhase !== "closed";
    if (!locked) return;

    const scrollY = window.scrollY;
    const lenis = getLenis();
    lenis?.stop();

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    const preventTouch = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest("[data-mobile-menu]")) return;
      e.preventDefault();
    };
    document.addEventListener("touchmove", preventTouch, { passive: false });

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
      lenis?.start();
      document.removeEventListener("touchmove", preventTouch);
    };
  }, [menuPhase]);

  const openMenu = () => setMenuPhase("drawing");
  const requestClose = () => {
    if (menuPhase === "closing" || menuPhase === "closed") return;
    setMenuPhase("closing");
  };
  const onMenuClosed = useCallback(() => setMenuPhase("closed"), []);
  const onDrawComplete = useCallback(() => setMenuPhase("open"), []);

  const toggleMenu = () => {
    if (menuPhase === "closed") openMenu();
    else requestClose();
  };

  const closeAndNavigate = () => requestClose();

  return (
    <>
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: menuOpen ? 0 : 1 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1], delay: menuOpen ? 0 : 0.2 }}
        style={{ y: menuOpen ? 0 : navY }}
        className={`fixed inset-x-0 top-0 z-[90] bg-transparent safe-top ${
          menuOpen
            ? "text-paper max-md:pointer-events-none max-md:invisible"
            : dark
              ? "text-paper"
              : "text-ink"
        }`}
      >
        <nav
          className={`mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 md:px-10 ${
            solid ? "py-3" : "py-4 md:py-5"
          }`}
        >
          <Link
            to="/"
            className="group min-w-0 flex flex-col leading-none"
            onClick={closeAndNavigate}
          >
            <span className="display truncate text-xl tracking-tight transition-colors group-hover:text-signal md:text-2xl">
              Сергиевская
            </span>
            <span
              className={`label mt-1 text-[0.55rem] transition-colors ${
                menuOpen || dark ? "text-paper/50" : "text-muted"
              }`}
            >
              Мастерская · Рязань
            </span>
          </Link>

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

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <a
              href={STUDIO.phoneHref}
              data-cursor
              className={`group relative hidden overflow-hidden border px-4 py-2 sm:block md:px-5 md:py-2.5 ${
                dark ? "border-paper/40" : "border-ink"
              }`}
            >
              <span className="relative z-10 text-sm transition-colors duration-300 group-hover:text-paper">
                Записаться
              </span>
              <span className="absolute inset-0 -translate-y-full bg-signal transition-transform duration-300 ease-art group-hover:translate-y-0" />
            </a>

            <button
              type="button"
              aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={menuOpen}
              onClick={toggleMenu}
              className={`relative flex h-11 w-11 items-center justify-center rounded-full border transition-colors md:hidden ${
                menuOpen
                  ? "border-paper/40 text-paper"
                  : dark
                    ? "border-paper/30 text-paper"
                    : "border-ink/25 text-ink"
              }`}
            >
              <span
                className={`absolute block h-px w-5 transition-all duration-300 ${
                  menuOpen ? "rotate-45 bg-current" : "-translate-y-[5px] bg-current"
                }`}
              />
              <span
                className={`block h-px w-5 bg-current transition-all duration-300 ${
                  menuOpen ? "scale-x-0 opacity-0" : ""
                }`}
              />
              <span
                className={`absolute block h-px w-5 transition-all duration-300 ${
                  menuOpen ? "-rotate-45 bg-current" : "translate-y-[5px] bg-current"
                }`}
              />
            </button>
          </div>
        </nav>

        <motion.div
          animate={{ scaleX: solid ? 1 : 0, opacity: dark ? 0.25 : 0.16 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: "0% 50%" }}
          className={`hidden h-px w-full md:block ${dark ? "bg-paper" : "bg-ink"}`}
        />
      </motion.header>

      {menuPhase !== "closed" && (
        <MobileMenu
          phase={menuPhase === "closing" ? "closing" : menuPhase === "open" ? "open" : "drawing"}
          links={LINKS}
          onClose={requestClose}
          onClosed={onMenuClosed}
          onDrawComplete={onDrawComplete}
        />
      )}
    </>
  );
}
