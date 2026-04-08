<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>cache.keys.ts</title>
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
// cache/cache.keys.ts - Калидҳои стандартии кэш барои истифода дар тамоми лоиҳа

export const CacheKeys = {
    // Префиксҳои умумӣ
    PREFIX: {
        USER: 'user:',
        ORDER: 'order:',
        COURIER: 'courier:',
        LOCATION: 'location:',
        SESSION: 'session:',
    },

    // Функсияҳои генератсияи калидҳо
    /**
     * Калиди маълумоти корбар
     * @param userId - ID корбар
     * @returns калид: "user:{userId}"
     */
    user: (userId: string): string => `${CacheKeys.PREFIX.USER}${userId}`,

    /**
     * Калиди маълумоти фармоиш
     * @param orderId - ID фармоиш
     * @returns калид: "order:{orderId}"
     */
    order: (orderId: string): string => `${CacheKeys.PREFIX.ORDER}${orderId}`,

    /**
     * Калиди ҷойгиршавии курьер
     * @param courierId - ID курьер
     * @returns калид: "courier:location:{courierId}"
     */
    courierLocation: (courierId: string): string => `${CacheKeys.PREFIX.COURIER}location:${courierId}`,

    /**
     * Калиди сессияи корбар
     * @param sessionId - ID сессия
     * @returns калид: "session:{sessionId}"
     */
    session: (sessionId: string): string => `${CacheKeys.PREFIX.SESSION}${sessionId}`,

    /**
     * Калиди рӯйхати фармоишҳои клиент
     * @param clientId - ID клиент
     * @param page - саҳифа
     * @param limit - лимит
     * @returns калид: "user:{clientId}:orders:page{page}:limit{limit}"
     */
    clientOrders: (clientId: string, page: number, limit: number): string => 
        `${CacheKeys.PREFIX.USER}${clientId}:orders:page${page}:limit${limit}`,

    /**
     * Калиди рӯйхати курьерҳои дастрас
     * @param lat - арзиши паҳноӣ
     * @param lng - арзиши дарозӣ
     * @param radius - радиус (метр)
     * @returns калид: "courier:available:lat{lat}:lng{lng}:radius{radius}"
     */
    availableCouriers: (lat: number, lng: number, radius: number): string =>
        `${CacheKeys.PREFIX.COURIER}available:lat${lat}:lng${lng}:radius${radius}`,

    /**
     * Намунаи калидҳо барои нест кардан бо префикс (масалан "order:*")
     */
    pattern: {
        allUsers: `${CacheKeys.PREFIX.USER}*`,
        allOrders: `${CacheKeys.PREFIX.ORDER}*`,
        allCouriers: `${CacheKeys.PREFIX.COURIER}*`,
        allSessions: `${CacheKeys.PREFIX.SESSION}*`,
    },
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
