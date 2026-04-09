<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>orders.api.ts</title>
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
// frontend/admin/src/api/orders.api.ts - API барои идоракунии фармоишҳо
import { api } from './axios.config';

// Типҳо
export type OrderStatus = 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface Order {
    id: string;
    clientId: string;
    courierId: string | null;
    pickupAddress: string;
    pickupLat: number;
    pickupLng: number;
    deliveryAddress: string;
    deliveryLat: number;
    deliveryLng: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    amount: number;
    deliveryFee: number;
    totalAmount: number;
    clientNote?: string | null;
    courierNote?: string | null;
    assignedAt?: string | null;
    pickedUpAt?: string | null;
    deliveredAt?: string | null;
    cancelledAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrderRequest {
    pickupAddress: string;
    pickupLat: number;
    pickupLng: number;
    deliveryAddress: string;
    deliveryLat: number;
    deliveryLng: number;
    amount: number;
    clientNote?: string;
}

export interface UpdateOrderRequest {
    status?: OrderStatus;
    courierId?: string | null;
    courierNote?: string;
}

export interface OrderFilters {
    clientId?: string;
    courierId?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedOrders {
    data: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// API методҳо
export const ordersApi = {
    /**
     * Эҷоди фармоиши нав
     * @param data - Маълумоти фармоиш
     * @returns Фармоиши эҷодшуда
     */
    createOrder: async (data: CreateOrderRequest): Promise&lt;{ success: boolean; data: Order }&gt; => {
        const response = await api.post&lt;{ success: boolean; data: Order }&gt;('/orders', data);
        return response;
    },

    /**
     * Гирифтани ҳамаи фармоишҳо (бо филтр)
     * @param params - Филтрҳо барои ҷустуҷӯ
     * @returns Рӯйхати фармоишҳо бо саҳифабандӣ
     */
    getAllOrders: async (params?: OrderFilters): Promise&lt;{ success: boolean; data: PaginatedOrders }&gt; => {
        const response = await api.get&lt;{ success: boolean; data: PaginatedOrders }&gt;('/orders', params);
        return response;
    },

    /**
     * Гирифтани фармоишҳои клиенти ҷорӣ
     * @param params - Филтрҳо
     * @returns Рӯйхати фармоишҳои клиент
     */
    getMyOrders: async (params?: Omit&lt;OrderFilters, 'clientId'&gt;): Promise&lt;{ success: boolean; data: PaginatedOrders }&gt; => {
        const response = await api.get&lt;{ success: boolean; data: PaginatedOrders }&gt;('/orders/my-orders', params);
        return response;
    },

    /**
     * Гирифтани фармоишҳои курьери ҷорӣ
     * @param params - Филтрҳо
     * @returns Рӯйхати фармоишҳои курьер
     */
    getMyCourierOrders: async (params?: Omit&lt;OrderFilters, 'courierId'&gt;): Promise&lt;{ success: boolean; data: PaginatedOrders }&gt; => {
        const response = await api.get&lt;{ success: boolean; data: PaginatedOrders }&gt;('/orders/my-courier-orders', params);
        return response;
    },

    /**
     * Гирифтани фармоиш бо ID
     * @param id - ID фармоиш
     * @returns Маълумоти фармоиш
     */
    getOrderById: async (id: string): Promise&lt;{ success: boolean; data: Order }&gt; => {
        const response = await api.get&lt;{ success: boolean; data: Order }&gt;(`/orders/${id}`);
        return response;
    },

    /**
     * Навсозии статуси фармоиш
     * @param id - ID фармоиш
     * @param status - Статуси нав
     * @returns Фармоиши навсозӣшуда
     */
    updateOrderStatus: async (id: string, status: OrderStatus): Promise&lt;{ success: boolean; data: Order }&gt; => {
        const response = await api.patch&lt;{ success: boolean; data: Order }&gt;(`/orders/${id}/status`, { status });
        return response;
    },

    /**
     * Таъин кардани курьер ба фармоиш (танҳо ADMIN/DISPATCHER)
     * @param id - ID фармоиш
     * @param courierId - ID курьер
     * @returns Фармоиши навсозӣшуда
     */
    assignCourier: async (id: string, courierId: string): Promise&lt;{ success: boolean; data: Order }&gt; => {
        const response = await api.patch&lt;{ success: boolean; data: Order }&gt;(`/orders/${id}/assign`, { courierId });
        return response;
    },

    /**
     * Бекор кардани фармоиш
     * @param id - ID фармоиш
     * @returns Фармоиши бекоршуда
     */
    cancelOrder: async (id: string): Promise&lt;{ success: boolean; data: Order }&gt; => {
        const response = await api.post&lt;{ success: boolean; data: Order }&gt;(`/orders/${id}/cancel`, {});
        return response;
    },
};

export default ordersApi;
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
