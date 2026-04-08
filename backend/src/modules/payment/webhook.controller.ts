<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>webhook.controller.ts</title>
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
// modules/payment/webhook.controller.ts - Коркарди webhook аз провайдерҳои пардохт (Stripe ва ғ.)
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { env } from '../../config/env';
import { PaymentService } from './payment.service';
import { StripeProvider } from './providers/stripe';
import logger from '../../config/logger';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});
const paymentService = new PaymentService();
const stripeProvider = new StripeProvider();

export class WebhookController {
    /**
     * Коркарди webhook аз Stripe
     * Ин методро дар роути /api/payment/webhook/stripe ҷойгир кунед
     */
    static async handleStripeWebhook(req: Request, res: Response): Promise&lt;void&gt; {
        const sig = req.headers['stripe-signature'] as string;
        const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

        if (!webhookSecret) {
            logger.error('STRIPE_WEBHOOK_SECRET not configured');
            res.status(500).send('Webhook secret not configured');
            return;
        }

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } catch (err: any) {
            logger.error(`Stripe webhook signature verification failed: ${err.message}`);
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }

        // Коркарди рӯйдодҳои гуногун
        try {
            const result = await stripeProvider.handleWebhook(event);
            
            if (result.success && result.status === 'succeeded') {
                // Навсозии статуси пардохт дар фармоиш
                await paymentService.confirmPayment({
                    paymentId: result.paymentId,
                    providerPaymentId: result.paymentId,
                    status: result.status,
                });
                logger.info(`Stripe webhook: payment succeeded for order ${result.orderId}`);
            } else if (result.status === 'failed') {
                logger.warn(`Stripe webhook: payment failed for payment ${result.paymentId}`);
            }

            res.json({ received: true, event: event.type });
        } catch (err: any) {
            logger.error(`Error processing Stripe webhook: ${err.message}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * Коркарди webhook умумӣ (агар провайдери дигар лозим бошад)
     */
    static async handleGenericWebhook(req: Request, res: Response): Promise&lt;void&gt; {
        // Дар ин ҷо метавон webhook-и дигар провайдерҳоро кор кард
        logger.info(`Generic webhook received from ${req.headers['user-agent']}`);
        res.status(200).json({ received: true });
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
