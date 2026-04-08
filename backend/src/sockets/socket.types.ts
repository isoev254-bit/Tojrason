<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>socket.types.ts</title>
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
// sockets/socket.types.ts - Type'ҳои Socket.IO барои паёмҳо ва рӯйдодҳо
import { UserPayload } from '../modules/auth/auth.types';

// Маълумоти пайвасти сокет (дар socket.data)
export interface SocketData {
    user: UserPayload;
}

// Рӯйдодҳои клиент -> сервер
export interface ClientToServerEvents {
    // Курьер
    'courier:update-location': (data: CourierLocationData) => void;
    'courier:accept-order': (data: AcceptOrderData) => void;
    'courier:update-status': (data: UpdateStatusData) => void;
    
    // Фармоиш
    'order:track': (data: TrackOrderData) => void;
    'order:status_subscribe': (data: SubscribeOrderData) => void;
    
    // Умумӣ
    'disconnect': () => void;
    'error': (err: Error) => void;
}

// Рӯйдодҳои сервер -> клиент
export interface ServerToClientEvents {
    // Курьер
    'location_updated': (data: LocationUpdatedResponse) => void;
    'order_accepted': (data: OrderAcceptedResponse) => void;
    'status_updated': (data: StatusUpdatedResponse) => void;
    
    // Фармоиш
    'order:data': (data: OrderDataResponse) => void;
    'order:status_subscribed': (data: StatusSubscribedResponse) => void;
    'order:assigned': (data: OrderAssignedEvent) => void;
    'order:status-update': (data: OrderStatusUpdateEvent) => void;
    'courier:location-update': (data: CourierLocationUpdateEvent) => void;
    
    // Уведомление
    'notification:new': (data: NotificationEvent) => void;
    
    // Хатогӣ
    'error': (data: ErrorResponse) => void;
}

// Маълумот барои рӯйдодҳои гуногун
export interface CourierLocationData {
    lat: number;
    lng: number;
    isAvailable?: boolean;
}

export interface AcceptOrderData {
    orderId: string;
}

export interface UpdateStatusData {
    isAvailable: boolean;
}

export interface TrackOrderData {
    orderId: string;
}

export interface SubscribeOrderData {
    orderId: string;
}

// Ҷавобҳо
export interface LocationUpdatedResponse {
    success: boolean;
}

export interface OrderAcceptedResponse {
    orderId: string;
    success: boolean;
}

export interface StatusUpdatedResponse {
    isAvailable: boolean;
}

export interface OrderDataResponse {
    id: string;
    clientId: string;
    courierId?: string | null;
    pickupAddress: string;
    deliveryAddress: string;
    status: string;
    paymentStatus: string;
    amount: number;
    deliveryFee: number;
    totalAmount: number;
    clientNote?: string | null;
    courierNote?: string | null;
    assignedAt?: string | null;
    pickedUpAt?: string | null;
    deliveredAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface StatusSubscribedResponse {
    orderId: string;
    status: string;
}

export interface OrderAssignedEvent {
    orderId: string;
    courierId: string;
    courierName: string;
    courierPhone: string;
    assignedAt: string;
}

export interface OrderStatusUpdateEvent {
    orderId: string;
    status: string;
    data?: any;
    timestamp: string;
}

export interface CourierLocationUpdateEvent {
    orderId: string;
    courierId: string;
    lat: number;
    lng: number;
    timestamp: string;
}

export interface NotificationEvent {
    title?: string;
    body: string;
    data?: any;
    timestamp: string;
}

export interface ErrorResponse {
    message: string;
    code?: string;
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
