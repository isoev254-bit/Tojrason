<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>health.routes.ts</title>
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
// health/health.routes.ts - Роутҳо барои санҷиши саломатии сервер
import { Router } from 'express';
import { HealthService } from './health.service';

const router = Router();
const healthService = new HealthService();

// Санҷиши асосии саломатӣ
router.get('/', async (req, res) => {
    const result = await healthService.check();
    res.status(result.status === 'healthy' ? 200 : 503).json(result);
});

// Санҷиши муфассал (барои мониторинг)
router.get('/detailed', async (req, res) => {
    const result = await healthService.getDetailedStatus();
    res.status(result.status === 'healthy' ? 200 : 503).json(result);
});

// Санҷиши пайвастшавӣ ба базаи додаҳо
router.get('/db', async (req, res) => {
    const isConnected = await healthService.checkDatabase();
    if (isConnected) {
        res.status(200).json({ success: true, message: 'Database connected' });
    } else {
        res.status(503).json({ success: false, message: 'Database connection failed' });
    }
});

// Санҷиши пайвастшавӣ ба Redis
router.get('/redis', async (req, res) => {
    const isConnected = await healthService.checkRedis();
    if (isConnected) {
        res.status(200).json({ success: true, message: 'Redis connected' });
    } else {
        res.status(503).json({ success: false, message: 'Redis connection failed' });
    }
});

// Санҷиши пурра (барои load balancer)
router.get('/ready', async (req, res) => {
    const isReady = await healthService.isReady();
    if (isReady) {
        res.status(200).json({ success: true, message: 'Service is ready' });
    } else {
        res.status(503).json({ success: false, message: 'Service is not ready' });
    }
});

// Санҷиши зиндагии сервер (барои liveness probe)
router.get('/live', (req, res) => {
    res.status(200).json({ success: true, message: 'Service is alive' });
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
