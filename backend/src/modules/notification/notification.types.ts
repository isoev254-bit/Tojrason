<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>notification.types.ts</title>
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
// modules/notification/notification.types.ts - Type'ҳои асосии модули уведомление

// Навъи уведомление (барои табаккунӣ)
export type NotificationType = 
    | 'order_created'
    | 'order_assigned'
    | 'order_status_changed'
    | 'order_delivered'
    | 'order_cancelled'
    | 'payment_succeeded'
    | 'payment_failed'
    | 'courier_assigned'
    | 'general';

// Опсияҳои фиристодани уведомление
export interface SendOptions {
    to: string;              // Рақами телефон, email, ё deviceToken (барои push)
    subject?: string;        // Мавзӯъ (барои email ё push)
    template?: string;       // Матни шаблон (ё HTML)
    data?: Record&lt;string, any&gt;; // Маълумоти иловагӣ барои шаблон
    type?: NotificationType; // Навъи уведомление (ихтиёрӣ)
}

// Натиҷаи фиристодани уведомление
export interface SendResult {
    success: boolean;
    channel: string;        // 'sms', 'email', 'push'
    recipient: string;
    error?: string;
    timestamp?: Date;
}

// Интерфейси умумии канали уведомление
export interface NotificationChannel {
    name: string;
    send(options: SendOptions): Promise&lt;SendResult&gt;;
}

// Уведомление дар система (барои нигоҳдорӣ дар БД - агар лозим бошад)
export interface NotificationRecord {
    id: string;
    userId: string;
    type: NotificationType;
    title?: string;
    body: string;
    data?: Record&lt;string, any&gt;;
    isRead: boolean;
    createdAt: Date;
    readAt?: Date;
}

// Филтр барои ҷустуҷӯи уведомлениеҳои корбар
export interface NotificationFilters {
    userId?: string;
    type?: NotificationType;
    isRead?: boolean;
    fromDate?: Date;
    toDate?: Date;
    page?: number;
    limit?: number;
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
