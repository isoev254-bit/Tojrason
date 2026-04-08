<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>courier.types.ts</title>
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
// modules/courier/courier.types.ts - Type'ҳои махсуси модули курьер

// Омори курьер
export interface CourierStats {
    courierId: string;
    totalDelivered: number;      // Шумораи фармоишҳои расонидашуда
    totalEarnings: number;       // Маблағи умумии бадастомада
    activeOrdersCount: number;   // Шумораи фармоишҳои фаъол (дар ҳоли иҷро)
    rating: number;              // Рейтинг (аз 1 то 5)
}

// Фармоиш барои курьер (дар рӯйхати дастрас)
export interface CourierOrderResponse {
    id: string;
    pickupAddress: string;
    pickupLat: number;
    pickupLng: number;
    deliveryAddress: string;
    amount: number;
    deliveryFee: number;
    totalAmount: number;
    distance?: number;           // Масофа то нуқтаи гирифтан (метр)
    client: {
        fullName: string;
        phone: string;
    };
    createdAt: Date;
}

// Ҷойгиршавии курьер барои пахш (Socket)
export interface CourierLocationPayload {
    courierId: string;
    lat: number;
    lng: number;
    timestamp: string;
}

// Ҷавоби қабули фармоиш аз ҷониби курьер
export interface AcceptOrderResponse {
    orderId: string;
    courierId: string;
    status: string;
    acceptedAt: Date;
}

// Маълумот барои дархости навсозии ҳолат (available / unavailable)
export interface UpdateAvailabilityDto {
    isAvailable: boolean;
}

// Натиҷаи ҷустуҷӯи курьерҳои наздик
export interface NearbyCourier {
    courierId: string;
    fullName: string;
    distance: number;   // метр
    rating: number;
}

// Параметрҳои ҷустуҷӯи фармоишҳои дастрас
export interface AvailableOrdersQuery {
    lat: number;
    lng: number;
    radius?: number;    // метр, пешфарз аз constants.MAX_COURIER_DISTANCE_METERS
    limit?: number;
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
