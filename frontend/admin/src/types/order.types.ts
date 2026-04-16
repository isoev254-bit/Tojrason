<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>order.types.ts</title>
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
// frontend/admin/src/types/order.types.ts
export type OrderStatus = 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface Order {
    id: string;
    clientId: string;
    clientName: string;
    clientPhone: string;
    courierId?: string | null;
    courierName?: string;
    pickupAddress: string;
    pickupLat: number;
    pickupLng: number;
    deliveryAddress: string;
    deliveryLat: number;
    deliveryLng: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    amount: number;
    deliveryFee: number;
    totalAmount: number;
    clientNote?: string | null;
    courierNote?: string | null;
    assignedAt?: string | null;
    pickedUpAt?: string | null;
    deliveredAt?: string | null;
    cancelledAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrderRequest {
    pickupAddress: string;
    pickupLat: number;
    pickupLng: number;
    deliveryAddress: string;
    deliveryLat: number;
    deliveryLng: number;
    amount: number;
    clientNote?: string;
}

export interface UpdateOrderRequest {
    status?: OrderStatus;
    courierId?: string | null;
    courierNote?: string;
    assignedAt?: string;
    pickedUpAt?: string;
    deliveredAt?: string;
    cancelledAt?: string;
}

export interface OrderFilters {
    clientId?: string;
    courierId?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedOrders {
    data: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
    </pre>
</div>
<script>
function copyCode() {
    const code = document.getElementById('codeBlock').innerText;
    navigator.clipboard.writeText(code).then(() => {
        alert('✅ Код копия карда шуд!');
    }).catch(() => {
        alert('❌ Хатогӣ ҳангоми копия кардан');
    });
}
</script>
</body>
</html>
