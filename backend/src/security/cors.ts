<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>cors.ts</title>
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
// security/cors.ts - Конфигуратсияи CORS (Cross-Origin Resource Sharing)
import cors from 'cors';
import { Express } from 'express';
import { securityConfig } from '../config/security.config';
import { env } from '../config/env';

/**
 * Танзим ва истифодаи CORS middleware дар барномаи Express
 * @param app - Инстанси Express
 */
export const setupCors = (app: Express): void => {
    // Агар дар муҳити рушд бошем, CORS-ро барои ҳамаи доменҳо мекушоем
    if (env.NODE_ENV === 'development') {
        app.use(cors({
            origin: '*',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        }));
    } else {
        // Дар муҳити истеҳсолӣ танҳо доменҳои муайян
        app.use(cors(securityConfig.cors));
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
