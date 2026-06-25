export const PAINTINGS_PATH = "/paintings";
export const PRICES_PATH = "/prices";

export const CATALOG_PATHS = [PAINTINGS_PATH, PRICES_PATH] as const;

export function isCatalogPath(path: string) {
  return (CATALOG_PATHS as readonly string[]).includes(path);
}

export type { PaintingForSale, PriceGroup, PriceItem } from "./contentTypes";

export function formatPrice(n: number) {
  return `${n.toLocaleString("ru-RU")} ₽`;
}
