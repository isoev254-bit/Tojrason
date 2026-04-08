<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>notification.job.ts</title>
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
// queue/jobs/notification.job.ts - Вазифаи фиристодани уведомлениеҳо (SMS, Email, Push)
import { NotificationService } from '../../notification/notification.service';
import logger from '../../config/logger';

export interface NotificationJobData {
    channel: 'sms' | 'email' | 'push';
    to: string;
    subject?: string;
    template?: string;
    data?: Record&lt;string, any&gt;;
    type?: string;
}

export class NotificationJob {
    private notificationService: NotificationService;

    constructor() {
        this.notificationService = new NotificationService();
    }

    /**
     * Иҷрои вазифаи фиристодани уведомление
     * @param jobData - Маълумоти уведомление
     * @returns Натиҷаи фиристодан
     */
    async execute(jobData: NotificationJobData): Promise&lt;{ success: boolean; message: string }&gt; {
        try {
            logger.info(`Processing notification job: channel=${jobData.channel}, to=${jobData.to}`);
            
            const result = await this.notificationService.send(jobData.channel, {
                to: jobData.to,
                subject: jobData.subject,
                template: jobData.template,
                data: jobData.data,
                type: jobData.type as any,
            });
            
            if (result.success) {
                logger.info(`Notification sent successfully: ${jobData.channel} to ${jobData.to}`);
                return { success: true, message: 'Notification sent' };
            } else {
                logger.error(`Notification failed: ${result.error}`);
                return { success: false, message: result.error || 'Unknown error' };
            }
        } catch (error: any) {
            logger.error(`Error executing notification job: ${error.message}`);
            return { success: false, message: error.message };
        }
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
