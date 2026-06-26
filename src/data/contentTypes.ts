import type { SectionKey } from "./sections";
import type defaults from "../../server/defaults.json";

export type GalleryMap = (typeof defaults)["gallery"];
export type PriceGroup = (typeof defaults)["priceGroups"][number];
export type PriceItem = PriceGroup["items"][number];
export type PaintingForSale = (typeof defaults)["paintingsForSale"][number];
export type ExhibitionPick = (typeof defaults)["exhibitionPicks"][number];

export interface SiteContent {
  gallery: GalleryMap;
  priceGroups: PriceGroup[];
  paintingsForSale: PaintingForSale[];
  exhibitionPicks: ExhibitionPick[];
  photoStrip: string[];
  sectionPreviews: Partial<Record<SectionKey, string>>;
}

export type GallerySectionKey = SectionKey;
