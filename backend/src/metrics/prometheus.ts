<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>prometheus.ts</title>
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
// metrics/prometheus.ts - Конфигуратсияи Prometheus барои ҷамъоварии метрикаҳо
import client from 'prom-client';
import { Express } from 'express';
import { MetricsService } from './metrics.service';
import logger from '../config/logger';

// Регистратсияи коллекторҳои пешфарзи Prometheus
export const register = client.register;

/**
 * Инициализатсияи ҳамаи метрикаҳои Prometheus
 */
export const initPrometheus = (): void => {
    const metricsService = MetricsService.getInstance();
    metricsService.init();
    logger.info('Prometheus metrics initialized');
};

/**
 * Middleware барои ҷамъоварии метрикаҳои HTTP дар Express
 * Ин middleware-ро пеш аз ҳамаи роутҳо илова кунед
 */
export const metricsMiddleware = (req: any, res: any, next: any): void => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const method = req.method;
        const route = req.route ? req.route.path : req.path;
        const statusCode = res.statusCode;
        
        const metricsService = MetricsService.getInstance();
        metricsService.incrementHttpRequests(method, route, statusCode);
        metricsService.observeHttpDuration(duration, method, route, statusCode);
    });
    next();
};

/**
 * Роут барои экспозицияи метрикаҳо (барои Prometheus scraper)
 * Ин роутро ба app илова кунед: app.get('/metrics', metricsHandler);
 */
export const metricsHandler = async (req: any, res: any): Promise&lt;void&gt; => {
    try {
        res.set('Content-Type', register.contentType);
        const metrics = await register.metrics();
        res.status(200).send(metrics);
    } catch (err) {
        logger.error('Error generating metrics:', err);
        res.status(500).send('Error generating metrics');
    }
};

/**
 * Навсозии даврии метрикаҳои gauge (ҳар 30 сония)
 */
export const startPeriodicMetricsUpdate = async (): Promise&lt;NodeJS.Timeout&gt; => {
    const metricsService = MetricsService.getInstance();
    
    // Функсия барои навсозии метрикаҳо
    const updateMetrics = async () => {
        try {
            // Дар ин ҷо метавон аз базаи додаҳо шумораи фармоишҳои фаъол ва курьерҳои онлайнеро гирифт
            // Барои мисол, қиматҳои статикӣ гузошта шудаанд
            // Дар лоиҳаи воқеӣ, инҳоро аз сервисҳои дахлдор гиред
            
            // metricsService.setActiveOrders(activeOrdersCount);
            // metricsService.setCouriersOnline(couriersOnlineCount);
        } catch (error) {
            logger.error('Error updating periodic metrics:', error);
        }
    };
    
    // Аввал фавран иҷро кун, баъд ҳар 30 сония
    await updateMetrics();
    const interval = setInterval(updateMetrics, 30000);
    return interval;
};
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
