<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>roles.ts</title>
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
// common/constants/roles.ts - Доимиҳои нақшҳои корбарон
import { UserRole } from '../../modules/auth/auth.types';

// Объекти доимиҳои нақшҳо
export const ROLES = {
    CLIENT: 'CLIENT' as UserRole,
    COURIER: 'COURIER' as UserRole,
    ADMIN: 'ADMIN' as UserRole,
    DISPATCHER: 'DISPATCHER' as UserRole,
} as const;

// Массиви ҳамаи нақшҳо (барои валидатсия)
export const ALL_ROLES: UserRole[] = Object.values(ROLES);

// Массиви нақшҳое, ки иҷозати дидани омор доранд
export const STATS_ACCESS_ROLES: UserRole[] = [ROLES.ADMIN, ROLES.DISPATCHER];

// Массиви нақшҳое, ки метавонанд курьерҳоро таъин кунанд
export const ASSIGN_COURIER_ROLES: UserRole[] = [ROLES.ADMIN, ROLES.DISPATCHER];

// Массиви нақшҳое, ки метавонанд ҳамаи фармоишҳоро бубинанд
export const VIEW_ALL_ORDERS_ROLES: UserRole[] = [ROLES.ADMIN, ROLES.DISPATCHER];
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
