<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>providers/index.ts</title>
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
// modules/payment/providers/index.ts - Интерфейс ва фабрикаи провайдерҳои пардохт
import { StripeProvider } from './stripe';
import { LocalPaymentProvider } from './local';

export interface CreatePaymentParams {
    orderId: string;
    amount: number;
    currency: string;
    successUrl?: string;
    cancelUrl?: string;
    customerEmail?: string;
}

export interface PaymentResult {
    success: boolean;
    paymentId: string;
    status: string; // 'pending', 'succeeded', 'failed', 'refunded', etc.
    orderId: string;
    clientSecret?: string;   // барои Stripe
    redirectUrl?: string;     // барои дигар провайдерҳо
    errorMessage?: string;
    provider: string;
    message?: string;
}

export interface PaymentProvider {
    name: string;
    createPayment(params: CreatePaymentParams): Promise&lt;PaymentResult&gt;;
    confirmPayment(paymentId: string): Promise&lt;PaymentResult&gt;;
    refundPayment(paymentId: string, amount?: number): Promise&lt;PaymentResult&gt;;
    getPaymentStatus(paymentId: string): Promise&lt;PaymentResult&gt;;
}

export class PaymentProviderFactory {
    private providers: Map&lt;string, PaymentProvider&gt; = new Map();

    constructor() {
        // Бақайдгирии провайдерҳои дастрас
        this.providers.set('stripe', new StripeProvider());
        this.providers.set('cash', new LocalPaymentProvider());
    }

    getProvider(method: string): PaymentProvider {
        const provider = this.providers.get(method);
        if (!provider) {
            throw new Error(`Провайдери пардохт барои усули "${method}" ёфт нашуд. Усулҳои дастрас: ${Array.from(this.providers.keys()).join(', ')}`);
        }
        return provider;
    }

    registerProvider(method: string, provider: PaymentProvider): void {
        this.providers.set(method, provider);
    }
}

// Экспорти провайдерҳо барои истифодаи мустақим (агар лозим бошад)
export { StripeProvider, LocalPaymentProvider };
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
