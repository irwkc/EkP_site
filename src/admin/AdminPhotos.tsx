import { useCallback, useEffect, useState } from "react";
import type { SiteContent } from "../data/contentTypes";
import type { SectionKey } from "../data/sections";
import { adminApi } from "./api";
import { useAdminConfirm } from "./AdminConfirm";
import {
  AdminUploadBar,
  defaultExhibitionPick,
  EXHIBITION_SIZE_OPTIONS,
  GalleryPicker,
} from "./AdminGalleryPicker";

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

function PreviewThumb({
  src,
  active,
  busy,
  onSelect,
}: {
  src: string;
  active: boolean;
  busy: boolean;
  onSelect: () => void;
}) {
  return (
    <div className="admin-preview-stage group relative w-full">
      <div className="admin-preview-stack admin-preview-stack--deep" aria-hidden />
      <div className="admin-preview-stack admin-preview-stack--mid" aria-hidden />
      <button
        type="button"
        disabled={busy}
        onClick={onSelect}
        className={`admin-preview-top aspect-[4/5] w-full overflow-hidden border bg-paper-dim disabled:opacity-50 ${
          active
            ? "border-signal ring-2 ring-signal ring-offset-2 ring-offset-paper"
            : "border-line"
        }`}
      >
        <img src={src} alt="" className="h-full w-full object-cover" draggable={false} />
      </button>
    </div>
  );
}

