<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>roles.guard.ts</title>
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
// common/guards/roles.guard.ts - Guard барои санҷиши нақшҳо (role-based access control)
import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../modules/auth/auth.types';

/**
 * Фабрикаи guard барои санҷиши он, ки корбари ҷорӣ яке аз нақшҳои иҷозатшударо дорад.
 * @param allowedRoles - Массиви нақшҳои иҷозатшуда (масалан ['ADMIN', 'DISPATCHER'])
 * @returns Middleware-и Express
 */
export const RolesGuard = (allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = (req as any).user;
        
        if (!user) {
            res.status(401).json({ 
                success: false, 
                message: 'Аутентификатсия талаб карда мешавад' 
            });
            return;
        }
        
        if (!allowedRoles.includes(user.role)) {
            res.status(403).json({ 
                success: false, 
                message: `Дастрасӣ манъ аст. Нақши шумо (${user.role}) барои ин амал кофӣ нест. Нақшҳои зарурӣ: ${allowedRoles.join(', ')}` 
            });
            return;
        }
        
        next();
    };
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
