<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>order.routes.ts</title>
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
// modules/order/order.routes.ts - Роутҳои марбут ба фармоишҳо
import { Router } from 'express';
import { OrderController } from './order.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { RolesGuard } from '../../common/guards/roles.guard';
import { constants } from '../../config/constants';

const router = Router();

// Ҳамаи роутҳо ба аутентификатсия ниёз доранд
router.use(authMiddleware);

// Роутҳои клиент
router.post('/', RolesGuard([constants.ROLES.CLIENT]), OrderController.createOrder);
router.get('/my-orders', RolesGuard([constants.ROLES.CLIENT]), OrderController.getMyOrders);
router.get('/my-courier-orders', RolesGuard([constants.ROLES.COURIER]), OrderController.getMyCourierOrders);
router.get('/:id', OrderController.getOrderById);
router.patch('/:id/status', OrderController.updateOrderStatus);
router.patch('/:id/assign', RolesGuard([constants.ROLES.ADMIN, constants.ROLES.DISPATCHER]), OrderController.assignCourier);
router.post('/:id/cancel', OrderController.cancelOrder);

// Роутҳои админ
router.get('/', RolesGuard([constants.ROLES.ADMIN]), OrderController.getAllOrders);

export default router;
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
