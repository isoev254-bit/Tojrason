<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>order.validator.ts</title>
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
// modules/order/order.validator.ts - Валидатсияи маълумотҳои даромад барои фармоишҳо
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { constants, OrderStatus } from '../../config/constants';

export class OrderValidator {
  // Валидатсияи маълумотҳои эҷоди фармоиш
  static validateCreateOrder(data: any): CreateOrderDto {
    // Санҷиши суроғаи гирифтан
    if (!data.pickupAddress || typeof data.pickupAddress !== 'string' || data.pickupAddress.trim().length < 3) {
      throw new Error('Суроғаи гирифтан ҳатмист ва бояд ҳадди ақал 3 ҳарф дошта бошад');
    }

    // Санҷиши координатаҳои гирифтан
    if (data.pickupLat === undefined || typeof data.pickupLat !== 'number') {
      throw new Error('Арзиши паҳноӣ (pickupLat) ҳатмист ва бояд адад бошад');
    }
    if (data.pickupLng === undefined || typeof data.pickupLng !== 'number') {
      throw new Error('Арзиши дарозӣ (pickupLng) ҳатмист ва бояд адад бошад');
    }
    if (data.pickupLat < -90 || data.pickupLat > 90) {
      throw new Error('pickupLat бояд дар байни -90 ва 90 бошад');
    }
    if (data.pickupLng < -180 || data.pickupLng > 180) {
      throw new Error('pickupLng бояд дар байни -180 ва 180 бошад');
    }

    // Санҷиши суроғаи расонидан
    if (!data.deliveryAddress || typeof data.deliveryAddress !== 'string' || data.deliveryAddress.trim().length < 3) {
      throw new Error('Суроғаи расонидан ҳатмист ва бояд ҳадди ақал 3 ҳарф дошта бошад');
    }

    // Санҷиши координатаҳои расонидан
    if (data.deliveryLat === undefined || typeof data.deliveryLat !== 'number') {
      throw new Error('deliveryLat ҳатмист ва бояд адад бошад');
    }
    if (data.deliveryLng === undefined || typeof data.deliveryLng !== 'number') {
      throw new Error('deliveryLng ҳатмист ва бояд адад бошад');
    }
    if (data.deliveryLat < -90 || data.deliveryLat > 90) {
      throw new Error('deliveryLat бояд дар байни -90 ва 90 бошад');
    }
    if (data.deliveryLng < -180 || data.deliveryLng > 180) {
      throw new Error('deliveryLng бояд дар байни -180 ва 180 бошад');
    }

    // Санҷиши маблағ
    if (data.amount === undefined || typeof data.amount !== 'number' || data.amount < 0) {
      throw new Error('Маблағи фармоиш бояд адади мусбат бошад');
    }
    if (data.amount > 10000000) {
      throw new Error('Маблағи фармоиш набояд аз 10,000,000 зиёд бошад');
    }

    // Санҷиши эзоҳ (агар бошад)
    if (data.clientNote && (typeof data.clientNote !== 'string' || data.clientNote.length > 500)) {
      throw new Error('Эзоҳ набояд аз 500 ҳарф зиёд бошад');
    }

    return data as CreateOrderDto;
  }

  // Валидатсияи маълумотҳои навсозии фармоиш
  static validateUpdateOrder(data: any): UpdateOrderDto {
    const result: UpdateOrderDto = {};

    // Санҷиши статус
    if (data.status !== undefined) {
      const allowedStatuses = Object.values(constants.ORDER_STATUS);
      if (!allowedStatuses.includes(data.status)) {
        throw new Error(`Статуси нодуруст. Статусҳои иҷозатшуда: ${allowedStatuses.join(', ')}`);
      }
      result.status = data.status;
    }

    // Санҷиши courierId
    if (data.courierId !== undefined) {
      if (data.courierId !== null && typeof data.courierId !== 'string') {
        throw new Error('courierId бояд сатр (string) ё null бошад');
      }
      result.courierId = data.courierId;
    }

    // Санҷиши эзоҳи курьер
    if (data.courierNote !== undefined) {
      if (typeof data.courierNote !== 'string' || data.courierNote.length > 500) {
        throw new Error('Эзоҳи курьер набояд аз 500 ҳарф зиёд бошад');
      }
      result.courierNote = data.courierNote;
    }

    // Санҷиши вақтҳо (агар бошад, бояд Date бошад)
    if (data.assignedAt !== undefined) {
      const date = new Date(data.assignedAt);
      if (isNaN(date.getTime())) {
        throw new Error('assignedAt бояд санаи дуруст бошад');
      }
      result.assignedAt = date;
    }
    if (data.pickedUpAt !== undefined) {
      const date = new Date(data.pickedUpAt);
      if (isNaN(date.getTime())) {
        throw new Error('pickedUpAt бояд санаи дуруст бошад');
      }
      result.pickedUpAt = date;
    }
    if (data.deliveredAt !== undefined) {
      const date = new Date(data.deliveredAt);
      if (isNaN(date.getTime())) {
        throw new Error('deliveredAt бояд санаи дуруст бошад');
      }
      result.deliveredAt = date;
    }
    if (data.cancelledAt !== undefined) {
      const date = new Date(data.cancelledAt);
      if (isNaN(date.getTime())) {
        throw new Error('cancelledAt бояд санаи дуруст бошад');
      }
      result.cancelledAt = date;
    }

    return result;
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
