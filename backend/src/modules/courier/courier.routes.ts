<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>courier.routes.ts</title>
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
// modules/courier/courier.routes.ts - Роутҳои марбут ба курьерҳо
import { Router } from 'express';
import { CourierController } from './courier.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { RolesGuard } from '../../common/guards/roles.guard';
import { constants } from '../../config/constants';

const router = Router();

// Ҳамаи роутҳо ба аутентификатсия ниёз доранд
router.use(authMiddleware);

// Роутҳои курьер (танҳо барои нақши COURIER)
router.put(
    '/location',
    RolesGuard([constants.ROLES.COURIER]),
    CourierController.updateLocation
);

router.get(
    '/profile',
    RolesGuard([constants.ROLES.COURIER]),
    CourierController.getProfile
);

router.get(
    '/stats',
    RolesGuard([constants.ROLES.COURIER]),
    CourierController.getStats
);

router.get(
    '/available-orders',
    RolesGuard([constants.ROLES.COURIER]),
    CourierController.getAvailableOrders
);

router.post(
    '/orders/:orderId/accept',
    RolesGuard([constants.ROLES.COURIER]),
    CourierController.acceptOrder
);

router.post(
    '/orders/:orderId/complete',
    RolesGuard([constants.ROLES.COURIER]),
    CourierController.completeOrder
);

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
