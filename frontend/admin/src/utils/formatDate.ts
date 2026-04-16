<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>formatDate.ts</title>
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
// frontend/admin/src/utils/formatDate.ts

/**
 * Формати сана ба формати маҳаллӣ (тоҷикӣ)
 * @param date - Сана (Date, string, number)
 * @param options - Имконоти Intl.DateTimeFormat
 * @returns Санаи форматшуда
 */
export const formatDate = (
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions
): string => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    
    return d.toLocaleDateString('tg-TJ', options || defaultOptions);
};

/**
 * Формати сана бо вақт
 * @param date - Сана
 * @returns Сана + вақт
 */
export const formatDateTime = (date: Date | string | number): string => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    
    return d.toLocaleString('tg-TJ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};

/**
 * Формати вақт (танҳо соат:дақиқа)
 * @param date - Сана
 * @returns Вақт (HH:MM)
 */
export const formatTime = (date: Date | string | number): string => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    
    return d.toLocaleTimeString('tg-TJ', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Формати нисбӣ (масалан "2 соат пеш", "3 рӯз пеш")
 * @param date - Сана
 * @returns Матни нисбӣ
 */
export const formatRelativeTime = (date: Date | string | number): string => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);
    
    if (diffSec < 60) return 'ҳозир';
    if (diffMin < 60) return `${diffMin} дақ пеш`;
    if (diffHour < 24) return `${diffHour} соат пеш`;
    if (diffDay < 7) return `${diffDay} рӯз пеш`;
    if (diffWeek < 4) return `${diffWeek} ҳафта пеш`;
    if (diffMonth < 12) return `${diffMonth} моҳ пеш`;
    return `${diffYear} сол пеш`;
};

/**
 * Табдил додани сана ба формат YYYY-MM-DD (барои input date)
 * @param date - Сана
 * @returns Формат YYYY-MM-DD
 */
export const toDateInputValue = (date: Date | string | number): string => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};

/**
 * Табдил додани сана ба формат YYYY-MM-DD HH:MM:SS (барои API)
 * @param date - Сана
 * @returns Формат ISO
 */
export const toISODateTime = (date: Date | string | number): string => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return d.toISOString();
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
