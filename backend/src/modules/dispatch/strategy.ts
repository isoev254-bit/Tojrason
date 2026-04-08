<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>strategy.ts</title>
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
// modules/dispatch/strategy.ts - Интерфейси стратегия барои интихоби курьер
import { CourierScore, OrderInfo } from './dispatch.types';

/**
 * Интерфейси умумии стратегияҳои диспетчеризатсия.
 * Ҳар як стратегия усули худро барои баҳодиҳӣ ва интихоби курьер амалӣ мекунад.
 */
export interface DispatchStrategy {
    /** Номи стратегия (барои логгирование) */
    name: string;

    /**
     * Ҳисоб кардани рейтинги курьерҳо барои фармоиши додашуда.
     * @param order - Маълумоти фармоиш
     * @param couriers - Рӯйхати курьерҳои дастрас (бо макон ва хусусиятҳо)
     * @returns Массив рейтингҳо (бо курьерId ва балл)
     */
    scoreCouriers(order: OrderInfo, couriers: Array<{
        id: string;
        lat: number;
        lng: number;
        isAvailable: boolean;
        rating?: number;
        activeOrdersCount?: number;
        totalDeliveries?: number;
        baseFee?: number;
        ratePerKm?: number;
        distanceToPickup?: number;
    }>): Promise&lt;CourierScore[]&gt;;

    /**
     * Интихоби беҳтарин курьер аз рӯи рейтингҳои ҳисобшуда.
     * @param scores - Массиви рейтингҳо (аз scoreCouriers)
     * @returns Беҳтарин рейтинг ё null
     */
    selectBest(scores: CourierScore[]): CourierScore | null;
}

/**
 * Класси асосӣ барои стратегияҳо, ки методҳои ёвари умумиро таъмин мекунад.
 * Стратегияҳои воқеӣ метавонанд ин классро мерос гиранд ё интерфейсро бевосита амалӣ кунанд.
 */
export abstract class BaseDispatchStrategy implements DispatchStrategy {
    abstract name: string;

    abstract scoreCouriers(order: OrderInfo, couriers: any[]): Promise&lt;CourierScore[]&gt;;

    selectBest(scores: CourierScore[]): CourierScore | null {
        if (scores.length === 0) return null;
        // Пешфарз: аввалин элемент (бо рейтинги баландтарин)
        return scores[0];
    }

    /**
     * Методи ёвар барои нормализатсияи қиматҳо ба интервали [0, 100].
     */
    protected normalize(value: number, min: number, max: number): number {
        if (max <= min) return 0;
        let normalized = (value - min) / (max - min);
        normalized = Math.max(0, Math.min(1, normalized));
        return normalized * 100;
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
