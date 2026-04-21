// Tojrason/frontend/shared/utils/constants.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

// ========== МАЪЛУМОТИ УМУМИИ ЛОИҲА ==========
export const APP_NAME = 'Тоҷрасон';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Хадамоти расонидани бору мол дар Тоҷикистон';

// ========== ЗАБОНҲОИ ДАСТГИРИШАВАНДА ==========
export const SUPPORTED_LANGUAGES = {
  TG: 'tg',
  RU: 'ru',
  EN: 'en',
} as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[keyof typeof SUPPORTED_LANGUAGES];

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  [SUPPORTED_LANGUAGES.TG]: 'Тоҷикӣ',
  [SUPPORTED_LANGUAGES.RU]: 'Русский',
  [SUPPORTED_LANGUAGES.EN]: 'English',
};

// ========== СТАТУСҲОИ ФАРМОИШ ==========
export const ORDER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  PICKUP: 'pickup',
  IN_TRANSIT: 'in_transit',
  ARRIVING: 'arriving',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [ORDER_STATUS.PENDING]: 'Дар интизорӣ',
  [ORDER_STATUS.ACCEPTED]: 'Қабулшуда',
  [ORDER_STATUS.PICKUP]: 'Гирифтани бор',
  [ORDER_STATUS.IN_TRANSIT]: 'Дар роҳ',
  [ORDER_STATUS.ARRIVING]: 'Наздик шуд',
  [ORDER_STATUS.DELIVERED]: 'Расонида шуд',
  [ORDER_STATUS.CANCELLED]: 'Бекоршуда',
};

// ========== НАМУДҲОИ БОР ==========
export const PACKAGE_TYPES = {
  DOCUMENT: 'document',
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  FRAGILE: 'fragile',
} as const;

export type PackageType = typeof PACKAGE_TYPES[keyof typeof PACKAGE_TYPES];

export const PACKAGE_TYPE_LABELS: Record<PackageType, string> = {
  [PACKAGE_TYPES.DOCUMENT]: 'Ҳуҷҷат',
  [PACKAGE_TYPES.SMALL]: 'Хурд',
  [PACKAGE_TYPES.MEDIUM]: 'Миёна',
  [PACKAGE_TYPES.LARGE]: 'Калон',
  [PACKAGE_TYPES.FRAGILE]: 'Зудшикан',
};

// ========== УСУЛҲОИ ПАРДОХТ ==========
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  WALLET: 'wallet',
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PAYMENT_METHODS.CASH]: 'Пули нақд',
  [PAYMENT_METHODS.CARD]: 'Корти бонкӣ',
  [PAYMENT_METHODS.WALLET]: 'Ҳамён',
};

// ========== СТАТУСҲОИ ПАРДОХТ ==========
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

// ========== СТАТУСҲОИ КУРЙЕР ==========
export const COURIER_STATUS = {
  OFFLINE: 'offline',
  ONLINE: 'online',
  ON_DELIVERY: 'on_delivery',
  BREAK: 'break',
} as const;

export type CourierStatus = typeof COURIER_STATUS[keyof typeof COURIER_STATUS];

// ========== НАМУДҲОИ НАҚЛИЁТ ==========
export const VEHICLE_TYPES = {
  BICYCLE: 'bicycle',
  MOTORCYCLE: 'motorcycle',
  CAR: 'car',
  TRUCK: 'truck',
  WALKING: 'walking',
} as const;

export type VehicleType = typeof VEHICLE_TYPES[keyof typeof VEHICLE_TYPES];

// ========== ТАНЗИМОТИ ХАРИТА ==========
export const MAP_CONFIG = {
  DEFAULT_CENTER: [38.5613, 68.7840] as [number, number], // Душанбе
  DEFAULT_ZOOM: 13,
  MIN_ZOOM: 8,
  MAX_ZOOM: 18,
  TILE_LAYER_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
} as const;

// ========== ТАНЗИМОТИ ВАЛИДАТСИЯ ==========
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  PHONE: {
    LENGTH: 9,
    PREFIX: '+992',
  },
  WEIGHT: {
    MIN: 0.1,
    MAX: 500,
  },
  AMOUNT: {
    MIN: 0.01,
    MAX: 10000,
  },
} as const;

// ========== ТАНЗИМОТИ PAGINATION ==========
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [10, 20, 50, 100],
} as const;

// ========== АСЪОРҲО ==========
export const CURRENCIES = {
  TJS: 'TJS',
  USD: 'USD',
  EUR: 'EUR',
  RUB: 'RUB',
} as const;

export type Currency = typeof CURRENCIES[keyof typeof CURRENCIES];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  [CURRENCIES.TJS]: 'смн',
  [CURRENCIES.USD]: '$',
  [CURRENCIES.EUR]: '€',
  [CURRENCIES.RUB]: '₽',
};

// ========== ПАЁМҲОИ ХАТОГИИ УМУМӢ ==========
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Хатогии шабака. Лутфан пайвасти интернети худро тафтиш кунед.',
  SERVER_ERROR: 'Хатогии сервер. Лутфан баъдтар дубора кӯшиш кунед.',
  UNAUTHORIZED: 'Шумо ворид нашудаед. Лутфан аввал ворид шавед.',
  FORBIDDEN: 'Шумо ба ин бахш дастрасӣ надоред.',
  NOT_FOUND: 'Маълумот ёфт нашуд.',
  VALIDATION_ERROR: 'Маълумоти воридшуда нодуруст аст.',
  SESSION_EXPIRED: 'Сессияи шумо ба охир расид. Лутфан дубора ворид шавед.',
} as const;

// ========== ПАЁМҲОИ МУВАФФАҚИЯТ ==========
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Шумо бо муваффақият ворид шудед!',
  REGISTER_SUCCESS: 'Ҳисоби шумо бо муваффақият эҷод шуд!',
  LOGOUT_SUCCESS: 'Шумо аз система баромадед.',
  PROFILE_UPDATED: 'Профили шумо бо муваффақият навсозӣ шуд.',
  PASSWORD_CHANGED: 'Пароли шумо бо муваффақият тағйир дода шуд.',
  ORDER_CREATED: 'Фармоиши шумо бо муваффақият эҷод шуд!',
  PAYMENT_SUCCESS: 'Пардохт бо муваффақият анҷом ёфт!',
} as const;

// ========== КОДҲОИ ОПЕРАТОРҲОИ МОБИЛӢ ДАР ТОҶИКИСТОН ==========
export const MOBILE_OPERATOR_CODES = [
  '90', '91', '92', '93', '94', '95', '96', '97', '98', '99',
  '50', '55',
  '88',
] as const;

// ========== АНДОЗАҲОИ ЭКРАН (BREAKPOINTS) ==========
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// Экспорти пешфарз
const constants = {
  APP_NAME,
  APP_VERSION,
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  PACKAGE_TYPES,
  PACKAGE_TYPE_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  COURIER_STATUS,
  VEHICLE_TYPES,
  MAP_CONFIG,
  VALIDATION_RULES,
  PAGINATION,
  CURRENCIES,
  CURRENCY_SYMBOLS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};

export default constants;
