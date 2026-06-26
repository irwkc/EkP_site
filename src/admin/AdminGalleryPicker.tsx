import { useState } from "react";
import type { ExhibitionPick, SiteContent } from "../data/contentTypes";
import type { SectionKey } from "../data/sections";

export const SECTION_LABELS: { key: SectionKey; label: string }[] = [
  { key: "zhivopis", label: "Живопись" },
  { key: "kurs", label: "Курс" },
  { key: "masterskaya", label: "Мастерская" },
  { key: "mebel", label: "Мебель" },
  { key: "kartiny", label: "Картины" },
  { key: "masterclass", label: "Мастер-классы" },
];

export const EXHIBITION_SIZE_OPTIONS: { label: string; span: string }[] = [
  { label: "Компактная", span: "md:col-span-3" },
  { label: "Стандартная", span: "md:col-span-4" },
  { label: "Высокая", span: "md:col-span-4 md:row-span-2" },
  { label: "Акцентная", span: "md:col-span-5 md:row-span-2" },
];

export function exhibitionSizeLabel(span: string) {
  return EXHIBITION_SIZE_OPTIONS.find((o) => o.span === span)?.label ?? "Стандартная";
}

export function GalleryPicker({
  content,
  onSelect,
  disabled,
  exclude = [],
  activeSrc,
  hint,
}: {
  content: SiteContent;
  onSelect: (src: string) => void;
  disabled?: boolean;
  exclude?: string[];
  activeSrc?: string | null;
  hint?: string;
}) {
  const [filterSection, setFilterSection] = useState<SectionKey | "all">("all");

  const sections =
    filterSection === "all"
      ? SECTION_LABELS
      : SECTION_LABELS.filter((s) => s.key === filterSection);

  return (
    <div className="border border-line bg-paper-dim p-4 md:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="label text-muted">Библиотека фото</p>
          {hint && <p className="mt-1 text-sm text-ink-soft">{hint}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setFilterSection("all")}
            className={`label border px-3 py-1.5 text-[0.6rem] transition-colors ${
              filterSection === "all"
                ? "border-ink bg-ink text-paper"
                : "border-line text-muted hover:border-ink"
            }`}
          >
            Все
          </button>
          {SECTION_LABELS.map((s) => (
            <button
              key={s.key}
              type="button"
              disabled={disabled}
              onClick={() => setFilterSection(s.key)}
              className={`label border px-3 py-1.5 text-[0.6rem] transition-colors ${
                filterSection === s.key
                  ? "border-ink bg-ink text-paper"
                  : "border-line text-muted hover:border-ink"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-5">
        {sections.map(({ key, label }) => {
          const images = content.gallery[key] ?? [];
          if (images.length === 0) return null;

          return (
            <div key={key}>
              <p className="label mb-2 text-muted">{label}</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {images.map((src) => {
                  const isExcluded = exclude.includes(src);
                  const isActive = activeSrc === src;
                  return (
                    <button
                      key={src}
                      type="button"
                      disabled={disabled || isExcluded}
                      onClick={() => onSelect(src)}
                      title={isExcluded ? "Уже добавлено" : "Выбрать"}
                      className={`aspect-[4/5] overflow-hidden border bg-paper transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
                        isActive
                          ? "border-signal ring-2 ring-signal ring-offset-2 ring-offset-paper-dim"
                          : "border-line hover:border-ink"
                      }`}
                    >
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AdminUploadBar({
  busy,
  onUpload,
}: {
  busy: boolean;
  onUpload: (section: SectionKey, file: File) => Promise<void>;
}) {
  const [section, setSection] = useState<SectionKey>("kartiny");

  return (
    <div className="flex flex-col gap-3 border border-dashed border-line p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="label text-muted">Загрузить новое фото</p>
        <p className="mt-1 text-sm text-ink-soft">
          Файл попадёт в выбранный раздел галереи, после загрузки его можно сразу добавить
          сюда.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={section}
          disabled={busy}
          onChange={(e) => setSection(e.target.value as SectionKey)}
          className="label border border-line bg-paper px-3 py-2.5 text-sm"
        >
          {SECTION_LABELS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
        <label className="label cursor-pointer border border-ink bg-ink px-4 py-2.5 text-paper transition-colors hover:border-signal hover:bg-signal">
          Выбрать файл
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              void onUpload(section, f).finally(() => {
                e.target.value = "";
              });
            }}
          />
        </label>
      </div>
    </div>
  );
}

export function defaultExhibitionPick(src: string): ExhibitionPick {
  return {
    src,
    cap: "",
    span: "md:col-span-4",
  };
}
