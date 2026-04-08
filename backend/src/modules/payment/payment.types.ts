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
// modules/payment/payment.types.ts - Type'ҳои махсуси модули пардохт
import { PaymentStatus } from '../../config/constants';

// Маълумоти пардохт дар система
export interface Payment {
    id: string;
    orderId: string;
    userId: string;
    amount: number;
    currency: string;
    method: string;          // stripe, cash
    status: PaymentStatus;
    providerPaymentId?: string;   // ID дар провайдер (stripe payment intent id)
    clientSecret?: string;        // барои Stripe
    metadata?: Record&lt;string, any&gt;;
    createdAt: Date;
    updatedAt: Date;
    paidAt?: Date;
    refundedAt?: Date;
}

// Маълумот барои эҷоди пардохт дар БД
export interface CreatePaymentData {
    orderId: string;
    userId: string;
    amount: number;
    currency: string;
    method: string;
    providerPaymentId?: string;
    clientSecret?: string;
    metadata?: Record&lt;string, any&gt;;
}

// Навсозии пардохт
export interface UpdatePaymentData {
    status?: PaymentStatus;
    providerPaymentId?: string;
    clientSecret?: string;
    paidAt?: Date;
    refundedAt?: Date;
    metadata?: Record&lt;string, any&gt;;
}

// Ҷавоби пардохт барои клиент
export interface PaymentResponse {
    id: string;
    orderId: string;
    amount: number;
    currency: string;
    method: string;
    status: PaymentStatus;
    createdAt: Date;
    paidAt?: Date;
}

// Маълумот барои дархости пардохт аз клиент
export interface PaymentRequest {
    orderId: string;
    method: 'stripe' | 'cash';
    successUrl?: string;
    cancelUrl?: string;
}
    </pre>
</div>
<script>
function copyCode() {
    const code = document.getElementById('codeBlock').innerText;
    navigator.clipboard.writeText(code).then(() => {
        alert('Код копия карда шуд!');
    }).catch(() => {
        alert('Хатогӣ ҳангоми копия кардан');
    });
}
</script>
</body>
</html>
