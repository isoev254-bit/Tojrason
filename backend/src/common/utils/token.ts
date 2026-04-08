<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>token.ts</title>
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
// common/utils/token.ts - Генератсия ва тасдиқи JWT токенҳо
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { UserPayload } from '../../modules/auth/auth.types';

/**
 * Генератсияи JWT токен барои корбар
 * @param payload - Маълумоти корбар (id, email, role, fullName)
 * @returns Токен дар формати string
 */
export const generateToken = (payload: UserPayload): string => {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
    });
};

/**
 * Тасдиқ ва гирифтани маълумот аз JWT токен
 * @param token - Токен аз заголовки Authorization
 * @returns Маълумоти корбар (UserPayload) ё null, агар токен беэътибор бошад
 */
export const verifyToken = (token: string): UserPayload | null => {
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as UserPayload;
        return decoded;
    } catch (error) {
        return null;
    }
};

/**
 * Азнавсозии токен (refresh token) - агар лозим бошад
 * @param payload - Маълумоти корбар
 * @returns Токени нав
 */
export const refreshToken = (payload: UserPayload): string => {
    return generateToken(payload);
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
