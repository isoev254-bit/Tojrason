<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>logger.middleware.ts</title>
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
// common/middleware/logger.middleware.ts - Middleware барои логированиеи дархостҳо
import { Request, Response, NextFunction } from 'express';
import logger from '../../config/logger';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();
    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'] || '-';

    // Логгированиеи дархост
    logger.info(`➡️  ${method} ${originalUrl} - IP: ${ip} - UA: ${userAgent}`);

    // Сабти вокуниш пас аз анҷом
    res.on('finish', () => {
        const duration = Date.now() - start;
        const { statusCode } = res;
        const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
        logger[level](`⬅️  ${method} ${originalUrl} - ${statusCode} - ${duration}ms`);
    });

    next();
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
