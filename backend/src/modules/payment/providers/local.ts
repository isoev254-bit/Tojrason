<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>local.ts</title>
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
// modules/payment/providers/local.ts - Провайдери пардохти нақдӣ (cash) барои пардохт ҳангоми расонидан
import { PaymentProvider, PaymentResult, CreatePaymentParams } from './index';
import logger from '../../../config/logger';

export class LocalPaymentProvider implements PaymentProvider {
    name = 'cash';

    /**
     * Эҷоди пардохти нақдӣ (танҳо дар система сабт мекунем, ҳеҷ провайдери беруна нест)
     */
    async createPayment(params: CreatePaymentParams): Promise&lt;PaymentResult&gt; {
        try {
            // Барои пардохти нақдӣ, мо фавран "пардохт интизорӣ" эҷод мекунем
            // Аслан пардохт ҳангоми расонидан анҷом мешавад
            const paymentId = `cash_${params.orderId}_${Date.now()}`;
            
            logger.info(`Пардохти нақдӣ эҷод шуд: orderId=${params.orderId}, paymentId=${paymentId}`);
            
            return {
                success: true,
                paymentId: paymentId,
                status: 'pending', // то расонидан интизор аст
                orderId: params.orderId,
                provider: this.name,
                message: 'Пардохт ҳангоми расонидани фармоиш бо нақд анҷом дода мешавад',
            };
        } catch (error: any) {
            logger.error(`LocalPaymentProvider createPayment error: ${error.message}`);
            return {
                success: false,
                paymentId: '',
                status: 'failed',
                orderId: params.orderId,
                errorMessage: error.message,
                provider: this.name,
            };
        }
    }

    /**
     * Тасдиқи пардохти нақдӣ (вақте ки курьер фармоишро расонд)
     */
    async confirmPayment(paymentId: string): Promise&lt;PaymentResult&gt; {
        try {
            // Бояд paymentId-ро таҳлил кунем, то orderId-ро гирем
            const orderId = this.extractOrderId(paymentId);
            
            return {
                success: true,
                paymentId: paymentId,
                status: 'succeeded',
                orderId: orderId,
                provider: this.name,
                message: 'Пардохти нақдӣ бомуваффақият анҷом дода шуд',
            };
        } catch (error: any) {
            logger.error(`LocalPaymentProvider confirmPayment error: ${error.message}`);
            return {
                success: false,
                paymentId: paymentId,
                status: 'failed',
                orderId: '',
                errorMessage: error.message,
                provider: this.name,
            };
        }
    }

    /**
     * Бозгардонидани пардохти нақдӣ (дар нақдӣ одатан бозгардонда намешавад ё дастӣ)
     */
    async refundPayment(paymentId: string, amount?: number): Promise&lt;PaymentResult&gt; {
        logger.warn(`Refund for cash payment ${paymentId} must be done manually`);
        return {
            success: false,
            paymentId: paymentId,
            status: 'failed',
            orderId: '',
            errorMessage: 'Бозгардонидани пардохти нақдӣ танҳо дастӣ имконпазир аст',
            provider: this.name,
        };
    }

    /**
     * Гирифтани ҳолати пардохт
     */
    async getPaymentStatus(paymentId: string): Promise&lt;PaymentResult&gt; {
        // Дар ҳақиқат метавон аз БД гирифт. Барои соддагӣ, фарз мекунем, ки paymentId бо префикси cash_ аст
        const isCash = paymentId.startsWith('cash_');
        if (!isCash) {
            return {
                success: false,
                paymentId,
                status: 'not_found',
                orderId: '',
                errorMessage: 'Пардохт ёфт нашуд',
                provider: this.name,
            };
        }
        
        return {
            success: true,
            paymentId,
            status: 'pending', // ё метавон аз БД гирифт
            orderId: this.extractOrderId(paymentId),
            provider: this.name,
        };
    }

    private extractOrderId(paymentId: string): string {
        // paymentId: cash_<orderId>_timestamp
        const parts = paymentId.split('_');
        if (parts.length >= 2) {
            return parts[1];
        }
        return '';
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
