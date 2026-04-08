<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>payment.service.ts</title>
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
// modules/payment/payment.service.ts - Логикаи тиҷоратии пардохт
import { CreatePaymentDto, ConfirmPaymentDto, RefundPaymentDto } from './dto/payment.dto';
import { PaymentProvider, PaymentResult, PaymentProviderFactory } from './providers';
import { PaymentStatus } from '../../config/constants';
import { OrderService } from '../order/order.service';
import logger from '../../config/logger';

export class PaymentService {
    private orderService: OrderService;
    private providerFactory: PaymentProviderFactory;

    constructor() {
        this.orderService = new OrderService();
        this.providerFactory = new PaymentProviderFactory();
    }

    /**
     * Эҷоди пардохт барои фармоиш
     */
    async createPayment(dto: CreatePaymentDto, userId: string): Promise&lt;PaymentResult&gt; {
        // Санҷиши мавҷудияти фармоиш ва моликият
        const order = await this.orderService.getOrderById(dto.orderId);
        if (!order) {
            throw new Error('Фармоиш ёфт нашуд');
        }
        if (order.clientId !== userId) {
            throw new Error('Шумо иҷозати пардохт барои ин фармоишро надоред');
        }
        if (order.paymentStatus !== 'PENDING') {
            throw new Error('Пардохт аллакай анҷом ёфтааст ё бекор шудааст');
        }

        // Интихоби провайдер
        const method = dto.method || 'stripe';
        const provider = this.providerFactory.getProvider(method);

        // Маблағро аз фармоиш мегирем (агар дар dto набошад)
        const amount = dto.amount || order.totalAmount;
        const currency = dto.currency || 'TJS';

        const result = await provider.createPayment({
            orderId: order.id,
            amount,
            currency,
            successUrl: dto.successUrl,
            cancelUrl: dto.cancelUrl,
        });

        logger.info(`Пардохт эҷод шуд: orderId=${order.id}, provider=${method}, paymentId=${result.paymentId}`);
        return result;
    }

    /**
     * Тасдиқи пардохт пас аз бозгашт аз провайдер
     */
    async confirmPayment(dto: ConfirmPaymentDto): Promise&lt;PaymentResult&gt; {
        let paymentId = dto.paymentId;
        let providerPaymentId = dto.providerPaymentId;

        // Агар providerPaymentId мавҷуд бошад, провайдерро муайян мекунем (метавон аз база гирифт)
        // Барои соддагӣ, фарз мекунем, ки агар dto.paymentId бошад, онро истифода мебарем
        // Дар ҳақиқат бояд дар БД нигоҳ дошта шавад, ки кадом провайдер истифода шудааст.
        
        if (!paymentId && providerPaymentId) {
            // Ҷустуҷӯи пардохт аз рӯи providerPaymentId (дар БД)
            // Барои ҳозир хатогӣ медиҳем
            throw new Error('paymentId лозим аст');
        }

        // Дар ин ҷо метавон провайдерро аз БД гирифт. Барои мисол, Stripe -ро фарз мекунем.
        const provider = this.providerFactory.getProvider('stripe');
        const result = await provider.confirmPayment(paymentId!);

        if (result.success && result.status === 'succeeded') {
            // Навсозии статуси пардохт дар фармоиш
            await this.orderService.updateOrder(result.orderId, {
                paymentStatus: 'PAID' as any,
            });
            logger.info(`Пардохти фармоиш ${result.orderId} тасдиқ шуд`);
        }

        return result;
    }

    /**
     * Бозгардонидани пардохт (refund)
     */
    async refundPayment(dto: RefundPaymentDto): Promise&lt;PaymentResult&gt; {
        // Дар ҳақиқат бояд провайдер ва маълумоти пардохтро аз БД гирифт
        const provider = this.providerFactory.getProvider('stripe');
        const result = await provider.refundPayment(dto.paymentId, dto.amount);

        if (result.success && result.status === 'refunded') {
            await this.orderService.updateOrder(result.orderId, {
                paymentStatus: 'REFUNDED' as any,
            });
            logger.info(`Пардохти фармоиш ${result.orderId} бозгардонда шуд`);
        }

        return result;
    }

    /**
     * Гирифтани ҳолати пардохт аз провайдер
     */
    async getPaymentStatus(paymentId: string): Promise&lt;PaymentResult&gt; {
        // Дар ҳақиқат провайдерро аз БД мегирем
        const provider = this.providerFactory.getProvider('stripe');
        return provider.getPaymentStatus(paymentId);
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
