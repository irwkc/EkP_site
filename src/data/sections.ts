import gallery from "./gallery.json";

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
  meta: string;
  images: string[];
}

const g = gallery as Record<SectionKey, string[]>;

export const SECTIONS: Section[] = [
  {
    key: "zhivopis",
    index: "01",
    title: "Живопись с нуля",
    kicker: "Студия",
    blurb:
      "Берём кисть впервые — и за один вечер уходим с готовой картиной. Масло, акрил, пастель: ставим руку, чувство цвета и композицию без скучной теории.",
    meta: "Группы до 6 человек · Все материалы включены",
    images: g.zhivopis,
  },
  {
    key: "kurs",
    index: "02",
    title: "Курс-обучение",
    kicker: "Декор · Реставрация · Редизайн",
    blurb:
      "Полноценная программа для тех, кто хочет превратить любовь к красоте в ремесло. Учимся возвращать вещам вторую жизнь и создавать авторский декор.",
    meta: "8 модулей · Сертификат · Поддержка после курса",
    images: g.kurs,
  },
  {
    key: "masterskaya",
    index: "03",
    title: "Мастерская",
    kicker: "Пространство на Соборной",
    blurb:
      "Свет, мольберты, запах краски и тишина, в которой рождаются работы. Сюда приходят творить — поодиночке и компаниями.",
    meta: "ул. Радищева · Аренда мольберта · Свободное творчество",
    images: g.masterskaya,
  },
  {
    key: "mebel",
    index: "04",
    title: "Мебель",
    kicker: "Реставрация и редизайн",
    blurb:
      "Старый комод с историей превращается в акцент интерьера. Реставрируем, перекрашиваем и расписываем мебель под ваш дом.",
    meta: "Под заказ · Авторская роспись · Восстановление",
    images: g.mebel,
  },
  {
    key: "kartiny",
    index: "05",
    title: "Картины",
    kicker: "Авторские работы",
    blurb:
      "Готовые интерьерные картины и работы на заказ — пейзажи, натюрморты, абстракции. Каждая написана вручную и существует в единственном экземпляре.",
    meta: "Оригиналы · Любой размер · Доставка",
    images: g.kartiny,
  },
  {
    key: "masterclass",
    index: "06",
    title: "Мастер-классы",
    kicker: "Для компаний и праздников",
    blurb:
      "Тёплый вечер с красками — для друзей, семьи или команды. Дни рождения, девичники, корпоративы: уходят с картиной и настроением.",
    meta: "От 2 человек · Выездные форматы · Подарочные сертификаты",
    images: g.masterclass,
  },
];

export const SECTION_KEYS = SECTIONS.map((s) => s.key);

export function isSectionKey(value: string): value is SectionKey {
  return SECTION_KEYS.includes(value as SectionKey);
}

export function getSectionPath(key: SectionKey) {
  return `/${key}`;
}

export function getAdjacentSections(key: SectionKey) {
  const i = SECTIONS.findIndex((s) => s.key === key);
  return {
    prev: i > 0 ? SECTIONS[i - 1] : null,
    next: i < SECTIONS.length - 1 ? SECTIONS[i + 1] : null,
  };
}

export const STUDIO = {
  name: "Художественная мастерская",
  owner: "Екатерина Сергиевская",
  city: "Рязань",
  address: "ул. Радищева",
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
