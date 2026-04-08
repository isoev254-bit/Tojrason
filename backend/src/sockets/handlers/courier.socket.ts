<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>courier.socket.ts</title>
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
// sockets/handlers/courier.socket.ts - Коркарди рӯйдодҳои Socket.IO барои курьерҳо
import { Socket } from 'socket.io';
import { CourierService } from '../../courier/courier.service';
import { LocationService } from '../../courier/location.service';
import { OrderSocketHandler } from './order.socket';
import { socketConfig } from '../../config/socket.config';
import logger from '../../config/logger';

export class CourierSocketHandler {
    private courierService: CourierService;
    private locationService: LocationService;

    constructor() {
        this.courierService = new CourierService();
        this.locationService = new LocationService();
    }

    /**
     * Бақайдгирии ҳамаи listener'ҳо барои курьерҳо
     * @param socket - Инстанси Socket
     */
    register(socket: Socket): void {
        // Навсозии ҷойгиршавии курьер
        socket.on(socketConfig.events.COURIER_UPDATE_LOCATION, (data: { lat: number; lng: number; isAvailable?: boolean }) => {
            this.handleUpdateLocation(socket, data);
        });

        // Қабули фармоиш аз ҷониби курьер
        socket.on(socketConfig.events.COURIER_ACCEPT_ORDER, (data: { orderId: string }) => {
            this.handleAcceptOrder(socket, data.orderId);
        });

        // Навсозии ҳолати курьер (дастрас/ғайридастрас)
        socket.on(socketConfig.events.COURIER_UPDATE_STATUS, (data: { isAvailable: boolean }) => {
            this.handleUpdateStatus(socket, data.isAvailable);
        });
    }

    /**
     * Навсозии ҷойгиршавӣ ва ҳолати курьер
     */
    private async handleUpdateLocation(socket: Socket, data: { lat: number; lng: number; isAvailable?: boolean }): Promise&lt;void&gt; {
        try {
            const userId = socket.data.user?.id;
            const userRole = socket.data.user?.role;

            if (!userId || userRole !== 'COURIER') {
                socket.emit('error', { message: 'Танҳо курьерҳо метавонанд ҷойгиршавии худро навсозӣ кунанд' });
                return;
            }

            if (typeof data.lat !== 'number' || typeof data.lng !== 'number') {
                socket.emit('error', { message: 'lat ва lng бояд адад бошанд' });
                return;
            }

            // Навсозии ҷойгиршавӣ
            await this.courierService.updateLocation(userId, {
                lat: data.lat,
                lng: data.lng,
                isAvailable: data.isAvailable,
            });

            // Сабти ҷойгиршавӣ дар кэши Redis (аллакай дар updateLocation анҷом шудааст)

            // Агар фармоиши фаъол дошта бошад, ҷойгиршавиро ба клиент фиристон
            // Инро метавон тавассути OrderSocketHandler анҷом дод
            // Барои соддагӣ, дар ин ҷо танҳо лог мекунем

            socket.emit('location_updated', { success: true });
            logger.info(`Courier ${userId} location updated: (${data.lat}, ${data.lng})`);
        } catch (error: any) {
            logger.error(`Error updating courier location: ${error.message}`);
            socket.emit('error', { message: error.message });
        }
    }

    /**
     * Қабули фармоиш аз ҷониби курьер
     */
    private async handleAcceptOrder(socket: Socket, orderId: string): Promise&lt;void&gt; {
        try {
            const userId = socket.data.user?.id;
            const userRole = socket.data.user?.role;

            if (!userId || userRole !== 'COURIER') {
                socket.emit('error', { message: 'Танҳо курьерҳо метавонанд фармоиш қабул кунанд' });
                return;
            }

            await this.courierService.acceptOrder(userId, orderId);

            // Пас аз қабул, ба руми фармоиш пайваст шавем (агар лозим бошад)
            const roomName = `order:${orderId}:tracking`;
            await socket.join(roomName);

            // Фиристодани тасдиқ
            socket.emit('order_accepted', { orderId, success: true });

            // Навсозии статус барои ҳамаи обуншудагон
            OrderSocketHandler.emitOrderStatusUpdate(orderId, 'PICKED_UP', { courierId: userId });

            logger.info(`Courier ${userId} accepted order ${orderId}`);
        } catch (error: any) {
            logger.error(`Error accepting order: ${error.message}`);
            socket.emit('error', { message: error.message });
        }
    }

    /**
     * Навсозии ҳолати дастрасии курьер
     */
    private async handleUpdateStatus(socket: Socket, isAvailable: boolean): Promise&lt;void&gt; {
        try {
            const userId = socket.data.user?.id;
            const userRole = socket.data.user?.role;

            if (!userId || userRole !== 'COURIER') {
                socket.emit('error', { message: 'Танҳо курьерҳо метавонанд ҳолати худро навсозӣ кунанд' });
                return;
            }

            // Агар isAvailable = true бошад, ҷойгиршавӣ бояд мавҷуд бошад
            if (isAvailable) {
                const location = await this.locationService.getCourierLocation(userId);
                if (!location) {
                    socket.emit('error', { message: 'Пеш аз дастрас шудан, ҷойгиршавии худро навсозӣ кунед' });
                    return;
                }
            }

            await this.courierService.updateLocation(userId, {
                lat: 0, // навсозӣ намешавад
                lng: 0,
                isAvailable,
            });

            socket.emit('status_updated', { isAvailable });
            logger.info(`Courier ${userId} availability set to ${isAvailable}`);
        } catch (error: any) {
            logger.error(`Error updating courier status: ${error.message}`);
            socket.emit('error', { message: error.message });
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
