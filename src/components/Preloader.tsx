import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { getLenis } from "../hooks/useLenis";

export default function Preloader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const lenis = getLenis();
    lenis?.stop();
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      setDone(true);
      lenis?.start();
      document.body.style.overflow = "";
    }, 1900);
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
          <div className="overflow-hidden">
            <motion.p
              className="label text-signal"
              initial={{ y: "120%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            >
              Рязань · с 2012
            </motion.p>
          </div>
          <div className="mt-4 overflow-hidden">
            <motion.h1
              className="display text-[clamp(2.5rem,9vw,7rem)]"
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
              Сергиевская
            </motion.h1>
          </div>

          <motion.div
            className="mt-10 h-px bg-paper/40"
            initial={{ width: 0 }}
            animate={{ width: "min(40vw, 320px)" }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
