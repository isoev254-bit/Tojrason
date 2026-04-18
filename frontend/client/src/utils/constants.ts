// Tojrason/frontend/client/src/utils/constants.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

// ========== МАЪЛУМОТИ УМУМИИ ЛОИҲА ==========
export const APP_NAME = 'Тоҷрасон';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Хадамоти расонидани бору мол дар Тоҷикистон';
export const APP_CONTACT_EMAIL = 'info@tojrason.tj';
export const APP_CONTACT_PHONE = '+992 00 000 00 00';
export const APP_WEBSITE = 'https://tojrason.tj';

// ========== ТАНЗИМОТИ API ==========
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const API_TIMEOUT = 30000; // 30 сония
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';

// ========== КАЛИДҲОИ LOCAL STORAGE ==========
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'tojrason_access_token',
  REFRESH_TOKEN: 'tojrason_refresh_token',
  USER: 'tojrason_user',
  LANGUAGE: 'tojrason_language',
  THEME: 'tojrason_theme',
  REMEMBERED_EMAIL: 'tojrason_remembered_email',
  ONBOARDING_COMPLETED: 'tojrason_onboarding_completed',
} as const;

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

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [ORDER_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [ORDER_STATUS.ACCEPTED]: 'bg-blue-100 text-blue-800 border-blue-200',
  [ORDER_STATUS.PICKUP]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  [ORDER_STATUS.IN_TRANSIT]: 'bg-purple-100 text-purple-800 border-purple-200',
  [ORDER_STATUS.ARRIVING]: 'bg-orange-100 text-orange-800 border-orange-200',
  [ORDER_STATUS.DELIVERED]: 'bg-green-100 text-green-800 border-green-200',
  [ORDER_STATUS.CANCELLED]: 'bg-red-100 text-red-800 border-red-200',
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

export const PACKAGE_TYPE_ICONS: Record<PackageType, string> = {
  [PACKAGE_TYPES.DOCUMENT]: '📄',
  [PACKAGE_TYPES.SMALL]: '📦',
  [PACKAGE_TYPES.MEDIUM]: '📦',
  [PACKAGE_TYPES.LARGE]: '📦',
  [PACKAGE_TYPES.FRAGILE]: '⚠️',
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
  [PAYMENT_METHODS.WALLET]: 'Ҳамёни Тоҷрасон',
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

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PAYMENT_STATUS.PENDING]: 'Дар интизорӣ',
  [PAYMENT_STATUS.PROCESSING]: 'Дар раванди коркард',
  [PAYMENT_STATUS.COMPLETED]: 'Пардохт шуд',
  [PAYMENT_STATUS.FAILED]: 'Ноком шуд',
  [PAYMENT_STATUS.REFUNDED]: 'Баргардонида шуд',
  [PAYMENT_STATUS.CANCELLED]: 'Бекор шуд',
};

// ========== СТАТУСҲОИ КУРЙЕР ==========
export const COURIER_STATUS = {
  OFFLINE: 'offline',
  ONLINE: 'online',
  ON_DELIVERY: 'on_delivery',
  BREAK: 'break',
} as const;

export type CourierStatus = typeof COURIER_STATUS[keyof typeof COURIER_STATUS];

export const COURIER_STATUS_LABELS: Record<CourierStatus, string> = {
  [COURIER_STATUS.OFFLINE]: 'Офлайн',
  [COURIER_STATUS.ONLINE]: 'Онлайн',
  [COURIER_STATUS.ON_DELIVERY]: 'Дар расонидан',
  [COURIER_STATUS.BREAK]: 'Танаффус',
};

// ========== НАМУДҲОИ НАҚЛИЁТ ==========
export const VEHICLE_TYPES = {
  BICYCLE: 'bicycle',
  MOTORCYCLE: 'motorcycle',
  CAR: 'car',
  TRUCK: 'truck',
  WALKING: 'walking',
} as const;

