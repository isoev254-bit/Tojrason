<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>order.socket.ts</title>
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
// sockets/handlers/order.socket.ts - Коркарди рӯйдодҳои Socket.IO барои фармоишҳо
import { Socket } from 'socket.io';
import { OrderService } from '../../order/order.service';
import { socketConfig } from '../../config/socket.config';
import logger from '../../config/logger';

export class OrderSocketHandler {
    private orderService: OrderService;

    constructor() {
        this.orderService = new OrderService();
    }

    /**
     * Бақайдгирии ҳамаи listener'ҳо барои фармоишҳо
     * @param socket - Инстанси Socket
     */
    register(socket: Socket): void {
        // Пайвастшавӣ ба руми фармоиш барои пайгирӣ
        socket.on(socketConfig.events.ORDER_TRACK, (data: { orderId: string }) => {
            this.handleOrderTrack(socket, data.orderId);
        });

        // Дигар рӯйдодҳои марбут ба фармоиш (агар зарур бошад)
        socket.on('order:status_subscribe', (data: { orderId: string }) => {
            this.subscribeToOrderStatus(socket, data.orderId);
        });
    }

    /**
     * Коркарди дархости пайгирии фармоиш (order:track)
     * @param socket - Инстанси Socket
     * @param orderId - ID фармоиш
     */
    private async handleOrderTrack(socket: Socket, orderId: string): Promise&lt;void&gt; {
        try {
            const userId = socket.data.user?.id;
            if (!userId) {
                socket.emit('error', { message: 'Аутентификатсия талаб карда мешавад' });
                return;
            }

            // Санҷиши дастрасӣ ба фармоиш (клиенти соҳиб ё курьери таъиншуда)
            const order = await this.orderService.getOrderById(orderId);
            if (!order) {
                socket.emit('error', { message: 'Фармоиш ёфт нашуд' });
                return;
            }

            const isOwner = order.clientId === userId;
            const isAssignedCourier = order.courierId === userId;
            if (!isOwner && !isAssignedCourier) {
                socket.emit('error', { message: 'Шумо иҷозати пайгирии ин фармоишро надоред' });
                return;
            }

            // Пайвастшавӣ ба руми махсуси фармоиш
            const roomName = socketConfig.rooms.orderTracking(orderId);
            await socket.join(roomName);
            
            // Фиристодани маълумоти ҷории фармоиш
            socket.emit('order:data', order);
            
            logger.info(`User ${userId} started tracking order ${orderId}`);
        } catch (error: any) {
            logger.error(`Error in order track: ${error.message}`);
            socket.emit('error', { message: 'Хатогӣ ҳангоми пайгирии фармоиш' });
        }
    }

    /**
     * Обуншавӣ ба тағйироти статуси фармоиш
     * @param socket - Инстанси Socket
     * @param orderId - ID фармоиш
     */
    private async subscribeToOrderStatus(socket: Socket, orderId: string): Promise&lt;void&gt; {
        try {
            const userId = socket.data.user?.id;
            if (!userId) {
                socket.emit('error', { message: 'Аутентификатсия талаб карда мешавад' });
                return;
            }

            const order = await this.orderService.getOrderById(orderId);
            if (!order) {
                socket.emit('error', { message: 'Фармоиш ёфт нашуд' });
                return;
            }

            const isOwner = order.clientId === userId;
            const isAssignedCourier = order.courierId === userId;
            if (!isOwner && !isAssignedCourier) {
                socket.emit('error', { message: 'Шумо иҷозати обуншавӣ ба ин фармоишро надоред' });
                return;
            }

            const roomName = socketConfig.rooms.orderTracking(orderId);
            await socket.join(roomName);
            socket.emit('order:status_subscribed', { orderId, status: order.status });
        } catch (error: any) {
            logger.error(`Error in subscribe to order status: ${error.message}`);
            socket.emit('error', { message: 'Хатогӣ ҳангоми обуншавӣ' });
        }
    }

    /**
     * Фиристодани навсозии ҷойгиршавии курьер ба ҳамаи клиентҳои дар руми фармоиш
     * @param orderId - ID фармоиш
     * @param courierId - ID курьер
     * @param lat - Паҳноӣ
     * @param lng - Дарозӣ
     */
    static emitCourierLocation(orderId: string, courierId: string, lat: number, lng: number): void {
        const io = require('../socket').io;
        if (io) {
            const roomName = socketConfig.rooms.orderTracking(orderId);
            io.to(roomName).emit(socketConfig.events.COURIER_LOCATION_UPDATE, {
                orderId,
                courierId,
                lat,
                lng,
                timestamp: new Date().toISOString(),
            });
        }
    }

    /**
     * Фиристодани навсозии статуси фармоиш ба ҳамаи обуншудагон
     * @param orderId - ID фармоиш
     * @param status - Статуси нав
     * @param data - Маълумоти иловагӣ
     */
    static emitOrderStatusUpdate(orderId: string, status: string, data?: any): void {
        const io = require('../socket').io;
        if (io) {
            const roomName = socketConfig.rooms.orderTracking(orderId);
            io.to(roomName).emit(socketConfig.events.ORDER_STATUS_UPDATE, {
                orderId,
                status,
                data,
                timestamp: new Date().toISOString(),
            });
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
