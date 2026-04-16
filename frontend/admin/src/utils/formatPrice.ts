<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>formatPrice.ts</title>
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
// frontend/admin/src/utils/formatPrice.ts

/**
 * Формати нарх ба пули тоҷикӣ (сомонӣ)
 * @param price - Нарх (number ё string)
 * @param currency - Валюта (пешфарз: 'TJS')
 * @param showCurrency - Нишон додани рамзи валюта (пешфарз: true)
 * @returns Матни форматшуда, масалан "12,500 сом" ё "12,500"
 */
export const formatPrice = (
    price: number | string,
    currency: string = 'TJS',
    showCurrency: boolean = true
): string => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return '—';
    
    const formatted = new Intl.NumberFormat('tg-TJ', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(num);
    
    if (!showCurrency) return formatted;
    
    const currencySymbols: Record&lt;string, string&gt; = {
        TJS: 'сом',
        USD: '$',
        RUB: '₽',
        EUR: '€',
    };
    
    const symbol = currencySymbols[currency] || currency;
    return `${formatted} ${symbol}`;
};

/**
 * Формати нарх барои пардохт (бо ду рақам пас аз нуқта)
 * @param price - Нарх
 * @returns Матни форматшуда бо 2 рақам, масалан "12,500.00 сом"
 */
export const formatPriceWithFraction = (price: number | string): string => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return '—';
    
    const formatted = new Intl.NumberFormat('tg-TJ', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num);
    
    return `${formatted} сом`;
};

/**
 * Формати нарх барои ноболиғон (бе валюта)
 * @param price - Нарх
 * @returns Матни оддӣ, масалан "12,500"
 */
export const formatPriceSimple = (price: number | string): string => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return '—';
    
    return new Intl.NumberFormat('tg-TJ').format(num);
};

/**
 * Табдил додани нарх ба сенту (барои Stripe)
 * @param price - Нарх дар сомонӣ
 * @returns Нарх дар сент
 */
export const toCents = (price: number): number => {
    return Math.round(price * 100);
};

/**
 * Табдил додани нарх аз сент ба сомонӣ
 * @param cents - Нарх дар сент
 * @returns Нарх дар сомонӣ
 */
export const fromCents = (cents: number): number => {
    return cents / 100;
};
    </pre>
</div>
<script>
function copyCode() {
    const code = document.getElementById('codeBlock').innerText;
    navigator.clipboard.writeText(code).then(() => {
        alert('✅ Код копия карда шуд!');
    }).catch(() => {
        alert('❌ Хатогӣ ҳангоми копия кардан');
    });
}
</script>
</body>
</html>
