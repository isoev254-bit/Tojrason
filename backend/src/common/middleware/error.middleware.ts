<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>error.middleware.ts</title>
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
// common/middleware/error.middleware.ts - Middleware барои коркарди хатогиҳо
import { Request, Response, NextFunction } from 'express';
import logger from '../../config/logger';
import { env } from '../../config/env';

// Класси хатогии HTTP барои коркарди осонтар
export class HttpException extends Error {
    status: number;
    message: string;
    details?: any;

    constructor(status: number, message: string, details?: any) {
        super(message);
        this.status = status;
        this.message = message;
        this.details = details;
        this.name = 'HttpException';
    }
}

// Middleware барои коркарди хатогиҳои умумӣ
export const errorMiddleware = (
    err: Error | HttpException,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Муайян кардани статус ва паём
    let status = 500;
    let message = 'Хатогии дохилии сервер';
    let details: any = undefined;

    if (err instanceof HttpException) {
        status = err.status;
        message = err.message;
        details = err.details;
    } else if (err.message) {
        // Хатогиҳои оддӣ (масалан аз валидатсия)
        if (err.message.includes('Email') || err.message.includes('phone') || err.message.includes('парол')) {
            status = 400;
        }
        message = err.message;
    }

    // Логгированиеи хатогӣ
    if (status >= 500) {
        logger.error(`[${status}] ${message}`, { stack: err.stack, url: req.originalUrl });
    } else {
        logger.warn(`[${status}] ${message} - ${req.method} ${req.originalUrl}`);
    }

    // Фиристодани ҷавоб
    res.status(status).json({
        success: false,
        message,
        ...(details && { details }),
        ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

// Middleware барои коркарди роутҳои номавҷуд (404)
export const notFoundMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const error = new HttpException(404, `Роути ${req.method} ${req.originalUrl} ёфт нашуд`);
    next(error);
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
