import { useMemo } from "react";
import { useSiteContent } from "../context/ContentContext";
import {
  SECTIONS_META,
  type Section,
  type SectionKey,
} from "../data/sections";

export function useSections(): Section[] {
  const content = useSiteContent();
  return useMemo(
    () =>
      SECTIONS_META.map((s) => ({
        ...s,
        images: content.gallery[s.key as SectionKey] ?? [],
      })),
    [content.gallery]
  );
}

export function useSection(key: SectionKey): Section | undefined {
  const sections = useSections();
  return sections.find((s) => s.key === key);
}
