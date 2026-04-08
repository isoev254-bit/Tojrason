<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>event.emitter.ts</title>
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
// events/event.emitter.ts - Эмиттери рӯйдодҳои глобалӣ барои система
import { EventEmitter } from 'events';
import { OrderEventHandler } from './handlers/order.handler';
import logger from '../config/logger';

// Эҷоди як инстанси ягона (singleton) барои EventEmitter
export const eventEmitter = new EventEmitter();

// Баланд бардоштани лимити listener'ҳо (пешфарз 10)
eventEmitter.setMaxListeners(50);

// Бақайдгирии ҳамаи handler'ҳо
const orderEventHandler = new OrderEventHandler();
orderEventHandler.register(eventEmitter);

// Логгированиеи рӯйдодҳо барои ислоҳи хатогиҳо (debugging)
if (process.env.NODE_ENV === 'development') {
    eventEmitter.on('newListener', (eventName, listener) => {
        logger.debug(`New listener registered for event: ${eventName}`);
    });
    eventEmitter.on('removeListener', (eventName, listener) => {
        logger.debug(`Listener removed for event: ${eventName}`);
    });
}

// Экспорти функсияи ёвар барои фиристодани рӯйдодҳо бо логгирование
export const emitEvent = (eventName: string, payload: any): boolean => {
    logger.debug(`Emitting event: ${eventName}`);
    return eventEmitter.emit(eventName, payload);
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
