// config/constants.ts - Доимиҳои умумии лоиҳа
export const constants = {
  // Нақшҳои корбарон
  ROLES: {
    CLIENT: 'CLIENT',
    COURIER: 'COURIER',
    ADMIN: 'ADMIN',
    DISPATCHER: 'DISPATCHER',
  } as const,

  // Ҳолатҳои фармоиш
  ORDER_STATUS: {
    PENDING: 'PENDING',
    ASSIGNED: 'ASSIGNED',
    PICKED_UP: 'PICKED_UP',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
  } as const,

  // Ҳолатҳои пардохт
  PAYMENT_STATUS: {
    PENDING: 'PENDING',
    PAID: 'PAID',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED',
  } as const,

  // Масофаи максималӣ барои курьер (метр)
  MAX_COURIER_DISTANCE_METERS: 5000,

  // Вақти интизории қабули фармоиш аз ҷониби курьер (сония)
  ORDER_ASSIGN_TIMEOUT_SECONDS: 60,

  // Арзиши минималии фармоиш барои интиқоли ройгон
  FREE_DELIVERY_MIN_AMOUNT: 100000, // сомонӣ

  // Арзиши асосии интиқол
  BASE_DELIVERY_FEE: 15000,

  // Арзиш барои ҳар км иловагӣ
  COST_PER_KM: 3000,

  // Номи кэшҳо
  CACHE_KEYS: {
    COURIER_LOCATION_PREFIX: 'courier:location:',
    ORDER_PREFIX: 'order:',
    USER_SESSION_PREFIX: 'session:',
  },

  // Номи queueҳо
  QUEUE_NAMES: {
    NOTIFICATION: 'notification-queue',
    ORDER_ASSIGN: 'order-assign-queue',
    EMAIL: 'email-queue',
  },
} as const;

// Type барои истифода дар дигар ҷойҳо
export type OrderStatus = typeof constants.ORDER_STATUS[keyof typeof constants.ORDER_STATUS];
export type PaymentStatus = typeof constants.PAYMENT_STATUS[keyof typeof constants.PAYMENT_STATUS];
export type UserRole = typeof constants.ROLES[keyof typeof constants.ROLES];
