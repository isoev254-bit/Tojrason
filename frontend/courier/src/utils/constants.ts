// Tojrason/frontend/courier/src/utils/constants.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

// ========== МАЪЛУМОТИ УМУМИИ ЛОИҲА ==========
export const APP_NAME = 'Тоҷрасон Курйер';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Барнома барои курйерҳои Тоҷрасон';
export const APP_CONTACT_EMAIL = 'courier@tojrason.tj';
export const APP_CONTACT_PHONE = '+992 00 000 00 00';

// ========== ТАНЗИМОТИ API ==========
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const API_TIMEOUT = 30000;
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';

// ========== КАЛИДҲОИ LOCAL STORAGE ==========
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'courier_accessToken',
  REFRESH_TOKEN: 'courier_refreshToken',
  USER: 'courier_user',
  LANGUAGE: 'courier_language',
  THEME: 'courier_theme',
  REMEMBERED_EMAIL: 'courier_rememberedEmail',
  ONBOARDING_COMPLETED: 'courier_onboarding_completed',
  SETTINGS: 'courier_settings',
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
  [ORDER_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [ORDER_STATUS.ACCEPTED]: 'bg-blue-100 text-blue-800',
  [ORDER_STATUS.PICKUP]: 'bg-indigo-100 text-indigo-800',
  [ORDER_STATUS.IN_TRANSIT]: 'bg-purple-100 text-purple-800',
  [ORDER_STATUS.ARRIVING]: 'bg-orange-100 text-orange-800',
  [ORDER_STATUS.DELIVERED]: 'bg-green-100 text-green-800',
  [ORDER_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
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

export const COURIER_STATUS_COLORS: Record<CourierStatus, string> = {
  [COURIER_STATUS.OFFLINE]: 'bg-gray-100 text-gray-800',
  [COURIER_STATUS.ONLINE]: 'bg-green-100 text-green-800',
  [COURIER_STATUS.ON_DELIVERY]: 'bg-blue-100 text-blue-800',
  [COURIER_STATUS.BREAK]: 'bg-yellow-100 text-yellow-800',
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

// ========== УСУЛҲОИ ПАРДОХТ ==========
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  WALLET: 'wallet',
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

// ========== МАСИРҲОИ ЛОИҲА ==========
export const ROUTES = {
  // Саҳифаҳои умумӣ
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  NOT_FOUND: '/404',
  
  // Саҳифаҳои асосии курйер
  DASHBOARD: '/dashboard',
  
  // Фармоишҳо
  ORDERS: '/orders',
  AVAILABLE_ORDERS: '/orders/available',
  MY_ORDERS: '/orders/my',
  CURRENT_ORDER: '/current-order',
  ORDER_DETAILS: '/orders/:orderId',
  
  // Харита
  MAP: '/map',
  
  // Омор
  STATS: '/stats',
  EARNINGS: '/earnings',
  
  // Профил
  PROFILE: '/profile',
  EDIT_PROFILE: '/profile/edit',
  CHANGE_PASSWORD: '/profile/change-password',
  DOCUMENTS: '/profile/documents',
  VEHICLE: '/profile/vehicle',
  WORK_SCHEDULE: '/work-schedule',
  SETTINGS: '/settings',
  
  // Чат
  CHAT: '/chat',
  CHAT_ROOM: '/chat/:orderId',
} as const;

// ========== ТАНЗИМОТИ ХАРИТА ==========
export const MAP_CONFIG = {
  DEFAULT_CENTER: [38.5613, 68.7840] as [number, number], // Душанбе
  DEFAULT_ZOOM: 13,
  MIN_ZOOM: 8,
  MAX_ZOOM: 18,
  TILE_LAYER_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
} as const;

// ========== ТАНЗИМОТИ ПАЙГИРӢ ==========
export const TRACKING_CONFIG = {
  LOCATION_UPDATE_INTERVAL: 5000, // 5 сония
  LOCATION_UPDATE_DISTANCE: 10, // 10 метр
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
} as const;

// ========== ТАНЗИМОТИ PAGINATION ==========
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [10, 20, 50],
} as const;

// ========== ВАҚТҲОИ ТАЪХИР ==========
export const TIMING = {
  DEBOUNCE_SEARCH: 300,
  DEBOUNCE_VALIDATION: 300,
  AUTO_REFRESH_ORDERS: 30000, // 30 сония
  AUTO_SYNC_LOCATION: 5000, // 5 сония
  ORDER_REQUEST_TIMEOUT: 60000, // 60 сония - вақти қабули фармоиш
  SHIFT_AUTO_END: 12 * 60 * 60 * 1000, // 12 соат
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
  PRIMARY: '#10B981', // Emerald 500
  SECONDARY: '#3B82F6', // Blue 500
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6',
} as const;

// ========== КАЛИДҲОИ ТАНЗИМОТИ ОГОҲИҲО ==========
export const NOTIFICATION_EVENTS = {
  NEW_ORDER: 'new_order',
  ORDER_ACCEPTED: 'order_accepted',
  ORDER_CANCELLED: 'order_cancelled',
  ORDER_UPDATE: 'order_update',
  EARNINGS_UPDATE: 'earnings_update',
  SHIFT_REMINDER: 'shift_reminder',
} as const;

// ========== СОКЕТ РӮЙДОДҲО ==========
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  
  // Курйер
  COURIER_JOIN: 'courier:join',
  COURIER_LEAVE: 'courier:leave',
  COURIER_STATUS_UPDATE: 'courier:status_update',
  COURIER_LOCATION_UPDATE: 'courier:location_update',
  
  // Фармоишҳо
  NEW_ORDER: 'courier:new_order',
  ORDER_ACCEPTED: 'courier:order_accepted',
  ORDER_CANCELLED: 'courier:order_cancelled',
  ORDER_UPDATE: 'order:update',
  
  // Даромад
  EARNINGS_UPDATE: 'courier:earnings_update',
  
  // Чат ва огоҳиҳо
  NOTIFICATION: 'notification',
  CHAT_MESSAGE: 'chat:message',
} as const;

// ========== ПАЁМҲОИ ХАТОГИИ УМУМӢ ==========
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Хатогии шабака. Лутфан пайвасти интернети худро тафтиш кунед.',
  SERVER_ERROR: 'Хатогии сервер. Лутфан баъдтар дубора кӯшиш кунед.',
  UNAUTHORIZED: 'Шумо ворид нашудаед. Лутфан аввал ворид шавед.',
  FORBIDDEN: 'Шумо ба ин бахш дастрасӣ надоред.',
  NOT_FOUND: 'Маълумот ёфт нашуд.',
  SESSION_EXPIRED: 'Сессияи шумо ба охир расид. Лутфан дубора ворид шавед.',
  LOCATION_DENIED: 'Дастрасӣ ба макон рад карда шуд. Лутфан GPS-ро фаъол кунед.',
  LOCATION_UNAVAILABLE: 'Макони шумо дастрас нест. Лутфан дубора кӯшиш кунед.',
  DOCUMENT_UPLOAD_FAILED: 'Боргузории ҳуҷҷат ноком шуд. Лутфан дубора кӯшиш кунед.',
  ORDER_ALREADY_ACCEPTED: 'Ин фармоиш аллакай аз ҷониби курйери дигар қабул шудааст.',
} as const;

