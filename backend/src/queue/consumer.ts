<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>consumer.ts</title>
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
// queue/consumer.ts - Воркерҳо барои коркарди вазифаҳо аз навбатҳо
import { Worker } from 'bullmq';
import { redis } from '../config/redis';
import { queueConfig } from './queue.config';
import { NotificationJob } from './jobs/notification.job';
import { DispatchService } from '../dispatch/dispatch.service';
import { EmailChannel } from '../notification/channels/email';
import logger from '../config/logger';

// Worker барои навбати уведомлениеҳо
export const notificationWorker = new Worker(
    queueConfig.queues.notification,
    async (job) => {
        logger.info(`Processing notification job ${job.id}`);
        const notificationJob = new NotificationJob();
        const result = await notificationJob.execute(job.data);
        if (!result.success) {
            throw new Error(result.message);
        }
        return result;
    },
    {
        connection: redis,
        concurrency: 5,
        autorun: false,
    }
);

// Worker барои навбати таъини фармоиш
export const orderAssignWorker = new Worker(
    queueConfig.queues.orderAssign,
    async (job) => {
        const { orderId, strategy } = job.data;
        logger.info(`Processing order assign job ${job.id} for order ${orderId}`);
        const dispatchService = new DispatchService();
        const result = await dispatchService.assignOrder(orderId, strategy);
        if (!result.success) {
            throw new Error(result.message);
        }
        return result;
    },
    {
        connection: redis,
        concurrency: 3,
        autorun: false,
    }
);

// Worker барои навбати почта
export const emailWorker = new Worker(
    queueConfig.queues.email,
    async (job) => {
        const { to, subject, html } = job.data;
        logger.info(`Processing email job ${job.id} to ${to}`);
        const emailChannel = new EmailChannel();
        // EmailChannel.send то ҳол барои якто фиристодан аст, аммо мо онро мутобиқ мекунем
        const result = await emailChannel.send({
            to,
            subject,
            template: html,
            data: {},
        });
        if (!result.success) {
            throw new Error(result.error || 'Email sending failed');
        }
        return result;
    },
    {
        connection: redis,
        concurrency: 2,
        autorun: false,
    }
);

// Логгированиеи рӯйдодҳои worker'ҳо
notificationWorker.on('completed', (job) => {
    logger.info(`Notification job ${job.id} completed`);
});
notificationWorker.on('failed', (job, err) => {
    logger.error(`Notification job ${job?.id} failed: ${err.message}`);
});

orderAssignWorker.on('completed', (job) => {
    logger.info(`Order assign job ${job.id} completed`);
});
orderAssignWorker.on('failed', (job, err) => {
    logger.error(`Order assign job ${job?.id} failed: ${err.message}`);
});

emailWorker.on('completed', (job) => {
    logger.info(`Email job ${job.id} completed`);
});
emailWorker.on('failed', (job, err) => {
    logger.error(`Email job ${job?.id} failed: ${err.message}`);
});

// Функсия барои оғози ҳамаи worker'ҳо
export const startWorkers = async (): Promise&lt;void&gt; => {
    await notificationWorker.run();
    await orderAssignWorker.run();
    await emailWorker.run();
    logger.info('All queue workers started');
};

// Функсия барои пӯшидани ҳамаи worker'ҳо
export const closeWorkers = async (): Promise&lt;void&gt; => {
    await notificationWorker.close();
    await orderAssignWorker.close();
    await emailWorker.close();
    logger.info('All queue workers closed');
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
