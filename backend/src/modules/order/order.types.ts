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
// modules/order/order.types.ts - Type'ҳои асосии модули order
import { OrderStatus, PaymentStatus } from '../../config/constants';

// Маълумоти пурраи фармоиш
export interface Order {
  id: string;
  clientId: string;
  courierId?: string | null;
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
  assignedAt?: Date | null;
  pickedUpAt?: Date | null;
  deliveredAt?: Date | null;
  cancelledAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Маълумот барои эҷоди фармоиш
export interface CreateOrderData {
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  amount: number;
  clientNote?: string;
}

// Маълумот барои навсозии фармоиш
export interface UpdateOrderData {
  status?: OrderStatus;
  courierId?: string | null;
  courierNote?: string;
  assignedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
}

// Ҷавоби фармоиш барои клиент (бе маълумоти ҳассос)
export interface OrderResponse {
  id: string;
  clientId: string;
  courierId?: string | null;
  pickupAddress: string;
  deliveryAddress: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  amount: number;
  deliveryFee: number;
  totalAmount: number;
  clientNote?: string | null;
  courierNote?: string | null;
  assignedAt?: Date | null;
  pickedUpAt?: Date | null;
  deliveredAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Филтр барои ҷустуҷӯи фармоишҳо
export interface OrderFilters {
  clientId?: string;
  courierId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  limit?: number;
}

// Натиҷаи саҳифабандӣ
export interface PaginatedOrders {
  data: OrderResponse[];
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
        alert('Код копия карда шуд!');
    }).catch(() => {
        alert('Хатогӣ ҳангоми копия кардан');
    });
}
</script>
</body>
</html>
