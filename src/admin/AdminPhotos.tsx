import { useCallback, useEffect, useState } from "react";
import type { SiteContent } from "../data/contentTypes";
import type { SectionKey } from "../data/sections";
import { adminApi } from "./api";

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "zhivopis", label: "Живопись" },
  { key: "kurs", label: "Курс" },
  { key: "masterskaya", label: "Мастерская" },
  { key: "mebel", label: "Мебель" },
  { key: "kartiny", label: "Картины" },
  { key: "masterclass", label: "Мастер-классы" },
];

type Tab = SectionKey | "exhibition" | "strip";

function Status({ msg, error }: { msg: string; error?: boolean }) {
  if (!msg) return null;
  return (
    <p className={`label mt-4 ${error ? "text-signal" : "text-muted"}`}>{msg}</p>
  );
}

export default function AdminPhotos() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [tab, setTab] = useState<Tab>("zhivopis");
  const [status, setStatus] = useState("");
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const data = await adminApi.getContent();
    setContent(data);
  }, []);

  useEffect(() => {
    load().catch(() => {
      setStatus("Не удалось загрузить данные");
      setErr(true);
    });
  }, [load]);

  const flash = (msg: string, isErr = false) => {
    setStatus(msg);
    setErr(isErr);
    setTimeout(() => setStatus(""), 3000);
  };

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      await load();
      flash("Сохранено");
    } catch (e) {
      flash(e instanceof Error ? e.message : "Ошибка", true);
    } finally {
      setBusy(false);
    }
  };

  if (!content) {
    return <p className="text-muted">Загрузка…</p>;
  }

  const sectionKey = SECTIONS.some((s) => s.key === tab) ? (tab as SectionKey) : null;
  const images = sectionKey ? content.gallery[sectionKey] : [];

  const moveImage = (index: number, dir: -1 | 1) => {
    if (!sectionKey) return;
    const next = [...images];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    run(() => adminApi.saveGallery(sectionKey, next));
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="display text-3xl md:text-4xl">Фото на сайте</h2>
        <p className="mt-2 max-w-xl text-sm text-ink-soft">
          Замена, загрузка и порядок фото по разделам. Фото основателя не
          редактируется.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setTab(s.key)}
            className={`label border px-4 py-2 transition-colors ${
              tab === s.key
                ? "border-ink bg-ink text-paper"
                : "border-line text-muted hover:border-ink"
            }`}
          >
            {s.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setTab("exhibition")}
          className={`label border px-4 py-2 transition-colors ${
            tab === "exhibition"
              ? "border-ink bg-ink text-paper"
              : "border-line text-muted hover:border-ink"
          }`}
        >
          Избранное
        </button>
        <button
          type="button"
          onClick={() => setTab("strip")}
          className={`label border px-4 py-2 transition-colors ${
            tab === "strip"
              ? "border-ink bg-ink text-paper"
              : "border-line text-muted hover:border-ink"
          }`}
        >
          Лента
        </button>
      </div>

      {sectionKey && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((src, i) => (
              <div key={src} className="group border border-line bg-paper-dim">
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-wrap gap-1 border-t border-line p-2">
                  <label className="label flex-1 cursor-pointer border border-line px-2 py-1.5 text-center text-[0.55rem] hover:border-signal hover:text-signal">
                    Заменить
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={busy}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        run(() => adminApi.replace(sectionKey, src, f));
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    disabled={busy || i === 0}
                    onClick={() => moveImage(i, -1)}
                    className="label border border-line px-2 py-1.5 text-[0.55rem] disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={busy || i === images.length - 1}
                    onClick={() => moveImage(i, 1)}
                    className="label border border-line px-2 py-1.5 text-[0.55rem] disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      if (!confirm("Удалить фото с сайта?")) return;
                      run(() => adminApi.deleteImage(sectionKey, src));
                    }}
                    className="label border border-line px-2 py-1.5 text-[0.55rem] text-signal hover:border-signal"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <label className="label mt-6 inline-flex cursor-pointer items-center gap-3 border border-dashed border-line px-6 py-4 transition-colors hover:border-signal hover:text-signal">
            + Загрузить фото
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                run(() => adminApi.upload(sectionKey, f));
                e.target.value = "";
              }}
            />
          </label>
        </>
      )}

      {tab === "exhibition" && (
        <div className="space-y-6">
          {content.exhibitionPicks.map((pick, i) => (
            <div
              key={i}
              className="grid gap-4 border border-line p-4 md:grid-cols-[120px_1fr]"
            >
              <div className="aspect-[4/5] overflow-hidden border border-line">
                <img src={pick.src} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="space-y-3">
                <label className="block">
                  <span className="label text-muted">Подпись</span>
                  <input
                    value={pick.cap}
                    onChange={(e) => {
                      const picks = [...content.exhibitionPicks];
                      picks[i] = { ...pick, cap: e.target.value };
                      setContent({ ...content, exhibitionPicks: picks });
                    }}
                    className="mt-1 w-full border border-line bg-paper-dim px-3 py-2 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="label text-muted">Фото (путь)</span>
                  <select
                    value={pick.src}
                    onChange={(e) => {
                      const picks = [...content.exhibitionPicks];
                      picks[i] = { ...pick, src: e.target.value };
                      setContent({ ...content, exhibitionPicks: picks });
                    }}
                    className="mt-1 w-full border border-line bg-paper-dim px-3 py-2 text-sm"
                  >
                    {Object.values(content.gallery)
                      .flat()
                      .filter((v, idx, a) => a.indexOf(v) === idx)
                      .map((src) => (
                        <option key={src} value={src}>
                          {src}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
            </div>
          ))}
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => adminApi.saveExhibition(content.exhibitionPicks))}
            className="label border border-ink bg-ink px-6 py-3 text-paper hover:bg-signal"
          >
            Сохранить избранное
          </button>
        </div>
      )}

      {tab === "strip" && (
        <div>
          <p className="mb-4 text-sm text-muted">
            Фото в бегущей ленте на главной ({content.photoStrip.length} шт.)
          </p>
          <div className="flex flex-wrap gap-2">
            {content.photoStrip.map((src, i) => (
              <div key={src + i} className="relative h-20 w-16 overflow-hidden border border-line">
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  className="absolute right-0 top-0 bg-ink/70 px-1 text-[10px] text-paper"
                  onClick={() => {
                    const strip = content.photoStrip.filter((_, j) => j !== i);
                    setContent({ ...content, photoStrip: strip });
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <label className="label mt-4 block">
            Добавить из галереи
            <select
              className="mt-1 w-full max-w-md border border-line bg-paper-dim px-3 py-2 text-sm"
              defaultValue=""
              onChange={(e) => {
                const v = e.target.value;
                if (!v || content.photoStrip.includes(v)) return;
                setContent({ ...content, photoStrip: [...content.photoStrip, v] });
                e.target.value = "";
              }}
            >
              <option value="">— выбрать —</option>
              {Object.values(content.gallery)
                .flat()
                .filter((v, idx, a) => a.indexOf(v) === idx)
                .map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
            </select>
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => adminApi.savePhotoStrip(content.photoStrip))}
            className="label mt-4 border border-ink bg-ink px-6 py-3 text-paper hover:bg-signal"
          >
            Сохранить ленту
          </button>
        </div>
      )}

      <Status msg={status} error={err} />
    </div>
  );
}
