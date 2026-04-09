<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>couriers.api.ts</title>
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
// frontend/admin/src/api/couriers.api.ts - API барои идоракунии курьерҳо
import { api } from './axios.config';
import { User } from './users.api';

// Типҳои махсуси курьер
export interface CourierStats {
    courierId: string;
    totalDelivered: number;
    totalEarnings: number;
    activeOrdersCount: number;
    rating: number;
}

export interface CourierLocation {
    courierId: string;
    lat: number;
    lng: number;
    updatedAt: string;
}

export interface UpdateLocationRequest {
    lat: number;
    lng: number;
    isAvailable?: boolean;
}

export interface CourierOrderResponse {
    id: string;
    pickupAddress: string;
    pickupLat: number;
    pickupLng: number;
    deliveryAddress: string;
    amount: number;
    deliveryFee: number;
    totalAmount: number;
    distance?: number;
    client: {
        fullName: string;
        phone: string;
    };
    createdAt: string;
}

// API методҳо
export const couriersApi = {
    /**
     * Навсозии ҷойгиршавии курьер (танҳо COURIER)
     * @param data - Маълумоти ҷойгиршавӣ
     * @returns Натиҷа
     */
    updateLocation: async (data: UpdateLocationRequest): Promise&lt;{ success: boolean; message: string }&gt; => {
        const response = await api.put&lt;{ success: boolean; message: string }&gt;('/courier/location', data);
        return response;
    },

    /**
     * Гирифтани профили курьер
     * @returns Маълумоти курьер
     */
    getProfile: async (): Promise&lt;{ success: boolean; data: User }&gt; => {
        const response = await api.get&lt;{ success: boolean; data: User }&gt;('/courier/profile');
        return response;
    },

    /**
     * Гирифтани омори курьер
     * @returns Омори курьер
     */
    getStats: async (): Promise&lt;{ success: boolean; data: CourierStats }&gt; => {
        const response = await api.get&lt;{ success: boolean; data: CourierStats }&gt;('/courier/stats');
        return response;
    },

    /**
     * Қабули фармоиш аз ҷониби курьер
     * @param orderId - ID фармоиш
     * @returns Натиҷа
     */
    acceptOrder: async (orderId: string): Promise&lt;{ success: boolean; message: string }&gt; => {
        const response = await api.post&lt;{ success: boolean; message: string }&gt;(`/courier/orders/${orderId}/accept`, {});
        return response;
    },

    /**
     * Тамом кардани фармоиш (расонида шуд)
     * @param orderId - ID фармоиш
     * @returns Натиҷа
     */
    completeOrder: async (orderId: string): Promise&lt;{ success: boolean; message: string }&gt; => {
        const response = await api.post&lt;{ success: boolean; message: string }&gt;(`/courier/orders/${orderId}/complete`, {});
        return response;
    },

    /**
     * Гирифтани фармоишҳои дастраси наздик
     * @param radius - Радиус ҷустуҷӯ (метр)
     * @returns Рӯйхати фармоишҳои дастрас
     */
    getAvailableOrders: async (radius?: number): Promise&lt;{ success: boolean; data: CourierOrderResponse[] }&gt; => {
        const response = await api.get&lt;{ success: boolean; data: CourierOrderResponse[] }&gt;('/courier/available-orders', { radius });
        return response;
    },

    /**
     * Гирифтани фармоиши ҷории курьер
     * @returns Фармоиши фаъол
     */
    getCurrentOrder: async (): Promise&lt;{ success: boolean; data: CourierOrderResponse | null }&gt; => {
        const response = await api.get&lt;{ success: boolean; data: CourierOrderResponse | null }&gt;('/courier/current-order');
        return response;
    },

    /**
     * Гирифтани ҳамаи курьерҳо (барои админ)
     * @returns Рӯйхати курьерҳо
     */
    getAllCouriers: async (): Promise&lt;{ success: boolean; data: User[] }&gt; => {
        const response = await api.get&lt;{ success: boolean; data: User[] }&gt;('/couriers');
        return response;
    },
};

export default couriersApi;
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
