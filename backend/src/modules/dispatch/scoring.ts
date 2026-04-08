<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>scoring.ts</title>
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
// modules/dispatch/scoring.ts - Системаи баҳодиҳии курьерҳо барои интихоби беҳтарин
import { CourierScore, OrderInfo, CourierInfo } from './dispatch.types';
import { LocationService } from '../courier/location.service';

export interface ScoreWeights {
    distance: number;      // масофа (0-1)
    cost: number;          // арзиш (0-1)
    rating: number;        // рейтинги курьер (0-1)
    workload: number;      // бори корӣ (0-1, камтар беҳтар)
    experience: number;    // таҷриба (0-1)
}

export class ScoringSystem {
    private locationService: LocationService;
    private defaultWeights: ScoreWeights = {
        distance: 0.35,
        cost: 0.20,
        rating: 0.25,
        workload: 0.10,
        experience: 0.10,
    };

    constructor() {
        this.locationService = new LocationService();
    }

    /**
     * Ҳисоб кардани рейтинги умумии курьер барои фармоиши додашуда
     */
    async calculateScore(
        order: OrderInfo,
        courier: CourierInfo,
        weights: ScoreWeights = this.defaultWeights
    ): Promise&lt;number&gt; {
        // 1. Масофа (камтар = беҳтар) → 0..100
        const distanceScore = await this.calculateDistanceScore(order, courier);
        
        // 2. Арзиш (камтар = беҳтар) → 0..100
        const costScore = this.calculateCostScore(order, courier);
        
        // 3. Рейтинги корбар (бештар = беҳтар) → 0..100
        const ratingScore = (courier.rating || 5.0) * 20;
        
        // 4. Бори корӣ (шумораи фармоишҳои фаъол, камтар = беҳтар) → 0..100
        const workloadScore = this.calculateWorkloadScore(courier.activeOrdersCount || 0);
        
        // 5. Таҷриба (шумораи расонидани фармоишҳо, бештар = беҳтар) → 0..100
        const experienceScore = this.calculateExperienceScore(courier.totalDeliveries || 0);
        
        // Ҷамъи вазнҳо
        const finalScore = 
            distanceScore * weights.distance +
            costScore * weights.cost +
            ratingScore * weights.rating +
            workloadScore * weights.workload +
            experienceScore * weights.experience;
        
        return Math.round(finalScore * 100) / 100;
    }

    /**
     * Ҳисоб кардани рейтинги масофа (0-100)
     */
    private async calculateDistanceScore(order: OrderInfo, courier: CourierInfo): Promise&lt;number&gt; {
        if (!courier.lat || !courier.lng) return 0;
        
        const distance = this.locationService.calculateDistance(
            courier.lat,
            courier.lng,
            order.pickupLat,
            order.pickupLng
        );
        
        // Максималӣ масофаи 5 км = 0 балл, масофаи 0 = 100 балл
        const maxDistance = 5000;
        const score = Math.max(0, 100 - (distance / maxDistance) * 100);
        return Math.round(score * 100) / 100;
    }

    /**
     * Ҳисоб кардани рейтинги арзиш (0-100)
     */
    private calculateCostScore(order: OrderInfo, courier: CourierInfo): number {
        // Арзиши тахминӣ барои ин курьер
        const distanceKm = (courier.distanceToPickup || 0) / 1000;
        const baseFee = courier.baseFee ?? 10;
        const ratePerKm = courier.ratePerKm ?? 2;
        const cost = baseFee + ratePerKm * distanceKm;
        
        // Максималӣ арзиши 100 сомонӣ = 0 балл, арзиши 0 = 100 балл
        const maxCost = 100;
        const score = Math.max(0, 100 - (cost / maxCost) * 100);
        return Math.round(score * 100) / 100;
    }

    /**
     * Ҳисоб кардани рейтинги бори корӣ (0-100)
     */
    private calculateWorkloadScore(activeOrdersCount: number): number {
        // Агар 0 фармоиши фаъол бошад → 100 балл
        // Агар 3 ё зиёд фармоиши фаъол бошад → 0 балл
        const maxActive = 3;
        const score = Math.max(0, 100 - (activeOrdersCount / maxActive) * 100);
        return Math.round(score * 100) / 100;
    }

    /**
     * Ҳисоб кардани рейтинги таҷриба (0-100)
     */
    private calculateExperienceScore(totalDeliveries: number): number {
        // Максималӣ 500 фармоиш → 100 балл
        const maxDeliveries = 500;
        const score = Math.min(100, (totalDeliveries / maxDeliveries) * 100);
        return Math.round(score * 100) / 100;
    }

    /**
     * Баҳодиҳии гурӯҳи курьерҳо ва баргардонидани рейтингҳо бо тартиб
     */
    async scoreCouriers(
        order: OrderInfo,
        couriers: CourierInfo[],
        weights?: ScoreWeights
    ): Promise&lt;CourierScore[]&gt; {
        const scores: CourierScore[] = [];
        
        for (const courier of couriers) {
            if (!courier.isAvailable) continue;
            
            const score = await this.calculateScore(order, courier, weights);
            const distance = this.locationService.calculateDistance(
                courier.lat,
                courier.lng,
                order.pickupLat,
                order.pickupLng
            );
            
            scores.push({
                courierId: courier.id,
                score,
                distance,
                reason: `Масофа: ${Math.round(distance)}м, рейтинг: ${courier.rating}, фармоишҳои фаъол: ${courier.activeOrdersCount || 0}`,
            });
        }
        
        // Аз рейтинги баланд ба паст
        scores.sort((a, b) => b.score - a.score);
        return scores;
    }

    /**
     * Танзими вазнҳои баҳодиҳӣ (барои такмил)
     */
    setWeights(weights: Partial&lt;ScoreWeights&gt;): void {
        this.defaultWeights = { ...this.defaultWeights, ...weights };
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
