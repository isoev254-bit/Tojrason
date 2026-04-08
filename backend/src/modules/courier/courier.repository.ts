<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>courier.repository.ts</title>
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
// modules/courier/courier.repository.ts - Дастрасӣ ба базаи додаҳо барои курьерҳо
import prisma from '../../config/db';
import { CourierResponse, CourierLocationUpdate } from './courier.model';
import { UserRole } from '../auth/auth.types';
import { constants } from '../../config/constants';
import logger from '../../config/logger';

export class CourierRepository {
    // Ёфтани ҳамаи курьерҳои дастрас
    async findAvailableCouriers(): Promise<CourierResponse[]> {
        const couriers = await prisma.user.findMany({
            where: {
                role: constants.ROLES.COURIER,
                isAvailable: true,
                locationLat: { not: null },
                locationLng: { not: null },
            },
            select: {
                id: true,
                fullName: true,
                phone: true,
                email: true,
                locationLat: true,
                locationLng: true,
                isAvailable: true,
                createdAt: true,
            },
        });
        return couriers.map(c => ({
            ...c,
            rating: 5.0,
            totalDeliveries: 0,
        })) as CourierResponse[];
    }

    // Ёфтани курьерҳои дастрас дар наздикии нуқта (бо масофа)
    async findAvailableCouriersNearby(lat: number, lng: number, radiusMeters: number): Promise<CourierResponse[]> {
        // Барои соддагӣ, ҳамаи курьерҳои дастрасро мегирем ва дар service масофаро ҳисоб мекунем.
        // Дар лоиҳаи воқеӣ метавон аз SQL-и махсус (PostGIS) истифода кард.
        const couriers = await prisma.user.findMany({
            where: {
                role: constants.ROLES.COURIER,
                isAvailable: true,
                locationLat: { not: null },
                locationLng: { not: null },
            },
            select: {
                id: true,
                fullName: true,
                phone: true,
                email: true,
                locationLat: true,
                locationLng: true,
                isAvailable: true,
                createdAt: true,
            },
        });
        return couriers.map(c => ({
            ...c,
            rating: 5.0,
            totalDeliveries: 0,
        })) as CourierResponse[];
    }

    // Ёфтани фармоишҳои PENDING дар наздикии курьер
    async findPendingOrdersNearby(courierLat: number, courierLng: number, radiusMeters: number): Promise<any[]> {
        // Барои соддагӣ ҳамаи фармоишҳои PENDING-ро мегирем, дар service масофа ҳисоб мешавад.
        const orders = await prisma.order.findMany({
            where: {
                status: constants.ORDER_STATUS.PENDING,
            },
            select: {
                id: true,
                pickupAddress: true,
                pickupLat: true,
                pickupLng: true,
                deliveryAddress: true,
                amount: true,
                deliveryFee: true,
                totalAmount: true,
                createdAt: true,
                client: {
                    select: {
                        fullName: true,
                        phone: true,
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
            take: 50,
        });
        return orders;
    }

    // Сабти ҳаракати курьер (барои таърих)
    async saveLocationHistory(data: CourierLocationUpdate): Promise<void> {
        // Агар лозим бошад, метавон ҷадвали алоҳидаи location_history созем.
        // Дар ин ҷо танҳо лог мекунем.
        logger.debug(`Location history saved: courier ${data.courierId} at (${data.lat}, ${data.lng})`);
        // Дар сурати мавҷуд будани модели LocationHistory, ин ҷо код нависед:
        // await prisma.locationHistory.create({ data: { ... } });
    }

    // Гирифтани омори расонидани курьер (шумораи фармоишҳои расонидашуда)
    async getCourierDeliveryStats(courierId: string): Promise<{ totalDelivered: number; totalEarnings: number }> {
        const orders = await prisma.order.aggregate({
            where: {
                courierId: courierId,
                status: constants.ORDER_STATUS.DELIVERED,
            },
            _count: { id: true },
            _sum: { deliveryFee: true },
        });
        return {
            totalDelivered: orders._count.id,
            totalEarnings: orders._sum.deliveryFee || 0,
        };
    }

    // Санҷидани он, ки оё курьер метавонад фармоишро қабул кунад (яъне фармоиши фаъоли дигар надорад)
    async hasActiveOrder(courierId: string): Promise<boolean> {
        const activeOrder = await prisma.order.findFirst({
            where: {
                courierId: courierId,
                status: {
                    in: [constants.ORDER_STATUS.ASSIGNED, constants.ORDER_STATUS.PICKED_UP],
                },
            },
        });
        return !!activeOrder;
    }

    // Гирифтани фармоиши фаъоли курьер
    async getCurrentOrder(courierId: string): Promise<any | null> {
        const order = await prisma.order.findFirst({
            where: {
                courierId: courierId,
                status: {
                    in: [constants.ORDER_STATUS.ASSIGNED, constants.ORDER_STATUS.PICKED_UP],
                },
            },
            include: {
                client: {
                    select: { fullName: true, phone: true },
                },
            },
        });
        return order;
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
