<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>payment.types.ts</title>
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
// frontend/admin/src/types/payment.types.ts
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
