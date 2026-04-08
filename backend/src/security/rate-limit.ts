<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>rate-limit.ts</title>
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
// security/rate-limit.ts - Конфигуратсияи Rate Limiting барои пешгирии ҳамлаҳои brute-force
import rateLimit from 'express-rate-limit';
import { securityConfig } from '../config/security.config';
import { Express } from 'express';

/**
 * Rate limiter умумӣ барои ҳамаи API дархостҳо
 */
export const generalLimiter = rateLimit({
    windowMs: securityConfig.rateLimit.windowMs,
    max: securityConfig.rateLimit.max,
    standardHeaders: securityConfig.rateLimit.standardHeaders,
    legacyHeaders: securityConfig.rateLimit.legacyHeaders,
    keyGenerator: securityConfig.rateLimit.keyGenerator,
    skipSuccessfulRequests: securityConfig.rateLimit.skipSuccessfulRequests,
    message: {
        success: false,
        message: 'Шумо аз ҳад зиёд дархост фиристодед. Лутфан баъдтар такрор кунед.',
    },
});

/**
 * Rate limiter махсус барои логин (маҳдудияти сахттар)
 */
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 дақиқа
    max: 5, // ҳадди аксар 5 кӯшиш
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Шумо 5 маротиба беиҷозат кӯшиш кардед. Лутфан 15 дақиқа дигар интизор шавед.',
    },
});

/**
 * Rate limiter барои эҷоди фармоиш (пешгирии спам)
 */
export const orderCreationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 соат
    max: 20, // ҳадди аксар 20 фармоиш дар як соат
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Шумо аз ҳад зиёд фармоиш эҷод кардед. Лутфан баъдтар такрор кунед.',
    },
});

/**
 * Rate limiter барои навсозии ҷойгиршавӣ (пешгирии спами координатаҳо)
 */
export const locationUpdateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 дақиқа
    max: 30, // ҳадди аксар 30 маротиба дар як дақиқа
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Шумо аз ҳад зиёд дархост фиристодед. Лутфан каме интизор шавед.',
    },
});

/**
 * Танзими rate limiters дар барномаи Express
 * @param app - Инстанси Express
 */
export const setupRateLimits = (app: Express): void => {
    // Барои ҳамаи роутҳои API, rate limiter-и умумиро истифода мебарем
    app.use('/api/', generalLimiter);
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