export type VehicleType = typeof VEHICLE_TYPES[keyof typeof VEHICLE_TYPES];

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  [VEHICLE_TYPES.BICYCLE]: 'Велосипед',
  [VEHICLE_TYPES.MOTORCYCLE]: 'Мотосикл',
  [VEHICLE_TYPES.CAR]: 'Мошин',
  [VEHICLE_TYPES.TRUCK]: 'Мошини боркаш',
  [VEHICLE_TYPES.WALKING]: 'Пиёда',
};

// ========== МАСИРҲОИ ЛОИҲА ==========
export const ROUTES = {
  // Саҳифаҳои умумӣ
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  PROFILE: '/profile',
  EDIT_PROFILE: '/profile/edit',
  CHANGE_PASSWORD: '/profile/change-password',
  NOT_FOUND: '/404',
  CONTACT: '/contact',
  ABOUT: '/about',
  TERMS: '/terms',
  PRIVACY: '/privacy',

  // Фармоишҳо
  CREATE_ORDER: '/create-order',
  ORDER_HISTORY: '/order-history',
  ORDER_DETAILS: '/order/:orderId',
  TRACK_ORDER: '/track-order',

  // Пардохт
  PAYMENT: '/payment/:orderId',
  PAYMENT_SUCCESS: '/payment-success',
  PAYMENT_CANCEL: '/payment-cancel',

  // Чат
  CHAT: '/chat',
  CHAT_ROOM: '/chat/:orderId',
} as const;

// ========== ТАНЗИМОТИ ХАРИТА ==========
export const MAP_CONFIG = {
  DEFAULT_CENTER: [38.5613, 68.7840] as [number, number], // Душанбе
  DEFAULT_ZOOM: 12,
  MIN_ZOOM: 8,
  MAX_ZOOM: 18,
  TILE_LAYER_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
} as const;

// ========== ТАНЗИМОТИ ПАЙГИРӢ ==========
export const TRACKING_CONFIG = {
  UPDATE_INTERVAL: 10000, // 10 сония барои навсозии макон
  LOCATION_ACCURACY: {
    ENABLE_HIGH_ACCURACY: true,
    TIMEOUT: 15000,
    MAXIMUM_AGE: 0,
  },
} as const;

// ========== ТАНЗИМОТИ ВАЛИДАТСИЯ ==========
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: false,
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
  DIMENSIONS: {
    MIN: 1,
    MAX: 200,
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

// ========== ВАҚТҲОИ ТАЪХИР (DEBOUNCE/THROTTLE) ==========
export const TIMING = {
  DEBOUNCE_SEARCH: 500, // 500ms барои ҷустуҷӯ
  DEBOUNCE_VALIDATION: 300, // 300ms барои валидатсия
  THROTTLE_SCROLL: 100, // 100ms барои скрол
  THROTTLE_RESIZE: 250, // 250ms барои тағйири андоза
  AUTO_SAVE_DRAFT: 5000, // 5 сония барои захираи худкор
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 дақиқа
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

// ========== РАНГҲОИ УМУМӢ ==========
export const COLORS = {
  PRIMARY: '#4F46E5', // Indigo 600
  SECONDARY: '#10B981', // Emerald 500
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6',
} as const;

// ========== КАЛИДҲОИ ТАНЗИМОТИ ОГОҲИҲО ==========
export const NOTIFICATION_EVENTS = {
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_STATUS_CHANGED: 'order:status_changed',
  COURIER_ASSIGNED: 'courier:assigned',
  COURIER_LOCATION: 'courier:location',
  PAYMENT_SUCCESS: 'payment:success',
  PAYMENT_FAILED: 'payment:failed',
  CHAT_MESSAGE: 'chat:message',
} as const;

// ========== СОКЕТ РӮЙДОДҲО ==========
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  ORDER_UPDATE: 'order:update',
  COURIER_LOCATION: 'courier:location',
  NOTIFICATION: 'notification',
  CHAT_MESSAGE: 'chat:message',
  JOIN_ORDER_ROOM: 'order:join',
  LEAVE_ORDER_ROOM: 'order:leave',
  TRACK_COURIER: 'courier:track',
  UNTRACK_COURIER: 'courier:untrack',
} as const;

// ========== ПАЁМҲОИ ХАТОГИИ УМУМӢ ==========
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Хатогии шабака. Лутфан пайвасти интернети худро тафтиш кунед.',
  SERVER_ERROR: 'Хатогии сервер. Лутфан баъдтар дубора кӯшиш кунед.',
  UNAUTHORIZED: 'Шумо ворид нашудаед. Лутфан аввал ворид шавед.',
  FORBIDDEN: 'Шумо ба ин бахш дастрасӣ надоред.',
  NOT_FOUND: 'Маълумот ёфт нашуд.',
  VALIDATION_ERROR: 'Маълумоти воридшуда нодуруст аст.',
  SESSION_EXPIRED: 'Сессияи шумо ба охир расид. Лутфан дубора ворид шавед.',
  UNKNOWN_ERROR: 'Хатогии номаълум рух дод. Лутфан дубора кӯшиш кунед.',
} as const;

