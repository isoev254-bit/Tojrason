<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>dispatch.types.ts</title>
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
// modules/dispatch/dispatch.types.ts - Type'ҳои асосии модули диспетчеризатсия

// Маълумот дар бораи фармоиш барои диспетчер
export interface OrderInfo {
    orderId: string;
    pickupLat: number;
    pickupLng: number;
    deliveryLat: number;
    deliveryLng: number;
    amount: number;
}

// Маълумот дар бораи курьер барои баҳодиҳӣ
export interface CourierInfo {
    id: string;
    lat: number;
    lng: number;
    isAvailable: boolean;
    rating?: number;
    activeOrdersCount?: number;
    totalDeliveries?: number;
    baseFee?: number;
    ratePerKm?: number;
    distanceToPickup?: number; // масофа то нуқтаи гирифтан (метр)
}

// Натиҷаи баҳодиҳӣ барои як курьер
export interface CourierScore {
    courierId: string;
    score: number;      // Рейтинг (0-100)
    distance: number;   // Масофа то фармоиш (метр)
    reason?: string;    // Сабаб (барои лог)
}

// Натиҷаи амалиёти таъин
export interface AssignResult {
    success: boolean;
    message: string;
    orderId: string;
    courierId?: string;
    score?: number;
    reason?: string;
}

// Параметрҳои ҷустуҷӯи фармоишҳои дастрас барои диспетчер
export interface DispatchQuery {
    status?: string;
    fromDate?: Date;
    toDate?: Date;
    page?: number;
    limit?: number;
}

// Статистикаи диспетчер (барои гузориш)
export interface DispatchStats {
    totalAssigned: number;
    totalDelivered: number;
    averageAssignmentTimeSeconds: number;
    averageDeliveryTimeSeconds: number;
    strategyUsage: Record&lt;string, number&gt;; // номи стратегия -> шумораи истифода
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
</html><!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>dispatch.types.ts</title>
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
// modules/dispatch/dispatch.types.ts - Type'ҳои асосии модули диспетчеризатсия

// Маълумот дар бораи фармоиш барои диспетчер
export interface OrderInfo {
    orderId: string;
    pickupLat: number;
    pickupLng: number;
    deliveryLat: number;
    deliveryLng: number;
    amount: number;
}

// Маълумот дар бораи курьер барои баҳодиҳӣ
export interface CourierInfo {
    id: string;
    lat: number;
    lng: number;
    isAvailable: boolean;
    rating?: number;
    activeOrdersCount?: number;
    totalDeliveries?: number;
    baseFee?: number;
    ratePerKm?: number;
    distanceToPickup?: number; // масофа то нуқтаи гирифтан (метр)
}

// Натиҷаи баҳодиҳӣ барои як курьер
export interface CourierScore {
    courierId: string;
    score: number;      // Рейтинг (0-100)
    distance: number;   // Масофа то фармоиш (метр)
    reason?: string;    // Сабаб (барои лог)
}

// Натиҷаи амалиёти таъин
export interface AssignResult {
    success: boolean;
    message: string;
    orderId: string;
    courierId?: string;
    score?: number;
    reason?: string;
}

// Параметрҳои ҷустуҷӯи фармоишҳои дастрас барои диспетчер
export interface DispatchQuery {
    status?: string;
    fromDate?: Date;
    toDate?: Date;
    page?: number;
    limit?: number;
}

// Статистикаи диспетчер (барои гузориш)
export interface DispatchStats {
    totalAssigned: number;
    totalDelivered: number;
    averageAssignmentTimeSeconds: number;
    averageDeliveryTimeSeconds: number;
    strategyUsage: Record&lt;string, number&gt;; // номи стратегия -> шумораи истифода
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
