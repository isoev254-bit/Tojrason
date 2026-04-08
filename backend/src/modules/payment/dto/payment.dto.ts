<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>payment.dto.ts</title>
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
// modules/payment/dto/payment.dto.ts - DTO барои пардохт
export class CreatePaymentDto {
    /** ID фармоиш */
    orderId!: string;

    /** Маблағи пардохт (ба сомонӣ) */
    amount!: number;

    /** Валюта (пешфарз: TJS) */
    currency?: string;

    /** Усули пардохт (stripe, cash) */
    method?: string;

    /** URL барои бозгашт пас аз пардохт (барои Stripe) */
    successUrl?: string;

    /** URL барои бекоркунӣ */
    cancelUrl?: string;
}

export class ConfirmPaymentDto {
    /** ID пардохт дар системаи мо */
    paymentId?: string;

    /** ID пардохт аз провайдер (масалан stripePaymentIntentId) */
    providerPaymentId?: string;

    /** Статуси пардохт аз провайдер */
    status?: string;
}

export class RefundPaymentDto {
    /** ID пардохт */
    paymentId!: string;

    /** Маблағи бозгардон (агар пурра набошад) */
    amount?: number;

    /** Сабаби бозгардон */
    reason?: string;
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
