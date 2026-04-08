<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>global.d.ts</title>
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
// common/types/global.d.ts - Таърифҳои глобалии TypeScript
import { UserPayload } from '../../modules/auth/auth.types';

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
        }
    }
}

// Барои истифодаи модулҳои CSS (агар лозим бошад)
declare module '*.css' {
    const content: { [className: string]: string };
    export default content;
}

// Барои истифодаи файлҳои JSON
declare module '*.json' {
    const value: any;
    export default value;
}

// Барои муҳити Node.js (агар баъзе тағйирёбандаҳои глобалӣ лозим бошанд)
declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: 'development' | 'production' | 'test';
        PORT: string;
        DATABASE_URL: string;
        JWT_SECRET: string;
        REDIS_URL: string;
        STRIPE_SECRET_KEY?: string;
        STRIPE_WEBHOOK_SECRET?: string;
    }
}
export {};
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
