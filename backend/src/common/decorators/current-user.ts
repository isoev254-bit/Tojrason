<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>current-user.ts</title>
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
// common/decorators/current-user.ts
// Декоратор барои гирифтани маълумоти корбари ҷорӣ аз Request

import { Request } from 'express';
import { UserPayload } from '../../modules/auth/auth.types';

/**
 * Функсияи ёвар барои гирифтани маълумоти корбари ҷорӣ аз объекти Request.
 * Интизор меравад, ки қаблан middleware-и authMiddleware ё AuthGuard истифода шуда бошад.
 * 
 * @param req - Объекти Request-и Express
 * @returns Маълумоти корбар (UserPayload) ё null, агар корбар ворид нашуда бошад
 */
export const getCurrentUser = (req: Request): UserPayload | null => {
    const user = (req as any).user;
    if (!user) {
        return null;
    }
    return user as UserPayload;
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
