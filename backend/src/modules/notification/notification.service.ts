<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>notification.service.ts</title>
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
// modules/notification/notification.service.ts - Логикаи тиҷоратии фиристодани уведомлениеҳо
import { SmsChannel } from './channels/sms';
import { PushChannel } from './channels/push';
import { EmailChannel } from './channels/email';
import { NotificationChannel, SendOptions, SendResult, NotificationType } from './notification.types';
import { getOrderCreatedTemplate, OrderCreatedTemplateData } from './templates/order-created.template';
import logger from '../../config/logger';

export class NotificationService {
    private channels: Map&lt;string, NotificationChannel&gt; = new Map();

    constructor() {
        // Бақайдгирии каналҳои дастрас
        this.channels.set('sms', new SmsChannel());
        this.channels.set('push', new PushChannel());
        this.channels.set('email', new EmailChannel());
    }

    /**
     * Фиристодани уведомление тавассути канали мушаххас
     */
    async send(channelName: string, options: SendOptions): Promise&lt;SendResult&gt; {
        const channel = this.channels.get(channelName);
        if (!channel) {
            logger.error(`Канали ${channelName} ёфт нашуд`);
            return {
                success: false,
                channel: channelName,
                recipient: options.to,
                error: `Канали ${channelName} дастрас нест`,
            };
        }
        return await channel.send(options);
    }

    /**
     * Фиристодани уведомление ба якчанд каналҳо (масалан, ҳам SMS ва ҳам Email)
     */
    async sendToMultipleChannels(channelNames: string[], options: SendOptions): Promise&lt;SendResult[]&gt; {
        const results: SendResult[] = [];
        for (const channelName of channelNames) {
            const result = await this.send(channelName, options);
            results.push(result);
        }
        return results;
    }

    /**
     * Уведомление дар бораи эҷоди фармоиш ба клиент
     */
    async notifyOrderCreated(
        client: { id: string; phone: string; email: string; fullName: string },
        orderData: OrderCreatedTemplateData,
        channels: ('sms' | 'push' | 'email')[] = ['sms', 'email']
    ): Promise&lt;SendResult[]&gt; {
        const results: SendResult[] = [];

        for (const channel of channels) {
            let template: string | { title: string; body: string };
            let to = '';

            switch (channel) {
                case 'sms':
                    template = getOrderCreatedTemplate('sms', orderData);
                    to = client.phone;
                    break;
                case 'email':
                    template = getOrderCreatedTemplate('email', orderData) as string;
                    to = client.email;
                    break;
                case 'push':
                    const pushTemplate = getOrderCreatedTemplate('push', orderData) as { title: string; body: string };
                    template = pushTemplate.body;
                    to = client.id; // device token дар системаи воқеӣ бояд аз БД гирифта шавад
                    // Барои соддагӣ, push-ро бо токени фарзӣ мефиристем
                    break;
                default:
                    continue;
            }

            const options: SendOptions = {
                to,
                subject: `Фармоиши №${orderData.orderId}`,
                template: typeof template === 'string' ? template : template.body,
                data: orderData as any,
            };

            const result = await this.send(channel, options);
            results.push(result);
        }

        return results;
    }

    /**
     * Уведомление ба курьер ҳангоми таъин шудан ба фармоиш
     */
    async notifyCourierAssigned(
        courier: { id: string; phone: string; fullName: string },
        orderId: string,
        pickupAddress: string
    ): Promise&lt;SendResult[]&gt; {
        const smsTemplate = `Курьер ${courier.fullName}, ба шумо фармоиш №${orderId} таъин шуд. Суроғаи гирифтан: ${pickupAddress}. Барои тафсилот ба барнома гузаред.`;
        
        const options: SendOptions = {
            to: courier.phone,
            subject: 'Таъини фармоиш',
            template: smsTemplate,
            data: { orderId, pickupAddress, courierName: courier.fullName },
        };

        return [await this.send('sms', options)];
    }

    /**
     * Уведомление ба клиент ҳангоми тағйир ёфтани статуси фармоиш
     */
    async notifyOrderStatusChange(
        client: { phone: string; email: string; fullName: string },
        orderId: string,
        status: string
    ): Promise&lt;SendResult[]&gt; {
        let statusText = '';
        switch (status) {
            case 'ASSIGNED':
                statusText = 'ба курьер таъин шуд';
                break;
            case 'PICKED_UP':
                statusText = 'гирифта шуд ва дар роҳ аст';
                break;
            case 'DELIVERED':
                statusText = 'расонида шуд';
                break;
            case 'CANCELLED':
                statusText = 'бекор карда шуд';
                break;
            default:
                statusText = status;
        }

        const smsMessage = `Фармоиши №${orderId} ${statusText}. Барои маълумоти бештар ба барнома гузаред.`;
        
        const options: SendOptions = {
            to: client.phone,
            subject: `Статуси фармоиш №${orderId}`,
            template: smsMessage,
            data: { orderId, status: statusText },
        };

        return [await this.send('sms', options)];
    }

    /**
     * Бақайдгирии канали нав (барои васеъ кардан)
     */
    registerChannel(name: string, channel: NotificationChannel): void {
        this.channels.set(name, channel);
        logger.info(`Канали нави уведомление ба қайд гирифта шуд: ${name}`);
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
