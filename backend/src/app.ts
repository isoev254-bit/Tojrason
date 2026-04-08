<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>app.ts</title>
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
// app.ts - Конфигуратсияи асосии барномаи Express
import express, { Express } from 'express';
import { setupHelmet, setupCors, setupRateLimits } from './security';
import { loggerMiddleware } from './common/middleware/logger.middleware';
import { errorMiddleware, notFoundMiddleware } from './common/middleware/error.middleware';
import { metricsMiddleware, metricsHandler, initPrometheus, startPeriodicMetricsUpdate } from './metrics';
import { setupSwagger } from './docs/swagger';
import routes from './routes';
import { env } from './config/env';
import logger from './config/logger';

const app: Express = express();

// 1. Танзимоти амният (Helmet, CORS)
setupHelmet(app);
setupCors(app);

// 2. Парсингҳои JSON ва URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Rate limiting (пешгирии ҳамлаҳо)
setupRateLimits(app);

// 4. Логгированиеи дархостҳо
app.use(loggerMiddleware);

// 5. Метрикаҳои Prometheus (агар дар муҳити истеҳсолӣ ё рушд бошад)
if (env.NODE_ENV !== 'test') {
    initPrometheus();
    app.use(metricsMiddleware);
    app.get('/metrics', metricsHandler);
    startPeriodicMetricsUpdate().catch(err => logger.error('Failed to start metrics update:', err));
}

// 6. Swagger Documentation (танҳо дар рушд ё истеҳсолӣ)
if (env.NODE_ENV !== 'test') {
    setupSwagger(app);
}

// 7. Роутҳои API
app.use('/api', routes);

// 8. Роути оддии санҷишӣ
app.get('/', (req, res) => {
    res.status(200).json({
        name: 'Tojrason Delivery System',
        version: '1.0.0',
        status: 'running',
        environment: env.NODE_ENV,
    });
});

// 9. Роути роутҳои номавҷуд (404)
app.use(notFoundMiddleware);

// 10. Middleware барои коркарди хатогиҳо (бояд дар охир бошад)
app.use(errorMiddleware);

export default app;
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
