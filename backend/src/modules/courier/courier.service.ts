<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>courier.service.ts</title>
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
// modules/courier/courier.service.ts - Логикаи тиҷоратӣ барои курьерҳо
import { CourierRepository } from './courier.repository';
import { LocationService } from './location.service';
import { OrderService } from '../order/order.service';
import { UserRepository } from '../user/user.repository';
import { UpdateLocationDto } from './dto/update-location.dto';
import { CourierStats, CourierOrderResponse } from './courier.types';
import { constants } from '../../config/constants';
import logger from '../../config/logger';

export class CourierService {
    private courierRepo: CourierRepository;
    private userRepo: UserRepository;
    private locationService: LocationService;
    private orderService: OrderService;

    constructor() {
        this.courierRepo = new CourierRepository();
        this.userRepo = new UserRepository();
        this.locationService = new LocationService();
        this.orderService = new OrderService();
    }

    // Навсозии ҷойгиршавӣ ва ҳолати дастрасии курьер
    async updateLocation(courierId: string, dto: UpdateLocationDto): Promise<void> {
        // Навсозии ҷойгиршавӣ дар таблитсаи user
        await this.userRepo.updateLocation(courierId, dto.lat, dto.lng);
        
        // Агар ҳолати дастрасӣ фиристода шуда бошад, онро низ навсозӣ кун
        if (dto.isAvailable !== undefined) {
            await this.userRepo.setAvailability(courierId, dto.isAvailable);
        }
        
        // Инчунин ҷойгиршавиро дар Redis кэш кун (барои пайгирии зуд)
        await this.locationService.setCourierLocation(courierId, dto.lat, dto.lng);
        
        logger.info(`Ҷойгиршавии курьер ${courierId} навсозӣ шуд: lat=${dto.lat}, lng=${dto.lng}, available=${dto.isAvailable ?? 'нагузошта'}`);
    }

    // Гирифтани маълумоти курьер аз рӯи ID
    async getCourierProfile(courierId: string) {
        const user = await this.userRepo.findById(courierId);
        if (!user || user.role !== constants.ROLES.COURIER) {
            throw new Error('Курьер ёфт нашуд');
        }
        return user;
    }

    // Гирифтани омори курьер (шумораи фармоишҳо, маблағи умумӣ ва ғ.)
    async getCourierStats(courierId: string): Promise<CourierStats> {
        // Фармоишҳои анҷомдодаи курьер
        const deliveredOrders = await this.orderService.getOrdersByCourier(courierId, {
            status: constants.ORDER_STATUS.DELIVERED,
        });
        
        const totalDelivered = deliveredOrders.total;
        const totalEarnings = deliveredOrders.data.reduce((sum, order) => sum + order.deliveryFee, 0);
        
        // Фармоишҳои ҷорӣ (дар ҳоли иҷро)
        const activeOrders = await this.orderService.getOrdersByCourier(courierId, {
            status: constants.ORDER_STATUS.ASSIGNED,
        });
        
        const inProgressOrders = await this.orderService.getOrdersByCourier(courierId, {
            status: constants.ORDER_STATUS.PICKED_UP,
        });
        
        const activeCount = activeOrders.total + inProgressOrders.total;
        
        return {
            courierId,
            totalDelivered,
            totalEarnings,
            activeOrdersCount: activeCount,
            rating: 5.0, // баъдан бояд аз базаи додаҳо гирифта шавад
        };
    }

    // Қабули фармоиш аз ҷониби курьер (пас аз таъиншавӣ)
    async acceptOrder(courierId: string, orderId: string): Promise<void> {
        const order = await this.orderService.getOrderById(orderId);
        if (!order) {
            throw new Error('Фармоиш ёфт нашуд');
        }
        
        if (order.courierId !== courierId) {
            throw new Error('Ин фармоиш ба шумо таъин нашудааст');
        }
        
        if (order.status !== constants.ORDER_STATUS.ASSIGNED) {
            throw new Error('Фармоиш дар ҳолати қабул нест');
        }
        
        // Тағйир додани статус ба PICKED_UP (ё нигоҳ доштани ASSIGNED? одатан пас аз қабул "гирифта шуд" мешавад)
        await this.orderService.updateOrderStatus(orderId, constants.ORDER_STATUS.PICKED_UP);
        
        logger.info(`Курьер ${courierId} фармоиш ${orderId} -ро қабул кард`);
    }

    // Оғози расонидани фармоиш (аз суроғаи гирифтан ба суроғаи расонидан)
    async startDelivery(courierId: string, orderId: string): Promise<void> {
        const order = await this.orderService.getOrderById(orderId);
        if (!order) {
            throw new Error('Фармоиш ёфт нашуд');
        }
        
        if (order.courierId !== courierId) {
            throw new Error('Шумо иҷозати идоракунии ин фармоишро надоред');
        }
        
        if (order.status !== constants.ORDER_STATUS.PICKED_UP) {
            throw new Error('Фармоиш ҳанӯз гирифта нашудааст');
        }
        
        // Дар ин ҷо метавон ҳолати махсуси "дар роҳ" -ро истифода кард, аммо мо ҳамон статусро нигоҳ медорем
        logger.info(`Курьер ${courierId} расонидани фармоиш ${orderId} -ро оғоз кард`);
    }

    // Тамом кардани фармоиш (расонида шуд)
    async completeOrder(courierId: string, orderId: string): Promise<void> {
        const order = await this.orderService.getOrderById(orderId);
        if (!order) {
            throw new Error('Фармоиш ёфт нашуд');
        }
        
        if (order.courierId !== courierId) {
            throw new Error('Шумо иҷозати идоракунии ин фармоишро надоред');
        }
        
        if (order.status !== constants.ORDER_STATUS.PICKED_UP) {
            throw new Error('Фармоиш ҳанӯз гирифта нашудааст ё аллакай расонида шудааст');
        }
        
        await this.orderService.updateOrderStatus(orderId, constants.ORDER_STATUS.DELIVERED);
        
        logger.info(`Курьер ${courierId} фармоиш ${orderId} -ро расонид`);
    }

    // Гирифтани фармоишҳои дастрас барои курьер (фармоишҳои PENDING дар наздикӣ)
    async getAvailableOrders(courierId: string, radiusMeters: number = constants.MAX_COURIER_DISTANCE_METERS): Promise<CourierOrderResponse[]> {
        // Аввал ҷойгиршавии ҷории курьерро гирем
        const courier = await this.userRepo.findById(courierId);
        if (!courier || !courier.locationLat || !courier.locationLng) {
            throw new Error('Ҷойгиршавии курьер муайян карда нашудааст');
        }
        
        // Ҷустуҷӯи фармоишҳои PENDING дар наздикӣ (инро дар репозиторий амалӣ мекунем)
        const pendingOrders = await this.courierRepo.findPendingOrdersNearby(
            courier.locationLat,
            courier.locationLng,
            radiusMeters
        );
        
        return pendingOrders;
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
