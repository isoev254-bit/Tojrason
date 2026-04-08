<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>email.ts</title>
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
// modules/notification/channels/email.ts - Канали Email барои фиристодани паёмҳо
import { NotificationChannel, SendOptions, SendResult } from '../notification.types';
import logger from '../../../config/logger';

// Интерфейси провайдери email (масалан Nodemailer, SendGrid, AWS SES)
interface EmailProvider {
    send(to: string, subject: string, html: string, text?: string): Promise&lt;boolean&gt;;
}

// Провайдери намунавӣ (барои тақлид - дар лоиҳаи воқеӣ Nodemailer-ро истифода баред)
class MockEmailProvider implements EmailProvider {
    async send(to: string, subject: string, html: string, text?: string): Promise&lt;boolean&gt; {
        logger.info(`[MOCK EMAIL] Ба ${to}: subject="${subject}"`);
        logger.debug(`HTML: ${html.substring(0, 200)}...`);
        return true;
    }
}

export class EmailChannel implements NotificationChannel {
    name = 'email';
    private provider: EmailProvider;

    constructor(provider?: EmailProvider) {
        this.provider = provider || new MockEmailProvider();
    }

    /**
     * Фиристодани почтаи электронӣ
     * @param options - to ин ҷо почтаи электронӣ, subject - мавзӯъ, template - шаблони HTML
     */
    async send(options: SendOptions): Promise&lt;SendResult&gt; {
        try {
            const { to, subject, template, data } = options;
            if (!to || !to.includes('@')) {
                throw new Error('Суроғаи почтаи электронӣ нодуруст аст');
            }

            let html = '';
            let text = '';

            if (template) {
                html = this.renderTemplate(template, data);
                text = this.stripHtml(html);
            } else if (data && data.message) {
                html = `&lt;p&gt;${data.message}&lt;/p&gt;`;
                text = data.message;
            } else {
                html = '&lt;p&gt;Уведомление от Tojrason&lt;/p&gt;';
                text = 'Уведомление от Tojrason';
            }

            const emailSubject = subject || 'Уведомление от Tojrason';
            const success = await this.provider.send(to, emailSubject, html, text);
            if (success) {
                logger.info(`Email ба ${to} бомуваффақият фиристода шуд`);
                return { success: true, channel: this.name, recipient: to };
            } else {
                throw new Error('Провайдери email ноком шуд');
            }
        } catch (error: any) {
            logger.error(`Хатогии фиристодани email ба ${options.to}: ${error.message}`);
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

    private stripHtml(html: string): string {
        return html.replace(/&lt;[^&gt;]*&gt;/g, ' ').replace(/\s+/g, ' ').trim();
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
