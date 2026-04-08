<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>http.exception.ts</title>
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
// common/exceptions/http.exception.ts - Класси хатогии HTTP барои коркарди осони хатогиҳо дар API
export class HttpException extends Error {
    public status: number;
    public message: string;
    public details?: any;

    constructor(status: number, message: string, details?: any) {
        super(message);
        this.status = status;
        this.message = message;
        this.details = details;
        this.name = 'HttpException';
        Error.captureStackTrace(this, this.constructor);
    }
}

// Хатогии 400 - Дархости нодуруст
export class BadRequestException extends HttpException {
    constructor(message: string = 'Дархости нодуруст', details?: any) {
        super(400, message, details);
        this.name = 'BadRequestException';
    }
}

// Хатогии 401 - Аутентификатсия талаб карда мешавад
export class UnauthorizedException extends HttpException {
    constructor(message: string = 'Аутентификатсия талаб карда мешавад', details?: any) {
        super(401, message, details);
        this.name = 'UnauthorizedException';
    }
}

// Хатогии 403 - Дастрасӣ манъ аст
export class ForbiddenException extends HttpException {
    constructor(message: string = 'Дастрасӣ манъ аст', details?: any) {
        super(403, message, details);
        this.name = 'ForbiddenException';
    }
}

// Хатогии 404 - Ёфт нашуд
export class NotFoundException extends HttpException {
    constructor(message: string = 'Захира ёфт нашуд', details?: any) {
        super(404, message, details);
        this.name = 'NotFoundException';
    }
}

// Хатогии 409 - Конфликт (масалан, почтаи такрорӣ)
export class ConflictException extends HttpException {
    constructor(message: string = 'Конфликти додаҳо', details?: any) {
        super(409, message, details);
        this.name = 'ConflictException';
    }
}

// Хатогии 422 - Маълумоти ғайриқобили коркард (валидатсия)
export class UnprocessableEntityException extends HttpException {
    constructor(message: string = 'Маълумоти фиристодашуда ғайриқобили коркард аст', details?: any) {
        super(422, message, details);
        this.name = 'UnprocessableEntityException';
    }
}

// Хатогии 500 - Хатогии дохилии сервер
export class InternalServerErrorException extends HttpException {
    constructor(message: string = 'Хатогии дохилии сервер', details?: any) {
        super(500, message, details);
        this.name = 'InternalServerErrorException';
    }
}
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
