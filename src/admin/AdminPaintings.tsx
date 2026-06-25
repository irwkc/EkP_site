import { useCallback, useEffect, useState } from "react";
import type { PaintingForSale } from "../data/contentTypes";
import { adminApi } from "./api";

export default function AdminPaintings() {
  const [items, setItems] = useState<PaintingForSale[]>([]);
  const [allImages, setAllImages] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const data = await adminApi.getContent();
    setItems(structuredClone(data.paintingsForSale));
    setAllImages(data.gallery.kartiny);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setBusy(true);
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
      const next = [...prev];
      next[i] = { ...next[i], ...patch };
      return next;
    });
  };

  const add = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `p${Date.now()}`,
        title: "Новая работа",
        medium: "масло, холст",
        size: "40 × 50 см",
        price: 0,
        image: allImages[0] ?? "",
        available: true,
      },
    ]);
  };

  if (!items.length && !allImages.length) return <p className="text-muted">Загрузка…</p>;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="display text-3xl md:text-4xl">Картины в продаже</h2>
          <p className="mt-2 text-sm text-ink-soft">Страница /paintings и блок на главной</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={add}
            className="label border border-line px-5 py-3 hover:border-ink"
          >
            + Добавить
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={save}
            className="label border border-ink bg-ink px-6 py-3 text-paper hover:bg-signal disabled:opacity-50"
          >
            Сохранить
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((p, i) => (
          <div
            key={p.id}
            className="grid gap-4 border border-line bg-paper-dim p-4 md:grid-cols-[100px_1fr]"
          >
            <div className="aspect-[4/5] overflow-hidden border border-line">
              {p.image ? (
                <img src={p.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted">
                  Нет фото
                </div>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="label text-muted">Название</span>
                <input
                  value={p.title}
                  onChange={(e) => update(i, { title: e.target.value })}
                  className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="label text-muted">Материал</span>
                <input
                  value={p.medium}
                  onChange={(e) => update(i, { medium: e.target.value })}
                  className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="label text-muted">Размер</span>
                <input
                  value={p.size}
                  onChange={(e) => update(i, { size: e.target.value })}
                  className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="label text-muted">Цена (₽)</span>
                <input
                  type="number"
                  value={p.price}
                  onChange={(e) => update(i, { price: Number(e.target.value) })}
                  className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm tabular-nums"
                />
              </label>
              <label className="block">
                <span className="label text-muted">Фото</span>
                <select
                  value={p.image}
                  onChange={(e) => update(i, { image: e.target.value })}
                  className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm"
                >
                  {allImages.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 self-end">
                <input
                  type="checkbox"
                  checked={p.available}
                  onChange={(e) => update(i, { available: e.target.checked })}
                />
                <span className="text-sm">В продаже</span>
              </label>
              <button
                type="button"
                onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))}
                className="label self-end text-signal sm:col-span-2"
              >
                Удалить из списка
              </button>
            </div>
          </div>
        ))}
      </div>

      {status && <p className="label mt-6 text-muted">{status}</p>}
    </div>
  );
}
