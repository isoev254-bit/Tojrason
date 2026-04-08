<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>producer.ts</title>
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
// queue/producer.ts - Барои илова кардани вазифаҳо ба навбат (queue)
import { Queue } from 'bullmq';
import { redis } from '../config/redis';
import { queueConfig } from './queue.config';
import { NotificationJobData } from './jobs/notification.job';
import logger from '../config/logger';

// Эҷоди навбатҳо
export const notificationQueue = new Queue&lt;NotificationJobData&gt;(queueConfig.queues.notification, {
    connection: redis,
    defaultJobOptions: queueConfig.defaultJobOptions,
});

export const orderAssignQueue = new Queue(queueConfig.queues.orderAssign, {
    connection: redis,
    defaultJobOptions: queueConfig.defaultJobOptions,
});

export const emailQueue = new Queue(queueConfig.queues.email, {
    connection: redis,
    defaultJobOptions: queueConfig.defaultJobOptions,
});

/**
 * Илова кардани вазифа ба навбати уведомлениеҳо
 * @param data - Маълумоти уведомление
 * @param delay - Таъхир (миллисония)
 * @returns ID вазифа
 */
export const addNotificationJob = async (data: NotificationJobData, delay?: number): Promise&lt;string&gt; => {
    const job = await notificationQueue.add('send-notification', data, {
        delay,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
    });
    logger.debug(`Notification job added: ${job.id}`);
    return job.id;
};

/**
 * Илова кардани вазифа ба навбати таъини фармоиш
 * @param orderId - ID фармоиш
 * @param strategy - Стратегияи таъин
 * @param delay - Таъхир
 */
export const addOrderAssignJob = async (orderId: string, strategy: string = 'smart', delay?: number): Promise&lt;string&gt; => {
    const job = await orderAssignQueue.add('assign-order', { orderId, strategy }, {
        delay,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
    });
    logger.debug(`Order assign job added: ${job.id} for order ${orderId}`);
    return job.id;
};

/**
 * Илова кардани вазифа ба навбати почтаи электронӣ
 * @param to - Суроғаи email
 * @param subject - Мавзӯъ
 * @param html - Матни HTML
 */
export const addEmailJob = async (to: string, subject: string, html: string, delay?: number): Promise&lt;string&gt; => {
    const job = await emailQueue.add('send-email', { to, subject, html }, {
        delay,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
    });
    logger.debug(`Email job added: ${job.id} to ${to}`);
    return job.id;
};

/**
 * Пӯшидани ҳамаи навбатҳо (ҳангоми бастани сервер)
 */
export const closeQueues = async (): Promise&lt;void&gt; => {
    await notificationQueue.close();
    await orderAssignQueue.close();
    await emailQueue.close();
    logger.info('All queues closed');
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
