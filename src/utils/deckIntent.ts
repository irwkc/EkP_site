import type { SectionKey } from "../data/sections";

const KEY = "ekp-deck-section";

export function saveDeckSection(key: SectionKey) {
  try {
    sessionStorage.setItem(KEY, key);
  } catch {
    /* private mode */
  }
}

export function peekDeckSection(): SectionKey | null {
  try {
    const value = sessionStorage.getItem(KEY);
    return value ? (value as SectionKey) : null;
  } catch {
    return null;
  }
}

export function resolveDeckIndex(sections: { key: SectionKey }[]): number {
  const key = peekDeckSection();
  if (!key) return 0;
  const index = sections.findIndex((s) => s.key === key);
  return index >= 0 ? index : 0;
}