// ========== ПАЁМҲОИ МУВАФФАҚИЯТ ==========
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Шумо бо муваффақият ворид шудед!',
  REGISTER_SUCCESS: 'Ҳисоби курйерии шумо бо муваффақият эҷод шуд!',
  LOGOUT_SUCCESS: 'Шумо аз система баромадед.',
  PROFILE_UPDATED: 'Профили шумо бо муваффақият навсозӣ шуд.',
  PASSWORD_CHANGED: 'Пароли шумо бо муваффақият тағйир дода шуд.',
  ORDER_ACCEPTED: 'Фармоиш бо муваффақият қабул карда шуд!',
  ORDER_DELIVERED: 'Фармоиш бо муваффақият расонида шуд!',
  DOCUMENT_UPLOADED: 'Ҳуҷҷат бо муваффақият боргузорӣ шуд.',
  SHIFT_STARTED: 'Смена оғоз шуд. Ҳоло шумо онлайн ҳастед.',
  SHIFT_ENDED: 'Смена анҷом ёфт.',
} as const;

// ========== ТАНЗИМОТИ ПЕШФАРЗИ КУРЙЕР ==========
export const DEFAULT_COURIER_SETTINGS = {
  maxDistance: 10, // км
  preferredAreas: [],
  autoAccept: false,
  notifications: {
    newOrder: true,
    orderUpdate: true,
    earnings: true,
    promotions: false,
    sound: true,
    vibration: true,
  },
  workSchedule: [
    { day: 'monday', isWorking: true, startTime: '09:00', endTime: '18:00' },
    { day: 'tuesday', isWorking: true, startTime: '09:00', endTime: '18:00' },
    { day: 'wednesday', isWorking: true, startTime: '09:00', endTime: '18:00' },
    { day: 'thursday', isWorking: true, startTime: '09:00', endTime: '18:00' },
    { day: 'friday', isWorking: true, startTime: '09:00', endTime: '18:00' },
    { day: 'saturday', isWorking: false, startTime: '09:00', endTime: '18:00' },
    { day: 'sunday', isWorking: false, startTime: '09:00', endTime: '18:00' },
  ],
  language: 'tg',
  darkMode: false,
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
  COURIER_STATUS,
  COURIER_STATUS_LABELS,
  COURIER_STATUS_COLORS,
  VEHICLE_TYPES,
  VEHICLE_TYPE_LABELS,
  PACKAGE_TYPES,
  PACKAGE_TYPE_LABELS,
  ROUTES,
  MAP_CONFIG,
  TRACKING_CONFIG,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DEFAULT_COURIER_SETTINGS,
  SOCKET_EVENTS,
  TIMING,
};

export default constants;
