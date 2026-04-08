<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>geolocation.ts</title>
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
// common/utils/geolocation.ts - Функсияҳои ҳисобкунии масофа ва ҷустуҷӯи координатаҳо

/**
 * Ҳисоб кардани масофа (дар метр) байни ду нуқта бо истифода аз формулаи Ҳаверсин (Haversine)
 * @param lat1 - Арзиши паҳноии нуқтаи 1 (градус)
 * @param lon1 - Арзиши дарозии нуқтаи 1 (градус)
 * @param lat2 - Арзиши паҳноии нуқтаи 2 (градус)
 * @param lon2 - Арзиши дарозии нуқтаи 2 (градус)
 * @returns Масофа дар метр
 */
export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371000; // Радиуси Замин (метр)
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Ҳисоб кардани вақти тахминии расидан (дар дақиқа) дар асоси масофа ва суръати миёна
 * @param distanceMeters - Масофа (метр)
 * @param averageSpeedKmh - Суръати миёна (км/соат), пешфарз = 30 км/соат
 * @returns Вақт (дақиқа)
 */
export const estimateArrivalTime = (distanceMeters: number, averageSpeedKmh: number = 30): number => {
    const speedMs = averageSpeedKmh * 1000 / 3600; // м/с
    const seconds = distanceMeters / speedMs;
    return Math.ceil(seconds / 60);
};

/**
 * Фильтр кардани рӯйхати нуқтаҳо дар доираи радиуси додашуда аз нуқтаи марказӣ
 * @param points - Рӯйхати нуқтаҳо (ҳар кадоми онҳо lat ва lng доранд)
 * @param centerLat - Арзиши паҳноии марказ
 * @param centerLng - Арзиши дарозии марказ
 * @param radiusMeters - Радиус (метр)
 * @returns Нуқтаҳое, ки дар дохили радиус ҳастанд, бо масофаи онҳо
 */
export const filterPointsWithinRadius = &lt;T extends { lat: number; lng: number }&gt;(
    points: T[],
    centerLat: number,
    centerLng: number,
    radiusMeters: number
): Array&lt;T & { distance: number }&gt; => {
    const result: Array&lt;T & { distance: number }&gt; = [];
    for (const point of points) {
        const distance = calculateDistance(centerLat, centerLng, point.lat, point.lng);
        if (distance <= radiusMeters) {
            result.push({ ...point, distance });
        }
    }
    return result.sort((a, b) => a.distance - b.distance);
};
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
