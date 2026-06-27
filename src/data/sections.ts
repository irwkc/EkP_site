export type SectionKey =
  | "zhivopis"
  | "kurs"
  | "masterskaya"
  | "mebel"
  | "kartiny"
  | "masterclass";

export interface Section {
  key: SectionKey;
  index: string;
  title: string;
  kicker: string;
  blurb: string;
  features?: string[];
  contactNote?: "conditions" | "program";
  meta: string;
  images: string[];
  preview: string | null;
}

export const SECTIONS_META: Omit<Section, "images" | "preview">[] = [
  {
    key: "zhivopis",
    index: "01",
    title: "Живопись с нуля",
    kicker: "Студия",
    blurb: "",
    features: [
      "Даже если вы никогда не рисовали, у вас всё получится.",
      "Знакомимся со светотенью, цветовым кругом, тональностью и цветом.",
      "Пробуем разные материалы — тушь, акварель, масляная пастель, акрил, масло.",
      "Натюрморт, портрет, пейзаж.",
      "Выезжаем на пленэры.",
    ],
    meta: "Занятия проходят по расписанию · Четверг, воскресенье 11:00 – 14:00",
    contactNote: "conditions",
  },
  {
    key: "kurs",
    index: "02",
    title: "Курс-обучение",
    kicker: "Декор · Реставрация · Редизайн",
    blurb:
      "Полноценная программа для тех, кто хочет превратить любовь к красоте в ремесло. Учимся давать вещам вторую жизнь и создавать авторский декор.",
    meta: "3 блока из 15 тем · Сертификат · Поддержка после курса",
    contactNote: "conditions",
  },
  {
    key: "masterskaya",
    index: "03",
    title: "Мастерская",
    kicker: "Пространство на Соборной",
    blurb:
      "Свет, мольберты, запах краски и тишина, в которой рождаются работы. Сюда приходят творить — поодиночке и компаниями.",
    meta: "ул. Радищева 45 · Уютное арт-пространство",
  },
  {
    key: "mebel",
    index: "04",
    title: "Мебель",
    kicker: "Реставрация и редизайн",
    blurb:
      "Старый комод с историей превращается в акцент интерьера. Реставрирую, перекрашиваю и расписываю мебель под ваш дом.",
    meta: "Под заказ · Авторская роспись · Разработка дизайна мебели",
    contactNote: "conditions",
  },
  {
    key: "kartiny",
    index: "05",
    title: "Картины",
    kicker: "Авторские работы",
    blurb: "",
    features: [
      "картины на заказ",
      "масло, акрил, акварель, карандаш",
      "холст, картон, бумага любого размера по эскизу и фотографии",
    ],
    meta: "Доставка в любой город",
    contactNote: "conditions",
  },
  {
    key: "masterclass",
    index: "06",
    title: "Мастер-классы",
    kicker: "Для компаний и праздников",
    blurb: "",
    features: [
      "индивидуальные и групповые для взрослых и детей",
      "арт-вечеринки (выездные в том числе)",
      "корпоративы",
      "дни рождения",
    ],
    meta: "Все материалы и заготовки предоставляются студией",
    contactNote: "conditions",
  },
];

export const SECTION_KEYS = SECTIONS_META.map((s) => s.key);

export function isSectionKey(value: string): value is SectionKey {
  return SECTION_KEYS.includes(value as SectionKey);
}

export function getSectionPath(key: SectionKey) {
  return `/${key}`;
}

export function getAdjacentSections(key: SectionKey) {
  const i = SECTIONS_META.findIndex((s) => s.key === key);
  return {
    prev: i > 0 ? SECTIONS_META[i - 1] : null,
    next: i < SECTIONS_META.length - 1 ? SECTIONS_META[i + 1] : null,
  };
}

export const STUDIO = {
  name: "Художественная мастерская",
  owner: "Екатерина Сергиевская",
  city: "Рязань",
  address: "ул. Радищева 45 · Уютное арт-пространство",
  phone: "+7 (910) 901-10-83",
  phoneHref: "tel:+79109011083",
  vk: "https://vk.com/clubsketchatr",
  vkLabel: "vk.com/clubsketchatr",
  telegram: "https://t.me/clubnasobornoy",
  telegramLabel: "t.me/clubnasobornoy",
  followers: "443",
};

export const FOUNDER = {
  name: "Сергиевская Екатерина Петровна",
  shortName: "Екатерина Петровна",
  role: "Художник · основатель мастерской",
  photo: "/founder.png",
  signature: "Е. Сергиевская",
  lead: "Я открыла мастерскую, чтобы делиться главным — радостью от собственноручно созданной красоты.",
  paragraphs: [
    "Живопись вошла в мою жизнь не как профессия, а как способ видеть мир. Годы практики, сотни написанных картин и отреставрированных вещей привели к простой идее: красоте можно научить каждого.",
    "В мастерской на Соборной я веду занятия по живописи, реставрирую и расписываю мебель, пишу авторские картины и провожу мастер-классы. Здесь нет «неспособных» — есть те, кто ещё не взял кисть.",
  ],
  stats: [
    { value: "12+", label: "лет в живописи" },
    { value: "500+", label: "учеников" },
    { value: "6", label: "направлений" },
  ],
};
