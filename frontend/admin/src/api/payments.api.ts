<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>payments.api.ts</title>
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
// frontend/admin/src/api/payments.api.ts - API барои пардохтҳо
import { api } from './axios.config';

// Типҳо
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'stripe' | 'cash';

export interface Payment {
    id: string;
    orderId: string;
    userId: string;
    amount: number;
    currency: string;
    method: PaymentMethod;
    status: PaymentStatus;
    providerPaymentId?: string;
    clientSecret?: string;
    metadata?: Record&lt;string, any&gt;;
    createdAt: string;
    updatedAt: string;
    paidAt?: string;
    refundedAt?: string;
}

export interface PaymentResponse {
    id: string;
    orderId: string;
    amount: number;
    currency: string;
    method: PaymentMethod;
    status: PaymentStatus;
    createdAt: string;
    paidAt?: string;
}

export interface CreatePaymentRequest {
    orderId: string;
    method: PaymentMethod;
    successUrl?: string;
    cancelUrl?: string;
}

export interface CreatePaymentResponse {
    success: boolean;
    paymentId: string;
    clientSecret?: string;
    redirectUrl?: string;
    status: string;
}

export interface RefundPaymentRequest {
    paymentId: string;
    amount?: number;
    reason?: string;
}

export interface PaymentFilters {
    orderId?: string;
    userId?: string;
    status?: PaymentStatus;
    method?: PaymentMethod;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedPayments {
    data: Payment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// API методҳо
export const paymentsApi = {
    /**
     * Эҷоди пардохт барои фармоиш
     * @param data - Маълумоти пардохт
     * @returns Натиҷаи эҷоди пардохт
     */
    createPayment: async (data: CreatePaymentRequest): Promise&lt;{ success: boolean; data: CreatePaymentResponse }&gt; => {
        const response = await api.post&lt;{ success: boolean; data: CreatePaymentResponse }&gt;('/payments/create', data);
        return response;
    },

    /**
     * Тасдиқи пардохт (пас аз бозгашт аз провайдер)
     * @param paymentId - ID пардохт
     * @param providerPaymentId - ID аз провайдер
     * @returns Натиҷаи тасдиқ
     */
    confirmPayment: async (paymentId: string, providerPaymentId?: string): Promise&lt;{ success: boolean; data: Payment }&gt; => {
        const response = await api.post&lt;{ success: boolean; data: Payment }&gt;('/payments/confirm', { paymentId, providerPaymentId });
        return response;
    },

    /**
     * Бозгардонидани пардохт (refund)
     * @param data - Маълумоти бозгардон
     * @returns Натиҷаи бозгардон
     */
    refundPayment: async (data: RefundPaymentRequest): Promise&lt;{ success: boolean; message: string }&gt; => {
        const response = await api.post&lt;{ success: boolean; message: string }&gt;('/payments/refund', data);
        return response;
    },

    /**
     * Гирифтани ҳолати пардохт
     * @param paymentId - ID пардохт
     * @returns Ҳолати пардохт
     */
    getPaymentStatus: async (paymentId: string): Promise&lt;{ success: boolean; data: Payment }&gt; => {
        const response = await api.get&lt;{ success: boolean; data: Payment }&gt;(`/payments/status/${paymentId}`);
        return response;
    },

    /**
     * Гирифтани ҳамаи пардохтҳо (танҳо ADMIN)
     * @param params - Филтрҳо
     * @returns Рӯйхати пардохтҳо бо саҳифабандӣ
     */
    getAllPayments: async (params?: PaymentFilters): Promise&lt;{ success: boolean; data: PaginatedPayments }&gt; => {
        const response = await api.get&lt;{ success: boolean; data: PaginatedPayments }&gt;('/payments', params);
        return response;
    },

    /**
     * Гирифтани пардохтҳои корбари ҷорӣ
     * @param params - Филтрҳо
     * @returns Рӯйхати пардохтҳо
     */
    getMyPayments: async (params?: Omit&lt;PaymentFilters, 'userId'&gt;): Promise&lt;{ success: boolean; data: PaginatedPayments }&gt; => {
        const response = await api.get&lt;{ success: boolean; data: PaginatedPayments }&gt;('/payments/my-payments', params);
        return response;
    },

    /**
     * Гирифтани пардохтҳои фармоиш
     * @param orderId - ID фармоиш
     * @returns Рӯйхати пардохтҳои фармоиш
     */
    getPaymentsByOrder: async (orderId: string): Promise&lt;{ success: boolean; data: Payment[] }&gt; => {
        const response = await api.get&lt;{ success: boolean; data: Payment[] }&gt;(`/payments/order/${orderId}`);
        return response;
    },
};

export default paymentsApi;
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
