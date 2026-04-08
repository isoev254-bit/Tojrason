<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>smart.strategy.ts</title>
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
// modules/dispatch/strategies/smart.strategy.ts
// Стратегияи интеллектуалӣ: омезиши масофа, арзиш, рейтинг ва бори корӣ

import { DispatchStrategy, CourierScore, OrderInfo } from '../dispatch.types';
import { LocationService } from '../../courier/location.service';

interface CourierPerformance {
    courierId: string;
    totalDeliveriesToday: number;   // Шумораи фармоишҳои имрӯза
    averageRating: number;           // Рейтинги миёна (1-5)
    acceptanceRate: number;          // Фоизи қабули фармоишҳо (0-100)
    onTimeRate: number;              // Фоизи расонидани саривақт (0-100)
}

export class SmartStrategy implements DispatchStrategy {
    name = 'smart';
    private locationService: LocationService;
    
    // Маълумоти иҷроиши курьерҳо (дар системаи воқеӣ аз БД гирифта мешавад)
    private performanceMap: Map&lt;string, CourierPerformance&gt; = new Map();

    constructor() {
        this.locationService = new LocationService();
    }

    /**
     * Навсозии маълумоти иҷроиши курьер
     */
    updatePerformance(courierId: string, data: Partial&lt;CourierPerformance&gt;): void {
        const current = this.performanceMap.get(courierId) || {
            courierId,
            totalDeliveriesToday: 0,
            averageRating: 5.0,
            acceptanceRate: 100,
            onTimeRate: 100,
        };
        this.performanceMap.set(courierId, { ...current, ...data });
    }

    /**
     * Ҳисоб кардани рейтинги умумии курьер бо вазнҳои гуногун:
     * - масофа (30%)
     * - арзиши интиқол (20%)
     * - рейтинги корбар (25%)
     * - бори корӣ/фоизи қабул (15%)
     * - саривақтӣ (10%)
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

            // 1. Ҳисоби масофа (0-100, камтар беҳтар)
            const distance = this.locationService.calculateDistance(
                courier.lat,
                courier.lng,
                order.pickupLat,
                order.pickupLng
            );
            const maxDistance = 5000; // 5 км
            const distanceScore = Math.max(0, 100 - (distance / maxDistance) * 100);

            // 2. Ҳисоби арзиши интиқол (0-100, арзонтар беҳтар)
            const cost = this.estimateDeliveryCost(courier.id, distance);
            const maxCost = 100;
            const costScore = Math.max(0, 100 - (cost / maxCost) * 100);

            // 3. Рейтинги корбар (0-100)
            const ratingScore = (courier.rating || 5.0) * 20; // 5*20=100

            // 4. Маълумоти иҷроӣ
            const perf = this.performanceMap.get(courier.id) || {
                totalDeliveriesToday: 0,
                averageRating: 5.0,
                acceptanceRate: 100,
                onTimeRate: 100,
            };
            const acceptanceScore = perf.acceptanceRate; // 0-100
            const onTimeScore = perf.onTimeRate;         // 0-100
            
            // 5. Бори корӣ: агар фармоишҳои фаъол дошта бошад, кам мекунем
            let workloadPenalty = 0;
            if (perf.totalDeliveriesToday > 10) workloadPenalty = 20;
            else if (perf.totalDeliveriesToday > 5) workloadPenalty = 10;
            
            // Вазнҳо
            const weights = {
                distance: 0.30,
                cost: 0.20,
                rating: 0.25,
                acceptance: 0.15,
                onTime: 0.10,
            };
            
            let finalScore = 
                distanceScore * weights.distance +
                costScore * weights.cost +
                ratingScore * weights.rating +
                acceptanceScore * weights.acceptance +
                onTimeScore * weights.onTime;
            
            finalScore = Math.max(0, finalScore - workloadPenalty);
            
            scores.push({
                courierId: courier.id,
                score: Math.round(finalScore * 100) / 100,
                distance,
                reason: `Масофа: ${Math.round(distance)}м, арзиш: ${Math.round(cost)} сом, рейтинг: ${courier.rating}, қабул: ${acceptanceScore}%, саривақт: ${onTimeScore}%`,
            });
        }

        scores.sort((a, b) => b.score - a.score);
        return scores;
    }

    /**
     * Тахмини арзиши интиқол барои курьер
     */
    private estimateDeliveryCost(courierId: string, distanceMeters: number): number {
        // Дар воқеият аз БД гирифта мешавад
        const distanceKm = distanceMeters / 1000;
        const baseFee = 10;
        const ratePerKm = 2;
        return baseFee + ratePerKm * distanceKm;
    }

    /**
     * Интихоби беҳтарин курьер
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
