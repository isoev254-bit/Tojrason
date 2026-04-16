<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>constants.ts</title>
    <style>
        .code-container {
            background-color: #1e1e1e;
            color: #d4d4d4;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            position: relative;
            margin: 20px 0;
        }
        .copy-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background-color: #007acc;
            color: white;
            border: none;
            padding: 5px 12px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
        }
        .copy-btn:hover {
            background-color: #005a9e;
        }
        pre {
            margin: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
    </style>
</head>
<body>
<div class="code-container">
    <button class="copy-btn" onclick="copyCode()">Копия кардан</button>
    <pre id="codeBlock">
// frontend/admin/src/utils/constants.ts

// ============================================
// Нақшҳои корбарон
// ============================================
export const USER_ROLES = {
    CLIENT: 'CLIENT',
    COURIER: 'COURIER',
    ADMIN: 'ADMIN',
    DISPATCHER: 'DISPATCHER',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// ============================================
// Ҳолатҳои фармоиш
// ============================================
export const ORDER_STATUS = {
    PENDING: 'PENDING',
    ASSIGNED: 'ASSIGNED',
    PICKED_UP: 'PICKED_UP',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    [ORDER_STATUS.PENDING]: 'Интизорӣ',
    [ORDER_STATUS.ASSIGNED]: 'Таъин шуд',
    [ORDER_STATUS.PICKED_UP]: 'Гирифта шуд',
    [ORDER_STATUS.DELIVERED]: 'Расонида шуд',
    [ORDER_STATUS.CANCELLED]: 'Бекор шуд',
};

// ============================================
// Ҳолатҳои пардохт
// ============================================
export const PAYMENT_STATUS = {
    PENDING: 'PENDING',
    PAID: 'PAID',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
    [PAYMENT_STATUS.PENDING]: 'Интизорӣ',
    [PAYMENT_STATUS.PAID]: 'Пардохт шуд',
    [PAYMENT_STATUS.FAILED]: 'Ноком',
    [PAYMENT_STATUS.REFUNDED]: 'Бозгардон',
};

// ============================================
// Усулҳои пардохт
// ============================================
export const PAYMENT_METHODS = {
    STRIPE: 'stripe',
    CASH: 'cash',
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    [PAYMENT_METHODS.STRIPE]: 'Stripe',
    [PAYMENT_METHODS.CASH]: 'Нақдӣ',
};

// ============================================
// Танзимоти саҳифабандӣ
// ============================================
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ============================================
// Форматҳо
// ============================================
export const DATE_FORMAT = 'dd.MM.yyyy';
export const DATE_TIME_FORMAT = 'dd.MM.yyyy HH:mm';
export const TIME_FORMAT = 'HH:mm';

// ============================================
// Мавзӯъҳо (Theme)
// ============================================
export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
} as const;

// ============================================
// Танзимоти API
// ============================================
export const API_TIMEOUT = 30000; // 30 сония
export const REFRESH_TOKEN_INTERVAL = 10 * 60 * 1000; // 10 дақиқа

// ============================================
// Роутҳои асосӣ
// ============================================
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    DASHBOARD: '/',
    USERS: '/users',
    ORDERS: '/orders',
    COURIERS: '/couriers',
    PAYMENTS: '/payments',
    REPORTS: '/reports',
    SETTINGS: '/settings',
    NOT_FOUND: '/404',
} as const;

// ============================================
// Танзимоти харита (Leaflet)
// ============================================
export const DEFAULT_MAP_CENTER: [number, number] = [38.5598, 68.774]; // Душанбе
export const DEFAULT_MAP_ZOOM = 13;
export const COURIER_UPDATE_INTERVAL = 5000; // 5 сония

// ============================================
// Арзишҳои пешфарзи интиқол
// ============================================
export const BASE_DELIVERY_FEE = 15000;
export const FREE_DELIVERY_MIN_AMOUNT = 100000;
export const COST_PER_KM = 3000;

// ============================================
// Матнҳои умумӣ
// ============================================
export const APP_NAME = 'Tojrason';
export const APP_DESCRIPTION = 'Системаи интиқоли бор';
    </pre>
</div>
<script>
function copyCode() {
    const code = document.getElementById('codeBlock').innerText;
    navigator.clipboard.writeText(code).then(() => {
        alert('✅ Код копия карда шуд!');
    }).catch(() => {
        alert('❌ Хатогӣ ҳангоми копия кардан');
    });
}
</script>
</body>
</html>
