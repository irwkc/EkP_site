import { useCallback, useEffect, useState } from "react";
import type { PaintingForSale } from "../data/contentTypes";
import { AdminAddPaintingModal } from "./AdminAddPaintingModal";
import { adminApi } from "./api";
import { useAdminConfirm } from "./AdminConfirm";

export default function AdminPaintings() {
  const confirm = useAdminConfirm();
  const [items, setItems] = useState<PaintingForSale[] | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const data = await adminApi.getContent();
    setItems(structuredClone(data.paintingsForSale));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!items) return;
    setBusy(true);
    setStatus("");
    try {
      await adminApi.savePaintings(items);
      setStatus("Сохранено");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  };

  const update = (i: number, patch: Partial<PaintingForSale>) => {
    setItems((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      next[i] = { ...next[i], ...patch };
      return next;
    });
  };

  const remove = async (i: number) => {
    if (!items) return;
    const p = items[i];
    const ok = await confirm({
      title: "Удалить позицию?",
      message: `«${p.title}» исчезнет со страницы продажи. Файл в галерее останется.`,
      confirmLabel: "Удалить",
      cancelLabel: "Отмена",
      danger: true,
    });
    if (!ok) return;
    setItems((prev) => prev?.filter((_, j) => j !== i) ?? prev);
  };

  if (!items) return <p className="text-muted">Загрузка…</p>;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="display text-3xl md:text-4xl">Картины в продаже</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Страница /paintings и блок на главной · {items.length}{" "}
            {items.length === 1 ? "позиция" : items.length < 5 ? "позиции" : "позиций"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="label border border-line px-5 py-3 transition-colors hover:border-ink"
          >
            + Добавить
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void save()}
            className="label border border-ink bg-ink px-6 py-3 text-paper transition-colors hover:border-signal hover:bg-signal disabled:opacity-50"
          >
            {busy ? "Сохранение…" : "Сохранить"}
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-line bg-paper-dim px-6 py-12 text-center">
          <p className="text-sm text-ink-soft">Пока нет картин в продаже.</p>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="label mt-4 border border-ink bg-ink px-5 py-2.5 text-paper transition-colors hover:border-signal hover:bg-signal"
          >
            Добавить первую
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((p, i) => (
            <div
              key={p.id}
              className="grid gap-4 border border-line bg-paper-dim p-4 md:grid-cols-[120px_1fr]"
            >
              <div className="aspect-[4/5] overflow-hidden border border-line">
                {p.image ? (
                  <img src={p.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center px-2 text-center text-xs text-muted">
                    Нет фото
                  </div>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="label text-muted">Название</span>
                  <input
                    value={p.title}
                    disabled={busy}
                    onChange={(e) => update(i, { title: e.target.value })}
                    className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-signal"
                  />
                </label>
                <label className="block">
                  <span className="label text-muted">Материал</span>
                  <input
                    value={p.medium}
                    disabled={busy}
                    onChange={(e) => update(i, { medium: e.target.value })}
                    className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-signal"
                  />
                </label>
                <label className="block">
                  <span className="label text-muted">Размер</span>
                  <input
                    value={p.size}
                    disabled={busy}
                    onChange={(e) => update(i, { size: e.target.value })}
                    className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-signal"
                  />
                </label>
                <label className="block">
                  <span className="label text-muted">Цена (₽)</span>
                  <input
                    type="number"
                    min={0}
                    value={p.price}
                    disabled={busy}
                    onChange={(e) => update(i, { price: Number(e.target.value) })}
                    className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm tabular-nums outline-none focus:border-signal"
                  />
                </label>
                <label className="flex items-center gap-2 self-end">
                  <input
                    type="checkbox"
                    checked={p.available}
                    disabled={busy}
                    onChange={(e) => update(i, { available: e.target.checked })}
                  />
                  <span className="text-sm">В продаже</span>
                </label>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void remove(i)}
                  className="label self-end text-signal sm:col-span-2 hover:underline disabled:opacity-50"
                >
                  Удалить из списка
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {status && <p className="label mt-6 text-muted">{status}</p>}

      <AdminAddPaintingModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={(painting) => {
          setItems((prev) => (prev ? [...prev, painting] : [painting]));
          setStatus("Позиция добавлена — не забудьте сохранить");
        }}
      />
    </div>
  );
}
