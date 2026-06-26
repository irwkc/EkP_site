import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import type { PaintingForSale } from "../data/contentTypes";
import { adminApi } from "./api";

type Draft = {
  title: string;
  medium: string;
  size: string;
  price: string;
  available: boolean;
};

const EMPTY_DRAFT: Draft = {
  title: "",
  medium: "масло, холст",
  size: "",
  price: "",
  available: true,
};

export function AdminAddPaintingModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (painting: PaintingForSale) => void;
}) {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDraft(EMPTY_DRAFT);
    setFile(null);
    setPreview(null);
    setError("");
    setBusy(false);
  }, [open]);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const close = () => {
    if (busy) return;
    onClose();
  };

  const submit = async () => {
    const title = draft.title.trim();
    if (!title) {
      setError("Укажите название работы");
      return;
    }
    if (!file) {
      setError("Загрузите фото картины");
      return;
    }
    const price = Number(draft.price);
    if (!Number.isFinite(price) || price < 0) {
      setError("Укажите корректную цену");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const { url } = await adminApi.upload("kartiny", file);
      onCreated({
        id: `p${Date.now()}`,
        title,
        medium: draft.medium.trim() || "масло, холст",
        size: draft.size.trim() || "—",
        price,
        image: url,
        available: draft.available,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось загрузить фото");
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="admin-app fixed inset-0 z-[200] flex items-center justify-center bg-ink/40 px-4 py-8 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={close}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-add-painting-title"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex max-h-[min(90vh,820px)] w-full max-w-2xl flex-col overflow-hidden border border-line bg-paper shadow-[0_24px_80px_rgba(20,16,9,0.18)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pointer-events-none absolute -left-2 -top-2 h-full w-full border border-signal/70" />

            <div className="shrink-0 border-b border-line px-6 py-5 md:px-8">
              <p className="label text-signal">Новая позиция</p>
              <h2
                id="admin-add-painting-title"
                className="display mt-1 text-[clamp(1.5rem,5vw,2rem)] leading-tight"
              >
                Картина в продажу
              </h2>
              <p className="mt-2 text-sm text-ink-soft">
                Фото загружается один раз при создании. Позже его можно только просмотреть —
                для другого снимка создайте новую позицию.
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 md:px-8">
              <div className="grid gap-6 md:grid-cols-[160px_1fr]">
                <div>
                  <p className="label text-muted">Фото</p>
                  <label
                    className={`mt-2 flex aspect-[4/5] cursor-pointer flex-col items-center justify-center overflow-hidden border border-dashed transition-colors ${
                      preview ? "border-line" : "border-line bg-paper-dim hover:border-ink"
                    }`}
                  >
                    {preview ? (
                      <img src={preview} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="px-3 text-center text-xs text-muted">
                        Нажмите, чтобы выбрать файл
                      </span>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={busy}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        setFile(f ?? null);
                        setError("");
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {file && (
                    <p className="mt-2 truncate text-xs text-muted" title={file.name}>
                      {file.name}
                    </p>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="label text-muted">Название</span>
                    <input
                      value={draft.title}
                      disabled={busy}
                      onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                      placeholder="Например: Утро на Соборной"
                      className="mt-1 w-full border border-line bg-paper-dim px-3 py-2.5 text-sm outline-none focus:border-signal"
                    />
                  </label>
                  <label className="block">
                    <span className="label text-muted">Материал</span>
                    <input
                      value={draft.medium}
                      disabled={busy}
                      onChange={(e) => setDraft((d) => ({ ...d, medium: e.target.value }))}
                      className="mt-1 w-full border border-line bg-paper-dim px-3 py-2.5 text-sm outline-none focus:border-signal"
                    />
                  </label>
                  <label className="block">
                    <span className="label text-muted">Размер</span>
                    <input
                      value={draft.size}
                      disabled={busy}
                      onChange={(e) => setDraft((d) => ({ ...d, size: e.target.value }))}
                      placeholder="40 × 50 см"
                      className="mt-1 w-full border border-line bg-paper-dim px-3 py-2.5 text-sm outline-none focus:border-signal"
                    />
                  </label>
                  <label className="block">
                    <span className="label text-muted">Цена (₽)</span>
                    <input
                      type="number"
                      min={0}
                      value={draft.price}
                      disabled={busy}
                      onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
                      placeholder="25000"
                      className="mt-1 w-full border border-line bg-paper-dim px-3 py-2.5 text-sm tabular-nums outline-none focus:border-signal"
                    />
                  </label>
                  <label className="flex items-center gap-2 self-end">
                    <input
                      type="checkbox"
                      checked={draft.available}
                      disabled={busy}
                      onChange={(e) => setDraft((d) => ({ ...d, available: e.target.checked }))}
                    />
                    <span className="text-sm">Показывать в продаже</span>
                  </label>
                </div>
              </div>

              {error && <p className="mt-4 text-sm text-signal">{error}</p>}
            </div>

            <div className="flex shrink-0 flex-wrap gap-3 border-t border-line px-6 py-4 md:px-8">
              <button
                type="button"
                disabled={busy}
                onClick={close}
                className="label flex-1 border border-line px-4 py-3 text-ink transition-colors hover:border-ink disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void submit()}
                className="label flex-1 border border-ink bg-ink px-4 py-3 text-paper transition-colors hover:border-signal hover:bg-signal disabled:opacity-50"
              >
                {busy ? "Загрузка…" : "Добавить"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
