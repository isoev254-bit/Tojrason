<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>location.service.ts</title>
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
// modules/courier/location.service.ts - Хидмати ҷойгиршавӣ барои курьерҳо (бо Redis)
import { redis } from '../../config/redis';
import { constants } from '../../config/constants';
import logger from '../../config/logger';

export interface CourierLocation {
    courierId: string;
    lat: number;
    lng: number;
    updatedAt: Date;
}

export class LocationService {
    private readonly keyPrefix = constants.CACHE_KEYS.COURIER_LOCATION_PREFIX;
    private readonly ttlSeconds = 60 * 60; // 1 соат

    // Нигоҳдории ҷойгиршавии курьер дар Redis
    async setCourierLocation(courierId: string, lat: number, lng: number): Promise<void> {
        const key = `${this.keyPrefix}${courierId}`;
        const value = JSON.stringify({
            lat,
            lng,
            updatedAt: new Date().toISOString(),
        });
        await redis.set(key, value, 'EX', this.ttlSeconds);
        logger.debug(`Location cached for courier ${courierId}: (${lat}, ${lng})`);
    }

    // Гирифтани ҷойгиршавии курьер аз Redis
    async getCourierLocation(courierId: string): Promise<CourierLocation | null> {
        const key = `${this.keyPrefix}${courierId}`;
        const data = await redis.get(key);
        if (!data) return null;
        try {
            const parsed = JSON.parse(data);
            return {
                courierId,
                lat: parsed.lat,
                lng: parsed.lng,
                updatedAt: new Date(parsed.updatedAt),
            };
        } catch (err) {
            logger.error(`Error parsing location for courier ${courierId}:`, err);
            return null;
        }
    }

    // Нест кардани ҷойгиршавӣ аз кэш
    async deleteCourierLocation(courierId: string): Promise<void> {
        const key = `${this.keyPrefix}${courierId}`;
        await redis.del(key);
        logger.debug(`Location cache deleted for courier ${courierId}`);
    }

    // Ҳисоб кардани масофа байни ду ҷойгиршавӣ (формулаи Ҳаверсин)
    calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371000; // метр
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // Вақти тахминии расидан (дақиқа)
    estimateArrivalTime(distanceMeters: number, averageSpeedKmh: number = 30): number {
        const speedMs = averageSpeedKmh * 1000 / 3600;
        const seconds = distanceMeters / speedMs;
        return Math.ceil(seconds / 60);
    }

    // Фильтр кардани курьерҳо дар доираи радиус аз нуқтаи додашуда
    filterCouriersByRadius(
        couriers: Array<{ id: string; lat: number; lng: number }>,
        centerLat: number,
        centerLng: number,
        radiusMeters: number
    ): Array<{ courierId: string; distance: number }> {
        const result: Array<{ courierId: string; distance: number }> = [];
        for (const courier of couriers) {
            const distance = this.calculateDistance(centerLat, centerLng, courier.lat, courier.lng);
            if (distance <= radiusMeters) {
                result.push({ courierId: courier.id, distance });
            }
        }
        return result.sort((a, b) => a.distance - b.distance);
    }

    // Баланд бардоштани TTL (агар курьер фаъол бошад)
    async refreshLocationTTL(courierId: string): Promise<void> {
        const key = `${this.keyPrefix}${courierId}`;
        const exists = await redis.exists(key);
        if (exists) {
            await redis.expire(key, this.ttlSeconds);
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
