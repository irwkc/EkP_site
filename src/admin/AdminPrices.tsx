import { useCallback, useEffect, useState } from "react";
import type { PriceGroup } from "../data/contentTypes";
import { adminApi } from "./api";

export default function AdminPrices() {
  const [groups, setGroups] = useState<PriceGroup[]>([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const data = await adminApi.getContent();
    setGroups(structuredClone(data.priceGroups));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setBusy(true);
    setStatus("");
    try {
      await adminApi.savePrices(groups);
      setStatus("Прайс сохранён");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  };

  const updateItem = (
    gi: number,
    ii: number,
    field: "name" | "detail" | "price",
    value: string
  ) => {
    setGroups((prev) => {
      const next = structuredClone(prev);
      next[gi].items[ii] = { ...next[gi].items[ii], [field]: value };
      return next;
    });
  };

  const addItem = (gi: number) => {
    setGroups((prev) => {
      const next = structuredClone(prev);
      next[gi].items.push({ name: "Новая позиция", detail: "", price: "0 ₽" });
      return next;
    });
  };

  const removeItem = (gi: number, ii: number) => {
    setGroups((prev) => {
      const next = structuredClone(prev);
      next[gi].items.splice(ii, 1);
      return next;
    });
  };

  if (!groups.length) return <p className="text-muted">Загрузка…</p>;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="display text-3xl md:text-4xl">Прайс занятий</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Стоимость на странице /prices и в блоке на главной
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={save}
          className="label shrink-0 border border-ink bg-ink px-8 py-3 text-paper transition-colors hover:bg-signal disabled:opacity-50"
        >
          {busy ? "Сохранение…" : "Сохранить прайс"}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {groups.map((group, gi) => (
          <div key={group.id} className="border border-line bg-paper-dim p-5 md:p-6">
            <span className="label text-signal">{group.kicker}</span>
            <h3 className="display mt-1 text-2xl">{group.title}</h3>
            <ul className="mt-4 space-y-3">
              {group.items.map((item, ii) => (
                <li key={ii} className="border border-line bg-paper p-3">
                  <input
                    value={item.name}
                    onChange={(e) => updateItem(gi, ii, "name", e.target.value)}
                    className="w-full border-0 border-b border-line bg-transparent py-1 text-sm font-medium outline-none focus:border-signal"
                    placeholder="Название"
                  />
                  <input
                    value={item.detail ?? ""}
                    onChange={(e) => updateItem(gi, ii, "detail", e.target.value)}
                    className="mt-2 w-full border-0 bg-transparent py-1 text-xs text-muted outline-none"
                    placeholder="Описание"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      value={item.price}
                      onChange={(e) => updateItem(gi, ii, "price", e.target.value)}
                      className="flex-1 border border-line bg-paper-dim px-2 py-1 text-sm tabular-nums text-signal outline-none focus:border-signal"
                      placeholder="Цена"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(gi, ii)}
                      className="label text-signal hover:underline"
                    >
                      Удалить
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => addItem(gi)}
              className="label mt-3 text-muted hover:text-signal"
            >
              + Позиция
            </button>
          </div>
        ))}
      </div>

      {status && <p className="label mt-6 text-muted">{status}</p>}
    </div>
  );
}
