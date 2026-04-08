<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>cheapest.strategy.ts</title>
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
// modules/dispatch/strategies/cheapest.strategy.ts
// Стратегияи интихоби арзонтарин курьер барои фармоиш

import { DispatchStrategy, CourierScore, OrderInfo } from '../dispatch.types';
import { LocationService } from '../../courier/location.service';

// Тарифҳои гипотетикии курьер (дар системаи воқеӣ аз базаи додаҳо гирифта мешавад)
interface CourierRate {
    baseFee: number;      // Пардохти асосӣ (сомонӣ)
    ratePerKm: number;    // Пардохт барои ҳар километр (сомонӣ)
}

export class CheapestStrategy implements DispatchStrategy {
    name = 'cheapest';
    private locationService: LocationService;

    // Тарифҳои пешфарз барои курьерҳо (метавон бо ID фарқ кард)
    private courierRates: Map&lt;string, CourierRate&gt; = new Map();

    constructor() {
        this.locationService = new LocationService();
        // Баъзе тарифҳои намунавӣ (дар воқеият аз БД меоянд)
        this.courierRates.set('default', { baseFee: 10, ratePerKm: 2 });
    }

    /**
     * Бақайдгирии тариф барои курьери мушаххас (агар лозим бошад)
     */
    setCourierRate(courierId: string, baseFee: number, ratePerKm: number): void {
        this.courierRates.set(courierId, { baseFee, ratePerKm });
    }

    /**
     * Гирифтани тарифи курьер (агар махсус набошад, тарифи пешфарзро бармегардонад)
     */
    private getCourierRate(courierId: string): CourierRate {
        return this.courierRates.get(courierId) || this.courierRates.get('default')!;
    }

    /**
     * Ҳисоб кардани арзиши умумии интиқол барои курьер
     */
    private calculateDeliveryCost(courierId: string, distanceMeters: number): number {
        const rate = this.getCourierRate(courierId);
        const distanceKm = distanceMeters / 1000;
        return rate.baseFee + rate.ratePerKm * distanceKm;
    }

    /**
     * Ҳисоб кардани рейтинги курьерҳо барои фармоиш.
     * Рейтинг аз рӯи арзиши интиқол ҳисоб мешавад: ҳар қадар арзон, рейтинг баландтар.
     */
    async scoreCouriers(order: OrderInfo, couriers: Array<{
        id: string;
        lat: number;
        lng: number;
        isAvailable: boolean;
        rating?: number;
    }>): Promise&lt;CourierScore[]&gt; {
        const scores: CourierScore[] = [];

        for (const courier of couriers) {
            if (!courier.isAvailable) continue;

            // Масофа то нуқтаи гирифтани фармоиш
            const distance = this.locationService.calculateDistance(
                courier.lat,
                courier.lng,
                order.pickupLat,
                order.pickupLng
            );

            // Арзиши интиқол барои ин курьер
            const cost = this.calculateDeliveryCost(courier.id, distance);
            
            // Рейтинг: арзиши камтар = рейтинги баландтар (инверсия)
            // Максималӣ арзиши 100 сомонӣ = рейтинги 0, арзиши 0 = рейтинги 100
            const maxCost = 100;
            const rawScore = Math.max(0, 100 - (cost / maxCost) * 100);
            
            // Рейтингро бо назардошти сифати курьер тавозун медиҳем (рейтинги хуби курьер +5%)
            const courierRatingBonus = (courier.rating || 5.0) * 2;
            const finalScore = (rawScore * 0.9) + courierRatingBonus;
            
            scores.push({
                courierId: courier.id,
                score: Math.round(finalScore * 100) / 100,
                distance,
                reason: `Арзиши интиқол: ${Math.round(cost)} сомонӣ (масофа: ${Math.round(distance)} м)`,
            });
        }

        // Аз рӯи рейтинг (баландтарин аввал)
        scores.sort((a, b) => b.score - a.score);
        return scores;
    }

    /**
     * Интихоби беҳтарин курьер (аввалин элемент)
     */
    selectBest(scores: CourierScore[]): CourierScore | null {
        if (scores.length === 0) return null;
        return scores[0];
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
