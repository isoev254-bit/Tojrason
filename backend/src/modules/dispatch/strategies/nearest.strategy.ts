<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>nearest.strategy.ts</title>
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
// modules/dispatch/strategies/nearest.strategy.ts
// Стратегияи интихоби наздиктарин курьер ба фармоиш

import { DispatchStrategy, CourierScore, OrderInfo } from '../dispatch.types';
import { LocationService } from '../../courier/location.service';

export class NearestStrategy implements DispatchStrategy {
    name = 'nearest';
    private locationService: LocationService;

    constructor() {
        this.locationService = new LocationService();
    }

    /**
     * Ҳисоб кардани рейтинги курьерҳо барои фармоиши додашуда.
     * Рейтинг асосан аз рӯи масофаи мустақим то нуқтаи гирифтани фармоиш ҳисоб мешавад.
     * Ҳар қадар масофа камтар, рейтинг баландтар.
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
            // Агар курьер дастрас набошад, аз рӯйхат хориҷ мекунем
            if (!courier.isAvailable) continue;

            // Ҳисоб кардани масофа аз ҷойгиршавии курьер то нуқтаи гирифтани фармоиш
            const distance = this.locationService.calculateDistance(
                courier.lat,
                courier.lng,
                order.pickupLat,
                order.pickupLng
            );

            // Рейтинг: масофаи камтар = рейтинги баландтар (инверсия)
            // Максималӣ масофаи 5 км = рейтинги 0, масофаи 0 = рейтинги 100
            const maxDistance = 5000; // 5 км
            const rawScore = Math.max(0, 100 - (distance / maxDistance) * 100);
            
            // Рейтингро бо назардошти сифати курьер (агар мавҷуд бошад) тавозун медиҳем
            const courierRating = courier.rating || 5.0;
            const finalScore = (rawScore * 0.7) + (courierRating * 10); // 10 балл барои ҳар як рейтинг
            
            scores.push({
                courierId: courier.id,
                score: Math.round(finalScore * 100) / 100,
                distance,
                reason: `Масофа то фармоиш: ${Math.round(distance)} метр`,
            });
        }

        // Аз рӯи рейтинг аз калон ба хурд ҷудо мекунем
        scores.sort((a, b) => b.score - a.score);
        return scores;
    }

    /**
     * Интихоби беҳтарин курьер аз рӯи рейтинг (аввалин элемент)
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
