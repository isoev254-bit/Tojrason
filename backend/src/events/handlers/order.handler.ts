<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>order.handler.ts</title>
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
// events/handlers/order.handler.ts - Коркарди рӯйдодҳои марбут ба фармоиш
import { EventEmitter } from 'events';
import { NotificationService } from '../../notification/notification.service';
import { DispatchService } from '../../dispatch/dispatch.service';
import { PaymentService } from '../../payment/payment.service';
import { OrderService } from '../../order/order.service';
import { CacheService } from '../../cache/cache.service';
import { CacheKeys } from '../../cache/cache.keys';
import logger from '../../config/logger';

export interface OrderCreatedEvent {
    orderId: string;
    clientId: string;
    clientPhone: string;
    clientEmail: string;
    clientName: string;
    pickupAddress: string;
    deliveryAddress: string;
    amount: number;
    deliveryFee: number;
    totalAmount: number;
}

export interface OrderAssignedEvent {
    orderId: string;
    courierId: string;
    courierPhone: string;
    courierName: string;
    clientId: string;
    clientPhone: string;
    clientName: string;
    pickupAddress: string;
}

export interface OrderStatusChangedEvent {
    orderId: string;
    oldStatus: string;
    newStatus: string;
    clientId: string;
    clientPhone: string;
    courierId?: string;
}

export class OrderEventHandler {
    private notificationService: NotificationService;
    private dispatchService: DispatchService;
    private paymentService: PaymentService;
    private orderService: OrderService;
    private cacheService: CacheService;

    constructor() {
        this.notificationService = new NotificationService();
        this.dispatchService = new DispatchService();
        this.paymentService = new PaymentService();
        this.orderService = new OrderService();
        this.cacheService = new CacheService();
    }

    /**
     * Бақайдгирии ҳамаи listener'ҳо ба EventEmitter
     * @param emitter - EventEmitter (масалан, eventEmitter аз event.emitter.ts)
     */
    register(emitter: EventEmitter): void {
        emitter.on('order.created', this.handleOrderCreated.bind(this));
        emitter.on('order.assigned', this.handleOrderAssigned.bind(this));
        emitter.on('order.status_changed', this.handleOrderStatusChanged.bind(this));
        emitter.on('order.completed', this.handleOrderCompleted.bind(this));
        emitter.on('order.cancelled', this.handleOrderCancelled.bind(this));
    }

    /**
     * Коркарди рӯйдоди эҷоди фармоиш
     */
    private async handleOrderCreated(event: OrderCreatedEvent): Promise&lt;void&gt; {
        logger.info(`Order created event received: ${event.orderId}`);
        
        try {
            // 1. Тоза кардани кэши фармоишҳои клиент
            await this.cacheService.delByPattern(CacheKeys.pattern.allOrders);
            
            // 2. Фиристодани уведомление ба клиент
            await this.notificationService.notifyOrderCreated(
                {
                    id: event.clientId,
                    phone: event.clientPhone,
                    email: event.clientEmail,
                    fullName: event.clientName,
                },
                {
                    orderId: event.orderId,
                    clientName: event.clientName,
                    pickupAddress: event.pickupAddress,
                    deliveryAddress: event.deliveryAddress,
                    amount: event.amount,
                    deliveryFee: event.deliveryFee,
                    totalAmount: event.totalAmount,
                },
                ['sms', 'email', 'push']
            );
            
            // 3. Оғози диспетчеризатсия (таъини курьер) дар замина (background)
            setImmediate(async () => {
                try {
                    const result = await this.dispatchService.assignSmart(event.orderId);
                    if (!result.success) {
                        logger.warn(`Auto-assign failed for order ${event.orderId}: ${result.message}`);
                        // Дар ин ҷо метавон ба диспетчер ё админ уведомление фиристод
                    }
                } catch (error) {
                    logger.error(`Auto-assign error for order ${event.orderId}:`, error);
                }
            });
        } catch (error) {
            logger.error(`Error handling order.created event for ${event.orderId}:`, error);
        }
    }

