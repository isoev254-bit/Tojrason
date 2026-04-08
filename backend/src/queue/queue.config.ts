<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>queue.config.ts</title>
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
// queue/queue.config.ts - Танзимоти умумии навбатҳо (BullMQ)
import { constants } from '../config/constants';

export const queueConfig = {
    // Номҳои навбатҳо
    queues: {
        notification: constants.QUEUE_NAMES.NOTIFICATION,
        orderAssign: constants.QUEUE_NAMES.ORDER_ASSIGN,
        email: constants.QUEUE_NAMES.EMAIL,
    },

    // Танзимоти пешфарзи вазифаҳо
    defaultJobOptions: {
        attempts: 3,                     // Шумораи такрори кӯшиш
        backoff: {
            type: 'exponential',         // Навъи бозгашт (экспоненсиалӣ)
            delay: 5000,                 // Таъхири аввал (мс)
        },
        removeOnComplete: 100,           // Нигоҳ доштани 100 вазифаи охири муваффақ
        removeOnFail: 500,               // Нигоҳ доштани 500 вазифаи ноком
    },

    // Танзимоти иҷроиши воркерҳо
    workerSettings: {
        concurrency: {
            notification: 5,              // Шумораи вазифаҳои ҳамзамони уведомление
            orderAssign: 3,              // Таъини фармоиш
            email: 2,                    // Почта
        },
        limiter: {
            max: 10,                     // Максимум 10 вазифа дар як дақиқа
            duration: 60000,
        },
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
