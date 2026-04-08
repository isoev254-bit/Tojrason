<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>assign.ts</title>
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
// modules/dispatch/assign.ts - Логикаи асосии таъин кардани курьер ба фармоиш
import { DispatchStrategy } from './strategy';
import { CourierScore, OrderInfo, AssignResult } from './dispatch.types';
import { OrderService } from '../order/order.service';
import { CourierRepository } from '../courier/courier.repository';
import { LocationService } from '../courier/location.service';
import logger from '../../config/logger';

export class Assigner {
    private orderService: OrderService;
    private courierRepo: CourierRepository;
    private locationService: LocationService;

    constructor() {
        this.orderService = new OrderService();
        this.courierRepo = new CourierRepository();
        this.locationService = new LocationService();
    }

    /**
     * Таъин кардани курьер ба фармоиш бо истифода аз стратегияи интихобшуда
     * @param orderId - ID фармоиш
     * @param strategy - Стратегияи таъин (nearest, cheapest, smart)
     * @returns Натиҷаи таъин (муваффақият ё нокомӣ)
     */
    async assignOrder(orderId: string, strategy: DispatchStrategy): Promise&lt;AssignResult&gt; {
        try {
            // 1. Гирифтани маълумоти фармоиш
            const order = await this.orderService.getOrderById(orderId);
            if (!order) {
                return {
                    success: false,
                    message: 'Фармоиш ёфт нашуд',
                    orderId,
                };
            }

            // 2. Санҷиши он, ки фармоиш дар ҳолати PENDING аст
            if (order.status !== 'PENDING') {
                return {
                    success: false,
                    message: `Фармоиш дар ҳолати ${order.status} мебошад, таъин кардан мумкин нест`,
                    orderId,
                };
            }

            // 3. Гирифтани ҳамаи курьерҳои дастрас
            const couriers = await this.courierRepo.findAvailableCouriers();
            if (couriers.length === 0) {
                return {
                    success: false,
                    message: 'Ҳеҷ курьери дастрас нест',
                    orderId,
                };
            }

            // 4. Омода кардани маълумот барои стратегия
            const orderInfo: OrderInfo = {
                orderId: order.id,
                pickupLat: order.pickupLat,
                pickupLng: order.pickupLng,
                deliveryLat: order.deliveryLat,
                deliveryLng: order.deliveryLng,
                amount: order.amount,
            };

            const courierList = couriers.map(c => ({
                id: c.id,
                lat: c.locationLat!,
                lng: c.locationLng!,
                isAvailable: c.isAvailable,
                rating: c.rating,
            }));

            // 5. Ҳисоб кардани рейтингҳо бо стратегия
            const scores = await strategy.scoreCouriers(orderInfo, courierList);
            if (scores.length === 0) {
                return {
                    success: false,
                    message: 'Ҳеҷ курьери мувофиқ пайдо нашуд',
                    orderId,
                };
            }

            // 6. Интихоби беҳтарин курьер
            const best = strategy.selectBest(scores);
            if (!best) {
                return {
                    success: false,
                    message: 'Интихоби курьер номуяффақ',
                    orderId,
                };
            }

            // 7. Таъин кардани курьер ба фармоиш
            const updatedOrder = await this.orderService.assignCourier(orderId, best.courierId);
            if (!updatedOrder) {
                return {
                    success: false,
                    message: 'Хатогӣ ҳангоми таъин кардани курьер',
                    orderId,
                };
            }

            logger.info(`Фармоиш ${orderId} ба курьер ${best.courierId} таъин карда шуд (стратегия: ${strategy.name})`);
            return {
                success: true,
                message: `Курьер бомуваффақият таъин карда шуд: ${best.courierId}`,
                orderId,
                courierId: best.courierId,
                score: best.score,
                reason: best.reason,
            };
        } catch (error: any) {
            logger.error(`Хатогӣ ҳангоми таъин: ${error.message}`);
            return {
                success: false,
                message: `Хатогии сервер: ${error.message}`,
                orderId,
            };
        }
    }

    /**
     * Таъин кардан бо стратегияи пешфарз (nearest)
     */
    async assignDefault(orderId: string): Promise&lt;AssignResult&gt; {
        const { NearestStrategy } = require('./strategies/nearest.strategy');
        const strategy = new NearestStrategy();
        return this.assignOrder(orderId, strategy);
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