    /**
     * Коркарди рӯйдоди таъини курьер ба фармоиш
     */
    private async handleOrderAssigned(event: OrderAssignedEvent): Promise&lt;void&gt; {
        logger.info(`Order assigned event: ${event.orderId} -> courier ${event.courierId}`);
        
        try {
            // 1. Тоза кардани кэш
            await this.cacheService.del(CacheKeys.order(event.orderId));
            await this.cacheService.delByPattern(CacheKeys.pattern.allOrders);
            
            // 2. Уведомление ба курьер
            await this.notificationService.notifyCourierAssigned(
                {
                    id: event.courierId,
                    phone: event.courierPhone,
                    fullName: event.courierName,
                },
                event.orderId,
                event.pickupAddress
            );
            
            // 3. Уведомление ба клиент
            const clientNotification = `Фармоиши шумо №${event.orderId} ба курьер ${event.courierName} таъин карда шуд.';
            await this.notificationService.send('sms', {
                to: event.clientPhone,
                subject: 'Таъини курьер',
                template: clientNotification,
                data: { orderId: event.orderId, courierName: event.courierName },
            });
        } catch (error) {
            logger.error(`Error handling order.assigned event for ${event.orderId}:`, error);
        }
    }

    /**
     * Коркарди рӯйдоди тағйири статуси фармоиш
     */
    private async handleOrderStatusChanged(event: OrderStatusChangedEvent): Promise&lt;void&gt; {
        logger.info(`Order status changed: ${event.orderId} ${event.oldStatus} -> ${event.newStatus}`);
        
        try {
            // 1. Тоза кардани кэш
            await this.cacheService.del(CacheKeys.order(event.orderId));
            
            // 2. Агар статус DELIVERED бошад, пардохтро тасдиқ мекунем (барои cash)
            if (event.newStatus === 'DELIVERED') {
                const order = await this.orderService.getOrderById(event.orderId);
                if (order && order.paymentStatus === 'PENDING' && order.paymentMethod === 'cash') {
                    // Тасдиқи пардохти нақдӣ
                    await this.paymentService.confirmPayment({ orderId: event.orderId });
                }
            }
            
            // 3. Уведомление ба клиент
            await this.notificationService.notifyOrderStatusChange(
                {
                    phone: event.clientPhone,
                    email: '',
                    fullName: '',
                },
                event.orderId,
                event.newStatus
            );
        } catch (error) {
            logger.error(`Error handling order.status_changed event for ${event.orderId}:`, error);
        }
    }

    /**
     * Коркарди рӯйдоди анҷоми фармоиш (расонида шуд)
     */
    private async handleOrderCompleted(event: { orderId: string; clientId: string }): Promise&lt;void&gt; {
        logger.info(`Order completed event: ${event.orderId}`);
        
        try {
            // Тоза кардани кэш
            await this.cacheService.del(CacheKeys.order(event.orderId));
            await this.cacheService.delByPattern(CacheKeys.pattern.allOrders);
        } catch (error) {
            logger.error(`Error handling order.completed event for ${event.orderId}:`, error);
        }
    }

    /**
     * Коркарди рӯйдоди бекоршавии фармоиш
     */
    private async handleOrderCancelled(event: { orderId: string; clientId: string; reason?: string }): Promise&lt;void&gt; {
        logger.info(`Order cancelled event: ${event.orderId}`);
        
        try {
            // Тоза кардани кэш
            await this.cacheService.del(CacheKeys.order(event.orderId));
            await this.cacheService.delByPattern(CacheKeys.pattern.allOrders);
            
            // Агар пардохт анҷом шуда бошад, бозгардон (refund)
            const order = await this.orderService.getOrderById(event.orderId);
            if (order && order.paymentStatus === 'PAID') {
                await this.paymentService.refundPayment({ paymentId: order.id });
            }
        } catch (error) {
            logger.error(`Error handling order.cancelled event for ${event.orderId}:`, error);
        }
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