// ========== ПАЁМҲОИ МУВАФФАҚИЯТ ==========
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Шумо бо муваффақият ворид шудед!',
  REGISTER_SUCCESS: 'Ҳисоби шумо бо муваффақият эҷод шуд! Лутфан email-и худро тасдиқ кунед.',
  LOGOUT_SUCCESS: 'Шумо аз система баромадед.',
  PROFILE_UPDATED: 'Профили шумо бо муваффақият навсозӣ шуд.',
  PASSWORD_CHANGED: 'Пароли шумо бо муваффақият тағйир дода шуд.',
  ORDER_CREATED: 'Фармоиши шумо бо муваффақият эҷод шуд!',
  ORDER_CANCELLED: 'Фармоиш бекор карда шуд.',
  PAYMENT_SUCCESS: 'Пардохт бо муваффақият анҷом ёфт!',
} as const;

// ========== МАЪЛУМОТИ ШАҲРҲОИ ТОҶИКИСТОН ==========
export const TAJIKISTAN_CITIES = [
  { id: 'dushanbe', name: 'Душанбе', region: 'Душанбе' },
  { id: 'khujand', name: 'Хуҷанд', region: 'Суғд' },
  { id: 'bokhtar', name: 'Бохтар', region: 'Хатлон' },
  { id: 'kulob', name: 'Кӯлоб', region: 'Хатлон' },
  { id: 'khorugh', name: 'Хоруғ', region: 'Бадахшон' },
  { id: 'tursunzoda', name: 'Турсунзода', region: 'Ноҳияҳои тобеи ҷумҳурӣ' },
  { id: 'vahdat', name: 'Ваҳдат', region: 'Ноҳияҳои тобеи ҷумҳурӣ' },
  { id: 'panjakent', name: 'Панҷакент', region: 'Суғд' },
  { id: 'istaravshan', name: 'Истаравшан', region: 'Суғд' },
  { id: 'konibodom', name: 'Конибодом', region: 'Суғд' },
  { id: 'isfara', name: 'Исфара', region: 'Суғд' },
  { id: 'guliston', name: 'Гулистон', region: 'Суғд' },
  { id: 'buston', name: 'Бӯстон', region: 'Суғд' },
] as const;

// ========== КОДҲОИ ОПЕРАТОРҲОИ МОБИЛӢ ДАР ТОҶИКИСТОН ==========
export const MOBILE_OPERATOR_CODES = [
  '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', // Tcell, Megafon, Beeline
  '50', '55', // Beeline
  '88', // Mobile
] as const;

// ========== АНДОЗАҲОИ ЭКРАН (BREAKPOINTS) ==========
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// ========== ЭКСПОРТИ ПЕШФАРЗ ==========
const constants = {
  APP_NAME,
  APP_VERSION,
  API_BASE_URL,
  STORAGE_KEYS,
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PACKAGE_TYPES,
  PACKAGE_TYPE_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  ROUTES,
  MAP_CONFIG,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TAJIKISTAN_CITIES,
};

export default constants;