function SectionPreviewPicker({
  sectionLabel,
  images,
  selected,
  customPreview,
  busy,
  onSelect,
  onReset,
}: {
  sectionLabel: string;
  images: string[];
  selected: string | null;
  customPreview: boolean;
  busy: boolean;
  onSelect: (src: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="mb-8 border border-line bg-paper p-4 md:p-6">
      <p className="label text-signal">Превью на главной</p>
      <p className="mt-1 text-sm text-ink-soft">
        Карточка «{sectionLabel}» в блоке «Шесть направлений». Наведите на фото в
        сетке — увидите, как карточка ляжет на главную. Не зависит от порядка в галерее.
      </p>

      <div className="mt-5 grid gap-6 md:grid-cols-[minmax(140px,220px)_1fr] md:items-start">
        <div>
          <p className="label mb-2 text-muted">Сейчас на сайте</p>
          <div className="aspect-[3/4] overflow-hidden border border-line bg-paper-dim">
            {selected ? (
              <img src={selected} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted">
                Нет фото
              </div>
            )}
          </div>
          {customPreview && (
            <button
              type="button"
              disabled={busy}
              onClick={onReset}
              className="label mt-3 text-muted underline decoration-line underline-offset-4 transition-colors hover:text-signal disabled:opacity-50"
            >
              Сбросить — первое фото галереи
            </button>
          )}
        </div>

        <div>
          <p className="label mb-3 text-muted">Выберите превью из раздела</p>
          {images.length === 0 ? (
            <p className="text-sm text-muted">Сначала загрузите фото в галерею ниже.</p>
          ) : (
            <div className="grid max-h-64 grid-cols-3 gap-x-2 gap-y-1 overflow-y-auto overflow-x-visible py-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {images.map((src) => (
                <PreviewThumb
                  key={src}
                  src={src}
                  active={src === selected}
                  busy={busy}
                  onSelect={() => onSelect(src)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPhotos() {
  const confirm = useAdminConfirm();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [tab, setTab] = useState<Tab>("zhivopis");
  const [status, setStatus] = useState("");
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editingExhibition, setEditingExhibition] = useState<number | null>(null);

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

  const uploadToGallery = async (section: SectionKey, file: File) => {
    setBusy(true);
    try {
      const { url } = await adminApi.upload(section, file);
      await load();
      flash("Фото загружено");
      return url;
    } catch (e) {
      flash(e instanceof Error ? e.message : "Ошибка загрузки", true);
      throw e;
    } finally {
      setBusy(false);
    }
  };

  const updateExhibition = (next: SiteContent["exhibitionPicks"]) => {
    setContent((prev) => (prev ? { ...prev, exhibitionPicks: next } : prev));
  };

  const updateStrip = (next: string[]) => {
    setContent((prev) => (prev ? { ...prev, photoStrip: next } : prev));
  };

  const moveExhibition = (index: number, dir: -1 | 1) => {
    if (!content) return;
    const picks = [...content.exhibitionPicks];
    const j = index + dir;
    if (j < 0 || j >= picks.length) return;
    [picks[index], picks[j]] = [picks[j], picks[index]];
    updateExhibition(picks);
  };

  const moveStrip = (index: number, dir: -1 | 1) => {
    if (!content) return;
    const strip = [...content.photoStrip];
    const j = index + dir;
    if (j < 0 || j >= strip.length) return;
    [strip[index], strip[j]] = [strip[j], strip[index]];
    updateStrip(strip);
  };

  const assignExhibitionPhoto = (src: string) => {
    if (!content) return;
    if (editingExhibition != null) {
      const picks = [...content.exhibitionPicks];
      const pick = picks[editingExhibition];
      if (!pick) return;
      picks[editingExhibition] = { ...pick, src };
      updateExhibition(picks);
      setEditingExhibition(null);
      return;
    }
    if (content.exhibitionPicks.some((p) => p.src === src)) return;
    updateExhibition([...content.exhibitionPicks, defaultExhibitionPick(src)]);
  };

  if (!content) {
    return <p className="text-muted">Загрузка…</p>;
  }

  const sectionKey = SECTIONS.some((s) => s.key === tab) ? (tab as SectionKey) : null;
  const images = sectionKey ? content.gallery[sectionKey] : [];
  const sectionPreviews = content.sectionPreviews ?? {};
  const customPreview = sectionKey ? sectionPreviews[sectionKey] != null : false;
  const previewSelected =
    sectionKey && images.length > 0
      ? customPreview && sectionPreviews[sectionKey]
        ? sectionPreviews[sectionKey]!
        : images[0]!
      : null;
  const sectionLabel = SECTIONS.find((s) => s.key === sectionKey)?.label ?? "";

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
          <SectionPreviewPicker
            sectionLabel={sectionLabel}
            images={images}
            selected={previewSelected}
            customPreview={customPreview}
            busy={busy}
            onSelect={(src) => run(() => adminApi.saveSectionPreview(sectionKey, src))}
            onReset={() => run(() => adminApi.saveSectionPreview(sectionKey, null))}
          />

          <p className="label mb-3 text-muted">Галерея раздела</p>
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
                    onClick={async () => {
                      const ok = await confirm({
                        title: "Удалить фото?",
                        message:
                          "Файл будет удалён с сайта и из галереи раздела. Это действие нельзя отменить.",
                        confirmLabel: "Удалить",
                        cancelLabel: "Оставить",
                        danger: true,
                      });
                      if (!ok) return;
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
          <div>
            <p className="text-sm text-ink-soft">
              Блок «Избранное» на главной — сетка работ с подписями. Выберите фото из
              библиотеки или загрузите новое, затем нажмите «Сохранить».
            </p>
          </div>

          <AdminUploadBar
            busy={busy}
            onUpload={async (section, file) => {
              await uploadToGallery(section, file);
            }}
          />

          {content.exhibitionPicks.length === 0 ? (
            <p className="text-sm text-muted">
              Пока нет работ в избранном — выберите фото в библиотеке ниже.
            </p>
          ) : (
            <div className="space-y-4">
              {content.exhibitionPicks.map((pick, i) => (
                <div
                  key={`${pick.src}-${i}`}
                  className={`grid gap-4 border bg-paper p-4 md:grid-cols-[140px_1fr] ${
                    editingExhibition === i ? "border-signal" : "border-line"
                  }`}
                >
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setEditingExhibition(editingExhibition === i ? null : i)}
                    className="aspect-[4/5] overflow-hidden border border-line text-left"
                  >
                    <img src={pick.src} alt="" className="h-full w-full object-cover" />
                  </button>
                  <div className="space-y-3">
                    <label className="block">
                      <span className="label text-muted">Подпись на сайте</span>
                      <input
                        value={pick.cap}
                        disabled={busy}
                        onChange={(e) => {
                          const picks = [...content.exhibitionPicks];
                          picks[i] = { ...pick, cap: e.target.value };
                          updateExhibition(picks);
                        }}
                        placeholder="Например: Авторская картина"
                        className="mt-1 w-full border border-line bg-paper-dim px-3 py-2.5 text-sm outline-none focus:border-signal"
                      />
                    </label>
                    <label className="block">
                      <span className="label text-muted">Размер в сетке</span>
                      <select
                        value={pick.span}
                        disabled={busy}
                        onChange={(e) => {
                          const picks = [...content.exhibitionPicks];
                          picks[i] = { ...pick, span: e.target.value };
                          updateExhibition(picks);
                        }}
                        className="mt-1 w-full border border-line bg-paper-dim px-3 py-2.5 text-sm"
                      >
                        {EXHIBITION_SIZE_OPTIONS.map((opt) => (
                          <option key={opt.span} value={opt.span}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          setEditingExhibition(editingExhibition === i ? null : i)
                        }
                        className={`label border px-3 py-2 text-[0.6rem] transition-colors ${
                          editingExhibition === i
                            ? "border-signal bg-signal text-paper"
                            : "border-line hover:border-ink"
                        }`}
                      >
                        {editingExhibition === i ? "Выбор фото…" : "Сменить фото"}
                      </button>
                      <button
                        type="button"
                        disabled={busy || i === 0}
                        onClick={() => moveExhibition(i, -1)}
                        className="label border border-line px-3 py-2 text-[0.6rem] disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={busy || i === content.exhibitionPicks.length - 1}
                        onClick={() => moveExhibition(i, 1)}
                        className="label border border-line px-3 py-2 text-[0.6rem] disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={async () => {
                          const ok = await confirm({
                            title: "Убрать из избранного?",
                            message: "Работа исчезнет из блока на главной. Само фото в галерее останется.",
                            confirmLabel: "Убрать",
                            cancelLabel: "Отмена",
                            danger: true,
                          });
                          if (!ok) return;
                          updateExhibition(content.exhibitionPicks.filter((_, j) => j !== i));
                          if (editingExhibition === i) setEditingExhibition(null);
                        }}
                        className="label border border-line px-3 py-2 text-[0.6rem] text-signal hover:border-signal"
                      >
                        Убрать
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <GalleryPicker
            content={content}
            disabled={busy}
            activeSrc={
              editingExhibition != null
                ? content.exhibitionPicks[editingExhibition]?.src ?? null
                : null
            }
            exclude={
              editingExhibition == null
                ? content.exhibitionPicks.map((p) => p.src)
                : []
            }
            hint={
              editingExhibition != null
                ? "Нажмите на фото — оно заменит выбранную работу."
                : "Нажмите на фото — добавить в избранное."
            }
            onSelect={assignExhibitionPhoto}
          />

          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => adminApi.saveExhibition(content.exhibitionPicks))}
            className="label border border-ink bg-ink px-6 py-3 text-paper transition-colors hover:border-signal hover:bg-signal disabled:opacity-50"
          >
            Сохранить избранное
          </button>
        </div>
      )}

      {tab === "strip" && (
        <div className="space-y-6">
          <p className="text-sm text-ink-soft">
            Горизонтальная лента фото на главной. Порядок слева направо — как на сайте.
            Выберите снимки из библиотеки или загрузите новые.
          </p>

          <AdminUploadBar
            busy={busy}
            onUpload={async (section, file) => {
              await uploadToGallery(section, file);
            }}
          />

          <div className="border border-line bg-paper p-4 md:p-5">
            <p className="label text-muted">
              В ленте сейчас · {content.photoStrip.length}
            </p>
            {content.photoStrip.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                Лента пуста — добавьте фото из библиотеки ниже.
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {content.photoStrip.map((src, i) => (
                  <div key={src + i} className="border border-line bg-paper-dim">
                    <div className="aspect-[4/5] overflow-hidden">
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex gap-1 border-t border-line p-2">
                      <button
                        type="button"
                        disabled={busy || i === 0}
                        onClick={() => moveStrip(i, -1)}
                        className="label flex-1 border border-line py-1.5 text-[0.55rem] disabled:opacity-30"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        disabled={busy || i === content.photoStrip.length - 1}
                        onClick={() => moveStrip(i, 1)}
                        className="label flex-1 border border-line py-1.5 text-[0.55rem] disabled:opacity-30"
                      >
                        →
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={async () => {
                          const ok = await confirm({
                            title: "Убрать из ленты?",
                            message: "Фото пропадёт из бегущей ленты на главной. В галерее останется.",
                            confirmLabel: "Убрать",
                            cancelLabel: "Отмена",
                            danger: true,
                          });
                          if (!ok) return;
                          updateStrip(content.photoStrip.filter((_, j) => j !== i));
                        }}
                        className="label border border-line px-2 py-1.5 text-[0.55rem] text-signal hover:border-signal"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <GalleryPicker
            content={content}
            disabled={busy}
            exclude={content.photoStrip}
            hint="Нажмите на фото — добавить в конец ленты."
            onSelect={(src) => {
              if (content.photoStrip.includes(src)) return;
              updateStrip([...content.photoStrip, src]);
            }}
          />

          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => adminApi.savePhotoStrip(content.photoStrip))}
            className="label border border-ink bg-ink px-6 py-3 text-paper transition-colors hover:border-signal hover:bg-signal disabled:opacity-50"
          >
            Сохранить ленту
          </button>
        </div>
      )}

      <Status msg={status} error={err} />
    </div>
  );
}
