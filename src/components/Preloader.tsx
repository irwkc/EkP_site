import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Logo from "./Logo";
import { getLenis } from "../hooks/useLenis";

export default function Preloader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const lenis = getLenis();
    lenis?.stop();
    document.body.style.overflow = "hidden";
    const isTouch = window.matchMedia("(hover: none)").matches;
    const delay = isTouch ? 1500 : 2600;
    const t = setTimeout(() => {
      setDone(true);
      lenis?.start();
      document.body.style.overflow = "";
    }, delay);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink text-paper"
          initial={{ opacity: 1 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <Logo className="w-56 text-paper md:w-72 lg:w-96" />
          </motion.div>

          <div className="mt-6 overflow-hidden md:mt-8">
            <motion.p
              className="display text-[clamp(1.4rem,4vw,2.2rem)] text-paper/85 md:text-[clamp(1.6rem,3.2vw,2.8rem)]"
              initial={{ y: "120%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            >
              Творческая Мастерская
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
