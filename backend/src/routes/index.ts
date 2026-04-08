<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>routes/index.ts</title>
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
// routes/index.ts - Агрегатсияи ҳамаи роутҳои API
import { Router } from 'express';
import { authRoutes } from '../modules/auth';
import { userRoutes } from '../modules/user';
import { orderRoutes } from '../modules/order';
import { courierRoutes } from '../modules/courier';
import { healthRoutes } from '../health';
import { loginLimiter, orderCreationLimiter, locationUpdateLimiter } from '../security/rate-limit';

const router = Router();

// Роутҳои аутентификатсия (бе аутентификатсия)
router.use('/auth', authRoutes);

// Роутҳои корбар (ба аутентификатсия ниёз доранд)
router.use('/users', userRoutes);

// Роутҳои фармоиш (ба аутентификатсия ниёз доранд)
router.use('/orders', orderRoutes);

// Роутҳои курьер (ба аутентификатсия ниёз доранд)
router.use('/courier', courierRoutes);

// Роутҳои саломатӣ
router.use('/health', healthRoutes);

// Эндпоинти санҷиши API
router.get('/ping', (req, res) => {
    res.status(200).json({ success: true, message: 'pong' });
});

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
