import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type PendingConfirm = ConfirmOptions & {
  resolve: (value: boolean) => void;
};

const ConfirmContext = createContext<((options: ConfirmOptions) => Promise<boolean>) | null>(
  null
);

export function AdminConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  const close = (result: boolean) => {
    pending?.resolve(result);
    setPending(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {createPortal(
        <AnimatePresence>
          {pending && (
            <motion.div
              className="admin-app fixed inset-0 z-[200] flex items-center justify-center bg-ink/40 px-4 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => close(false)}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="admin-confirm-title"
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-md border border-line bg-paper p-6 shadow-[0_24px_80px_rgba(20,16,9,0.18)] md:p-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="pointer-events-none absolute -left-2 -top-2 h-full w-full border border-signal/70" />
                <p className="label text-signal">Подтверждение</p>
                <h2
                  id="admin-confirm-title"
                  className="display mt-2 text-[clamp(1.5rem,5vw,2rem)] leading-tight"
                >
                  {pending.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  {pending.message}
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => close(false)}
                    className="label flex-1 border border-line px-4 py-3 text-ink transition-colors hover:border-ink"
                  >
                    {pending.cancelLabel ?? "Отмена"}
                  </button>
                  <button
                    type="button"
                    onClick={() => close(true)}
                    className={`label flex-1 border px-4 py-3 transition-colors ${
                      pending.danger
                        ? "border-signal bg-signal text-paper hover:border-ink hover:bg-ink"
                        : "border-ink bg-ink text-paper hover:border-signal hover:bg-signal"
                    }`}
                  >
                    {pending.confirmLabel ?? "Подтвердить"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </ConfirmContext.Provider>
  );
}

export function useAdminConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useAdminConfirm must be used within AdminConfirmProvider");
  }
  return ctx;
}
