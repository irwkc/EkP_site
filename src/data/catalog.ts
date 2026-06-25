import gallery from "./gallery.json";

export const PAINTINGS_PATH = "/paintings";
export const PRICES_PATH = "/prices";

export const CATALOG_PATHS = [PAINTINGS_PATH, PRICES_PATH] as const;

export function isCatalogPath(path: string) {
  return (CATALOG_PATHS as readonly string[]).includes(path);
}

export interface PaintingForSale {
  id: string;
  title: string;
  medium: string;
  size: string;
  price: number;
  image: string;
  available: boolean;
}

export interface PriceItem {
  name: string;
  detail?: string;
  price: string;
}

export interface PriceGroup {
  id: string;
  title: string;
  kicker: string;
  items: PriceItem[];
}

/** Картины в продаже — обновляйте цены и статус здесь */
export const PAINTINGS_FOR_SALE: PaintingForSale[] = [
  {
    id: "p1",
    title: "Утро на Соборной",
    medium: "масло, холст",
    size: "50 × 70 см",
    price: 28_000,
    image: gallery.kartiny[2],
    available: true,
  },
  {
    id: "p2",
    title: "Натюрморт с лимонами",
    medium: "масло, холст",
    size: "40 × 50 см",
    price: 18_500,
    image: gallery.kartiny[8],
    available: true,
  },
  {
    id: "p3",
    title: "Рязанский пейзаж",
    medium: "акрил, холст",
    size: "60 × 80 см",
    price: 32_000,
    image: gallery.kartiny[14],
    available: true,
  },
  {
    id: "p4",
    title: "Тишина мастерской",
    medium: "масло, холст",
    size: "30 × 40 см",
    price: 12_000,
    image: gallery.kartiny[20],
    available: false,
  },
  {
    id: "p5",
    title: "Летний сад",
    medium: "масло, холст",
    size: "50 × 60 см",
    price: 24_000,
    image: gallery.kartiny[5],
    available: true,
  },
  {
    id: "p6",
    title: "Абстракция «Свет»",
    medium: "акрил, холст",
    size: "70 × 90 см",
    price: 45_000,
    image: gallery.kartiny[11],
    available: true,
  },
];

/** Стоимость занятий — обновляйте прайс здесь */
export const PRICE_GROUPS: PriceGroup[] = [
  {
    id: "zhivopis",
    title: "Живопись с нуля",
    kicker: "Студия",
    items: [
      { name: "Разовое занятие", detail: "2,5 ч · все материалы", price: "2 500 ₽" },
      { name: "Абонемент 4 занятия", detail: "действует 2 месяца", price: "9 000 ₽" },
      { name: "Индивидуально", detail: "1,5–2 ч с мастером", price: "от 3 500 ₽" },
    ],
  },
  {
    id: "masterclass",
    title: "Мастер-классы",
    kicker: "Праздники и компании",
    items: [
      { name: "Группа от 4 человек", detail: "на человека", price: "от 2 000 ₽" },
      { name: "День рождения / девичник", detail: "до 8 гостей", price: "от 18 000 ₽" },
      { name: "Корпоратив", detail: "выезд или в мастерской", price: "по запросу" },
    ],
  },
  {
    id: "kurs",
    title: "Курс-обучение",
    kicker: "Декор и реставрация",
    items: [
      { name: "Полный курс", detail: "8 модулей · сертификат", price: "от 28 000 ₽" },
      { name: "Отдельный модуль", detail: "4 занятия", price: "от 8 500 ₽" },
      { name: "Пробное занятие", detail: "знакомство с программой", price: "2 000 ₽" },
    ],
  },
  {
    id: "extra",
    title: "Дополнительно",
    kicker: "Мастерская",
    items: [
      { name: "Картина на заказ", detail: "любой размер", price: "по запросу" },
      { name: "Реставрация мебели", detail: "оценка по фото", price: "от 5 000 ₽" },
      { name: "Подарочный сертификат", detail: "любая сумма", price: "от 2 000 ₽" },
    ],
  },
];

export function formatPrice(n: number) {
  return `${n.toLocaleString("ru-RU")} ₽`;
}
