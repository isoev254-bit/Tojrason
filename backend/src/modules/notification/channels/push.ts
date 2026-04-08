<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>push.ts</title>
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
// modules/notification/channels/push.ts - Канали Push Notification (Firebase Cloud Messaging)
import { NotificationChannel, SendOptions, SendResult } from '../notification.types';
import logger from '../../../config/logger';

// Интерфейси провайдери push-уведомление (барои FCM, APNS ва ғ.)
interface PushProvider {
    send(deviceToken: string, title: string, body: string, data?: Record&lt;string, any&gt;): Promise&lt;boolean&gt;;
}

// Провайдери намунавӣ (барои тақлид - дар лоиҳаи воқеӣ Firebase-ро истифода баред)
class MockPushProvider implements PushProvider {
    async send(deviceToken: string, title: string, body: string, data?: Record&lt;string, any&gt;): Promise&lt;boolean&gt; {
        logger.info(`[MOCK PUSH] Ба deviceToken ${deviceToken}: title="${title}", body="${body}"`);
        if (data) logger.debug(`Push data: ${JSON.stringify(data)}`);
        return true;
    }
}

export class PushChannel implements NotificationChannel {
    name = 'push';
    private provider: PushProvider;

    constructor(provider?: PushProvider) {
        this.provider = provider || new MockPushProvider();
    }

    /**
     * Фиристодани push-уведомление
     * @param options - to ин ҷо deviceToken мебошад
     */
    async send(options: SendOptions): Promise&lt;SendResult&gt; {
        try {
            const { to, subject, template, data } = options;
            const deviceToken = to;
            let title = subject || 'Tojrason';
            let body = '';

            if (template) {
                const rendered = this.renderTemplate(template, data);
                // Агар шаблон матни пурра бошад, онро ҳамчун body истифода мебарем
                body = rendered;
            } else if (data && data.message) {
                body = data.message;
            } else {
                body = subject || 'Уведомление';
            }

            if (!title) title = 'Tojrason';

            const success = await this.provider.send(deviceToken, title, body, data);
            if (success) {
                logger.info(`Push-уведомление ба ${deviceToken} бомуваффақият фиристода шуд`);
                return { success: true, channel: this.name, recipient: deviceToken };
            } else {
                throw new Error('Провайдери push ноком шуд');
            }
        } catch (error: any) {
            logger.error(`Хатогии фиристодани push-уведомление ба ${options.to}: ${error.message}`);
            return { success: false, channel: this.name, recipient: options.to, error: error.message };
        }
    }

    private renderTemplate(template: string, data?: Record&lt;string, any&gt;): string {
        if (!data) return template;
        let result = template;
        for (const [key, value] of Object.entries(data)) {
            result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        }
        return result;
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
