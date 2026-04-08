<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>sms.ts</title>
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
// modules/notification/channels/sms.ts - Канали СМС барои фиристодани паёмҳо
import { NotificationChannel, SendOptions, SendResult } from '../notification.types';
import logger from '../../../config/logger';

// Ин интерфейси провайдери СМС - дар лоиҳаи воқеӣ метавон Twilio, Eskiz.uz, ё дигар хидматҳоро истифода кард
interface SmsProvider {
    send(phone: string, message: string): Promise&lt;boolean&gt;;
}

// Провайдери намунавӣ (барои тақлид)
class MockSmsProvider implements SmsProvider {
    async send(phone: string, message: string): Promise&lt;boolean&gt; {
        logger.info(`[MOCK SMS] Ба ${phone}: ${message}`);
        return true;
    }
}

export class SmsChannel implements NotificationChannel {
    name = 'sms';
    private provider: SmsProvider;

    constructor(provider?: SmsProvider) {
        this.provider = provider || new MockSmsProvider();
    }

    /**
     * Фиристодани паёми SMS ба рақами телефон
     */
    async send(options: SendOptions): Promise&lt;SendResult&gt; {
        try {
            const { to, subject, template, data } = options;
            // Барои SMS, матни ниҳоӣ ё шаблонро тайёр мекунем
            let message = subject || '';
            if (template) {
                message = this.renderTemplate(template, data);
            }
            if (!message) {
                throw new Error('Матни паём барои SMS вуҷуд надорад');
            }

            const success = await this.provider.send(to, message);
            if (success) {
                logger.info(`SMS ба ${to} бомуваффақият фиристода шуд`);
                return { success: true, channel: this.name, recipient: to };
            } else {
                throw new Error('Провайдери SMS ноком шуд');
            }
        } catch (error: any) {
            logger.error(`Хатогии фиристодани SMS ба ${options.to}: ${error.message}`);
            return { success: false, channel: this.name, recipient: options.to, error: error.message };
        }
    }

    /**
     * Рендеринг кардани шаблони оддӣ (метавонад бо handlebars ё дигар муҳаррикҳо иваз карда шавад)
     */
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
