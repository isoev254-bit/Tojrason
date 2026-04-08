<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>helmet.ts</title>
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
// security/helmet.ts - Конфигуратсияи Helmet барои ҳифзи HTTP сарлавҳаҳо
import helmet from 'helmet';
import { Express } from 'express';
import { securityConfig } from '../config/security.config';
import { env } from '../config/env';

/**
 * Танзим ва истифодаи Helmet middleware дар барномаи Express
 * @param app - Инстанси Express
 */
export const setupHelmet = (app: Express): void => {
    // Агар дар муҳити истеҳсолӣ бошем, конфигуратсияи пурраро истифода мебарем
    if (env.NODE_ENV === 'production') {
        app.use(helmet(securityConfig.helmet));
    } else {
        // Дар муҳити рушд (development) helmet-ро бо танзимоти камтар истифода мебарем
        app.use(helmet({
            contentSecurityPolicy: false,
            crossOriginEmbedderPolicy: false,
        }));
    }
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
