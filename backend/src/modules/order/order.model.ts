<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>order.model.ts</title>
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
// modules/order/order.model.ts - Модели фармоиш барои TypeScript (барои Prisma ин schema.prisma-ро истифода баред)
// Ин файл танҳо барои TypeScript интерфейсҳо ва валидатсияи иловагӣ мебошад.
// Модели асосӣ дар prisma/schema.prisma муайян шудааст.

import { OrderStatus, PaymentStatus } from '../../config/constants';

// Интерфейси пурраи фармоиш (барои истифода дар TypeScript)
export interface OrderModel {
  id: string;
  clientId: string;
  courierId: string | null;
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
  clientNote: string | null;
  courierNote: string | null;
  assignedAt: Date | null;
  pickedUpAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Баъзе методҳои ёвар барои кор бо фармоиш
export class OrderModelHelper {
  // Санҷиши он, ки оё фармоишро бекор кардан мумкин аст
  static isCancellable(order: OrderModel): boolean {
    return order.status !== 'DELIVERED' && order.status !== 'CANCELLED';
  }

  // Санҷиши он, ки оё фармоишро ба курьер таъин кардан мумкин аст
  static isAssignable(order: OrderModel): boolean {
    return order.status === 'PENDING';
  }

  // Санҷиши он, ки оё курьер метавонад фармоишро қабул кунад
  static isAcceptableByCourier(order: OrderModel): boolean {
    return order.status === 'ASSIGNED' && order.courierId === null;
  }

  // Санҷиши он, ки оё фармоишро ҳамчун "гирифта шуд" қайд кардан мумкин аст
  static canBePickedUp(order: OrderModel): boolean {
    return order.status === 'ASSIGNED' && order.courierId !== null;
  }

  // Санҷиши он, ки оё фармоишро ҳамчун "расонида шуд" қайд кардан мумкин аст
  static canBeDelivered(order: OrderModel): boolean {
    return order.status === 'PICKED_UP';
  }

  // Ҳисоб кардани арзиши умумӣ (агар лозим бошад)
  static calculateTotalAmount(amount: number, deliveryFee: number): number {
    return amount + deliveryFee;
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
