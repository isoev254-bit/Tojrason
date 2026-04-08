<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>validation.exception.ts</title>
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
// common/exceptions/validation.exception.ts - Хатогии махсуси валидатсия барои коркарди осони хатогиҳои майдонҳо
import { HttpException } from './http.exception';

export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}

export class ValidationException extends HttpException {
    public errors: ValidationError[];

    constructor(errors: ValidationError[], message: string = 'Маълумотҳои фиристодашуда ғайриқобили қабул аст') {
        super(422, message, errors);
        this.errors = errors;
        this.name = 'ValidationException';
    }

    /**
     * Созиши ValidationException аз объекти хатогиҳои зерин (масалан аз express-validator)
     * @param errorObj - Массив ё объекти хатогиҳо
     * @returns ValidationException
     */
    static fromValidationErrors(errorObj: any[] | Record&lt;string, string&gt;): ValidationException {
        const errors: ValidationError[] = [];

        if (Array.isArray(errorObj)) {
            // Формати express-validator
            for (const err of errorObj) {
                errors.push({
                    field: err.param || err.path || 'unknown',
                    message: err.msg || 'Invalid value',
                    value: err.value,
                });
            }
        } else {
            // Формати объекти оддӣ (field -> message)
            for (const [field, message] of Object.entries(errorObj)) {
                errors.push({
                    field,
                    message: message as string,
                });
            }
        }

        return new ValidationException(errors);
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
