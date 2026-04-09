<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>api/index.ts</title>
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
// frontend/admin/src/api/index.ts - Экспорти ҳамаи API-ҳо
export { default as authApi } from './auth.api';
export { default as usersApi } from './users.api';
export { default as ordersApi } from './orders.api';
export { default as couriersApi } from './couriers.api';
export { default as paymentsApi } from './payments.api';
export { axiosInstance, api } from './axios.config';

// Экспорти типҳо
export type {
    LoginRequest,
    RegisterRequest,
    UserResponse,
    AuthResponse,
} from './auth.api';

export type {
    User,
    UserRole,
    UpdateUserRequest,
    UpdatePasswordRequest,
    UserFilters,
    PaginatedUsers,
} from './users.api';

export type {
    Order,
    OrderStatus,
    PaymentStatus as OrderPaymentStatus,
    CreateOrderRequest,
    UpdateOrderRequest,
    OrderFilters,
    PaginatedOrders,
} from './orders.api';

export type {
    CourierStats,
    CourierLocation,
    UpdateLocationRequest,
    CourierOrderResponse,
} from './couriers.api';

export type {
    Payment,
    PaymentStatus,
    PaymentMethod,
    CreatePaymentRequest,
    CreatePaymentResponse,
    RefundPaymentRequest,
    PaymentFilters,
    PaginatedPayments,
} from './payments.api';
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
