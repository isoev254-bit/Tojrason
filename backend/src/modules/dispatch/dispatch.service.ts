<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>dispatch.service.ts</title>
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
// modules/dispatch/dispatch.service.ts - Хидмати диспетчеризатсия барои таъин кардани курьер ба фармоиш
import { Assigner } from './assign';
import { DispatchStrategy } from './strategy';
import { NearestStrategy } from './strategies/nearest.strategy';
import { CheapestStrategy } from './strategies/cheapest.strategy';
import { SmartStrategy } from './strategies/smart.strategy';
import { AssignResult } from './dispatch.types';
import logger from '../../config/logger';

export class DispatchService {
    private assigner: Assigner;
    private strategies: Map&lt;string, DispatchStrategy&gt;;

    constructor() {
        this.assigner = new Assigner();
        this.strategies = new Map();
        // Бақайдгирии стратегияҳои дастрас
        this.strategies.set('nearest', new NearestStrategy());
        this.strategies.set('cheapest', new CheapestStrategy());
        this.strategies.set('smart', new SmartStrategy());
    }

    /**
     * Таъин кардани курьер ба фармоиш бо стратегияи мушаххас
     * @param orderId - ID фармоиш
     * @param strategyName - Номи стратегия (nearest, cheapest, smart)
     * @returns Натиҷаи таъин
     */
    async assignOrder(orderId: string, strategyName: string = 'nearest'): Promise&lt;AssignResult&gt; {
        const strategy = this.strategies.get(strategyName);
        if (!strategy) {
            logger.error(`Стратегияи номаълум: ${strategyName}`);
            return {
                success: false,
                message: `Стратегияи "${strategyName}" ёфт нашуд. Стратегияҳои дастрас: ${Array.from(this.strategies.keys()).join(', ')}`,
                orderId,
            };
        }

        logger.info(`Оғози таъин барои фармоиш ${orderId} бо стратегияи ${strategyName}`);
        const result = await this.assigner.assignOrder(orderId, strategy);
        
        if (result.success) {
            logger.info(`Таъин муваффақ: фармоиш ${orderId} -> курьер ${result.courierId}`);
        } else {
            logger.warn(`Таъин номуваффақ: фармоиш ${orderId} - ${result.message}`);
        }
        
        return result;
    }

    /**
     * Таъин кардан бо стратегияи наздиктарин (пешфарз)
     */
    async assignNearest(orderId: string): Promise&lt;AssignResult&gt; {
        return this.assignOrder(orderId, 'nearest');
    }

    /**
     * Таъин кардан бо стратегияи арзонтарин
     */
    async assignCheapest(orderId: string): Promise&lt;AssignResult&gt; {
        return this.assignOrder(orderId, 'cheapest');
    }

    /**
     * Таъин кардан бо стратегияи интеллектуалӣ
     */
    async assignSmart(orderId: string): Promise&lt;AssignResult&gt; {
        return this.assignOrder(orderId, 'smart');
    }

    /**
     * Бақайдгирии стратегияи нав (барои васеъ кардани система)
     */
    registerStrategy(name: string, strategy: DispatchStrategy): void {
        this.strategies.set(name, strategy);
        logger.info(`Стратегияи нав ба қайд гирифта шуд: ${name}`);
    }

    /**
     * Гирифтани рӯйхати стратегияҳои дастрас
     */
    getAvailableStrategies(): string[] {
        return Array.from(this.strategies.keys());
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
