<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>courier.model.ts</title>
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
// modules/courier/courier.model.ts - Модели курьер (интерфейсҳо ва функсияҳои ёвар)
// Модели асосии курьер дар prisma/schema.pruma ҳамчун User бо role='COURIER' нигоҳ дошта мешавад.
// Ин файл интерфейсҳои махсуси курьер ва методҳои ёвариро дар бар мегирад.

import { User } from '../auth/auth.types';

// Маълумоти пурраи курьер (аз User барои курьер)
export interface Courier extends User {
    role: 'COURIER';
    locationLat: number | null;
    locationLng: number | null;
    isAvailable: boolean;
}

// Маълумоти курьер барои ҷавобҳо (бе маълумоти ҳассос)
export interface CourierResponse {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    locationLat: number | null;
    locationLng: number | null;
    isAvailable: boolean;
    rating?: number;
    totalDeliveries?: number;
    createdAt: Date;
}

// Маълумот барои навсозии ҷойгиршавӣ
export interface CourierLocationUpdate {
    courierId: string;
    lat: number;
    lng: number;
    timestamp: Date;
}

// Ҳолати курьер
export interface CourierStatus {
    courierId: string;
    isAvailable: boolean;
    currentOrderId?: string | null;
    lastLocation: {
        lat: number;
        lng: number;
        updatedAt: Date;
    } | null;
}

// Класси ёвар барои кор бо маълумотҳои курьер
export class CourierModelHelper {
    // Санҷиши он, ки оё курьер дастрас аст
    static isAvailable(courier: Courier): boolean {
        return courier.isAvailable === true && 
               courier.locationLat !== null && 
               courier.locationLng !== null;
    }

    // Санҷиши он, ки оё курьер дар наздикии нуқтаи додашуда аст (дар доираи radius метр)
    static isNearby(courier: Courier, lat: number, lng: number, radiusMeters: number): boolean {
        if (!courier.locationLat || !courier.locationLng) return false;
        const distance = this.calculateDistance(
            courier.locationLat, courier.locationLng,
            lat, lng
        );
        return distance <= radiusMeters;
    }

    // Ҳисоб кардани масофа (метр) байни ду нуқта (формулаи Ҳаверсин)
    static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371000; // Радиуси Замин (метр)
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

    // Ҳисоб кардани вақти тахминии расидан (дар дақиқа) бо суръати миёнаи 30 км/соат
    static estimateArrivalTime(distanceMeters: number): number {
        const averageSpeedMs = 8.33; // 30 км/соат = 8.33 м/с
        const seconds = distanceMeters / averageSpeedMs;
        return Math.ceil(seconds / 60); // дақиқа
    }

    // Табдил додани User ба CourierResponse
    static toResponse(user: User, totalDeliveries?: number, rating?: number): CourierResponse {
        return {
            id: user.id,
            fullName: user.fullName,
            phone: user.phone,
            email: user.email,
            locationLat: user.locationLat ?? null,
            locationLng: user.locationLng ?? null,
            isAvailable: user.isAvailable ?? false,
            rating: rating ?? 5.0,
            totalDeliveries: totalDeliveries ?? 0,
            createdAt: user.createdAt,
        };
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
