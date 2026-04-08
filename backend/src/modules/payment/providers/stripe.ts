<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>stripe.ts</title>
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
// modules/payment/providers/stripe.ts - Провайдери пардохт бо Stripe
import Stripe from 'stripe';
import { PaymentProvider, PaymentResult, CreatePaymentParams } from './index';
import { env } from '../../../config/env';
import logger from '../../../config/logger';

export class StripeProvider implements PaymentProvider {
    name = 'stripe';
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
        });
    }

    /**
     * Эҷоди пардохт (Intents) барои Stripe
     */
    async createPayment(params: CreatePaymentParams): Promise&lt;PaymentResult&gt; {
        try {
            const amountInCent = Math.round(params.amount * 100); // ба сент (барои TJS ё дигар валюта)
            
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: amountInCent,
                currency: params.currency.toLowerCase(),
                metadata: {
                    orderId: params.orderId,
                },
                receipt_email: params.customerEmail,
            });

            return {
                success: true,
                paymentId: paymentIntent.id,
                clientSecret: paymentIntent.client_secret || undefined,
                status: this.mapStatus(paymentIntent.status),
                orderId: params.orderId,
                redirectUrl: undefined,
                provider: this.name,
            };
        } catch (error: any) {
            logger.error(`Stripe createPayment error: ${error.message}`);
            return {
                success: false,
                paymentId: '',
                status: 'failed',
                orderId: params.orderId,
                errorMessage: error.message,
                provider: this.name,
            };
        }
    }

    /**
     * Тасдиқи пардохт (пас аз webhook ё бозгашти клиент)
     */
    async confirmPayment(paymentId: string): Promise&lt;PaymentResult&gt; {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);
            const status = this.mapStatus(paymentIntent.status);
            const orderId = paymentIntent.metadata?.orderId || '';

            return {
                success: status === 'succeeded',
                paymentId: paymentIntent.id,
                status,
                orderId,
                provider: this.name,
            };
        } catch (error: any) {
            logger.error(`Stripe confirmPayment error: ${error.message}`);
            return {
                success: false,
                paymentId,
                status: 'failed',
                orderId: '',
                errorMessage: error.message,
                provider: this.name,
            };
        }
    }

    /**
     * Бозгардонидани маблағ (refund)
     */
    async refundPayment(paymentId: string, amount?: number): Promise&lt;PaymentResult&gt; {
        try {
            const refundParams: Stripe.RefundCreateParams = {
                payment_intent: paymentId,
            };
            if (amount !== undefined) {
                refundParams.amount = Math.round(amount * 100);
            }
            const refund = await this.stripe.refunds.create(refundParams);
            
            return {
                success: refund.status === 'succeeded',
                paymentId: paymentId,
                status: 'refunded',
                orderId: '', // метавон аз metadata гирифт, агар лозим бошад
                provider: this.name,
            };
        } catch (error: any) {
            logger.error(`Stripe refundPayment error: ${error.message}`);
            return {
                success: false,
                paymentId,
                status: 'failed',
                errorMessage: error.message,
                provider: this.name,
            };
        }
    }

    /**
     * Гирифтани ҳолати пардохт
     */
    async getPaymentStatus(paymentId: string): Promise&lt;PaymentResult&gt; {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);
            return {
                success: true,
                paymentId,
                status: this.mapStatus(paymentIntent.status),
                orderId: paymentIntent.metadata?.orderId || '',
                provider: this.name,
            };
        } catch (error: any) {
            logger.error(`Stripe getPaymentStatus error: ${error.message}`);
            return {
                success: false,
                paymentId,
                status: 'failed',
                errorMessage: error.message,
                provider: this.name,
            };
        }
    }

    /**
     * Коркарди webhook аз Stripe (барои тасдиқи автоматии пардохт)
     */
    async handleWebhook(event: Stripe.Event): Promise&lt;PaymentResult&gt; {
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                return {
                    success: true,
                    paymentId: paymentIntent.id,
                    status: 'succeeded',
                    orderId: paymentIntent.metadata?.orderId || '',
                    provider: this.name,
                };
            case 'payment_intent.payment_failed':
                const failedIntent = event.data.object as Stripe.PaymentIntent;
                return {
                    success: false,
                    paymentId: failedIntent.id,
                    status: 'failed',
                    orderId: failedIntent.metadata?.orderId || '',
                    errorMessage: failedIntent.last_payment_error?.message,
                    provider: this.name,
                };
            default:
                return {
                    success: false,
                    paymentId: '',
                    status: 'unknown',
                    orderId: '',
                    provider: this.name,
                };
        }
    }

    private mapStatus(stripeStatus: string): string {
        const map: Record&lt;string, string&gt; = {
            requires_payment_method: 'pending',
            requires_confirmation: 'pending',
            requires_action: 'pending',
            processing: 'processing',
            succeeded: 'succeeded',
            canceled: 'canceled',
        };
        return map[stripeStatus] || stripeStatus;
    }
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
