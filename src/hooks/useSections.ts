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
      SECTIONS_META.map((s) => {
        const images = content.gallery[s.key as SectionKey] ?? [];
        const chosen = content.sectionPreviews?.[s.key as SectionKey];
        const preview =
          chosen && images.includes(chosen) ? chosen : images[0] ?? null;
        return {
          ...s,
          images,
          preview,
        };
      }),
    [content.gallery, content.sectionPreviews]
  );
}

export function useSection(key: SectionKey): Section | undefined {
  const sections = useSections();
  return sections.find((s) => s.key === key);
}
