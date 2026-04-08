<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>order-created.template.ts</title>
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
// modules/notification/templates/order-created.template.ts - Шаблони эҷоди фармоиш барои каналҳои гуногун

export interface OrderCreatedTemplateData {
    orderId: string;
    clientName: string;
    pickupAddress: string;
    deliveryAddress: string;
    amount: number;
    deliveryFee: number;
    totalAmount: number;
    estimatedTime?: string;
}

// Шаблон барои SMS (матни кӯтоҳ)
export const orderCreatedSmsTemplate = (data: OrderCreatedTemplateData): string => {
    return `Фармоиши №${data.orderId} эҷод шуд. Аз: ${data.pickupAddress}. Ба: ${data.deliveryAddress}. Маблағ: ${data.totalAmount} сом. Ташаккур!`;
};

// Шаблон барои Push (уведомление)
export const orderCreatedPushTemplate = (data: OrderCreatedTemplateData): { title: string; body: string } => {
    return {
        title: 'Фармоиши шумо эҷод шуд 🚀',
        body: `Фармоиш №${data.orderId}. Маблағ: ${data.totalAmount} сом. Курьер ба наздикӣ таъин мешавад.`,
    };
};

// Шаблон барои Email (HTML)
export const orderCreatedEmailTemplate = (data: OrderCreatedTemplateData): string => {
    return `
        &lt;div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;"&gt;
            &lt;h2 style="color: #4CAF50;"&gt;Фармоиши шумо қабул шуд!&lt;/h2&gt;
            &lt;p&gt;Азиз(а) &lt;strong&gt;${data.clientName}&lt;/strong&gt;,&lt;/p&gt;
            &lt;p&gt;Фармоиши шумо №&lt;strong&gt;${data.orderId}&lt;/strong&gt; бомуваффақият эҷод шуд.&lt;/p&gt;
            
            &lt;h3&gt;Маълумоти фармоиш:&lt;/h3&gt;
            &lt;table style="width: 100%; border-collapse: collapse;"&gt;
                &lt;tr&gt;&lt;td style="padding: 8px; border-bottom: 1px solid #ddd;"&gt;&lt;strong&gt;Сана:&lt;/strong&gt;&lt;/td&gt;&lt;td style="padding: 8px; border-bottom: 1px solid #ddd;"&gt;${new Date().toLocaleString()}&lt;/td&gt;&lt;/tr&gt;
                &lt;tr&gt;&lt;td style="padding: 8px; border-bottom: 1px solid #ddd;"&gt;&lt;strong&gt;Суроғаи гирифтан:&lt;/strong&gt;&lt;/td&gt;&lt;td style="padding: 8px; border-bottom: 1px solid #ddd;"&gt;${data.pickupAddress}&lt;/td&gt;&lt;/tr&gt;
                &lt;tr&gt;&lt;td style="padding: 8px; border-bottom: 1px solid #ddd;"&gt;&lt;strong&gt;Суроғаи расонидан:&lt;/strong&gt;&lt;/td&gt;&lt;td style="padding: 8px; border-bottom: 1px solid #ddd;"&gt;${data.deliveryAddress}&lt;/td&gt;&lt;/tr&gt;
                &lt;tr&gt;&lt;td style="padding: 8px; border-bottom: 1px solid #ddd;"&gt;&lt;strong&gt;Маблағи фармоиш:&lt;/strong&gt;&lt;/td&gt;&lt;td style="padding: 8px; border-bottom: 1px solid #ddd;"&gt;${data.amount} сом&lt;/td&gt;&lt;/tr&gt;
                &lt;tr&gt;&lt;td style="padding: 8px; border-bottom: 1px solid #ddd;"&gt;&lt;strong&gt;Арзиши интиқол:&lt;/strong&gt;&lt;/td&gt;&lt;td style="padding: 8px; border-bottom: 1px solid #ddd;"&gt;${data.deliveryFee} сом&lt;/td&gt;&lt;/tr&gt;
                &lt;tr style="background-color: #f9f9f9;"&gt;&lt;td style="padding: 8px;"&gt;&lt;strong&gt;Маблағи умумӣ:&lt;/strong&gt;&lt;/td&gt;&lt;td style="padding: 8px;"&gt;&lt;strong style="color: #4CAF50;"&gt;${data.totalAmount} сом&lt;/strong&gt;&lt;/td&gt;&lt;/tr&gt;
            &lt;/table&gt;
            
            &lt;p style="margin-top: 20px;"&gt;Акнун мо курьерро ҷустуҷӯ мекунем. Ҳолати фармоишро дар барнома пайгирӣ кунед.&lt;/p&gt;
            &lt;hr&gt;
            &lt;p style="font-size: 12px; color: #888;"&gt;Ин почтаи автоматист. Лутфан ба он ҷавоб надиҳед.&lt;/p&gt;
        &lt;/div&gt;
    `;
};

// Функсияи интихоби шаблон вобаста ба канал
export const getOrderCreatedTemplate = (channel: string, data: OrderCreatedTemplateData): string | { title: string; body: string } => {
    switch (channel) {
        case 'sms':
            return orderCreatedSmsTemplate(data);
        case 'push':
            return orderCreatedPushTemplate(data);
        case 'email':
            return orderCreatedEmailTemplate(data);
        default:
            return orderCreatedSmsTemplate(data);
    }
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
