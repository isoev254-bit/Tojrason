<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>rooms.ts</title>
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
// sockets/rooms.ts - Утилитҳо барои идоракунии румҳои Socket.IO
import { Socket } from 'socket.io';
import { getIO } from './socket';
import { socketConfig } from '../config/socket.config';
import logger from '../config/logger';

/**
 * Ба руми фармоиш ҳамроҳ кардани сокет
 * @param socket - Инстанси Socket
 * @param orderId - ID фармоиш
 */
export const joinOrderRoom = async (socket: Socket, orderId: string): Promise&lt;void&gt; => {
    const roomName = socketConfig.rooms.orderTracking(orderId);
    await socket.join(roomName);
    logger.debug(`Socket ${socket.id} joined room ${roomName}`);
};

/**
 * Аз руми фармоиш ҷудо кардани сокет
 * @param socket - Инстанси Socket
 * @param orderId - ID фармоиш
 */
export const leaveOrderRoom = async (socket: Socket, orderId: string): Promise&lt;void&gt; => {
    const roomName = socketConfig.rooms.orderTracking(orderId);
    await socket.leave(roomName);
    logger.debug(`Socket ${socket.id} left room ${roomName}`);
};

/**
 * Ба руми курьер ҳамроҳ кардани сокет (барои фиристодани уведомлениеҳо)
 * @param socket - Инстанси Socket
 * @param courierId - ID курьер
 */
export const joinCourierRoom = async (socket: Socket, courierId: string): Promise&lt;void&gt; => {
    const roomName = socketConfig.rooms.courierLocation(courierId);
    await socket.join(roomName);
    logger.debug(`Socket ${socket.id} joined courier room ${roomName}`);
};

/**
 * Аз руми курьер ҷудо кардани сокет
 * @param socket - Инстанси Socket
 * @param courierId - ID курьер
 */
export const leaveCourierRoom = async (socket: Socket, courierId: string): Promise&lt;void&gt; => {
    const roomName = socketConfig.rooms.courierLocation(courierId);
    await socket.leave(roomName);
    logger.debug(`Socket ${socket.id} left courier room ${roomName}`);
};

/**
 * Ба руми уведомлениеҳои корбар ҳамроҳ кардан
 * @param socket - Инстанси Socket
 * @param userId - ID корбар
 */
export const joinUserNotificationRoom = async (socket: Socket, userId: string): Promise&lt;void&gt; => {
    const roomName = socketConfig.rooms.userNotifications(userId);
    await socket.join(roomName);
    logger.debug(`Socket ${socket.id} joined user notification room ${roomName}`);
};

/**
 * Фиристодани рӯйдод ба ҳамаи сокетҳои дар руми фармоиш
 * @param orderId - ID фармоиш
 * @param event - Номи рӯйдод
 * @param data - Маълумот
 */
export const broadcastToOrderRoom = (orderId: string, event: string, data: any): void => {
    const io = getIO();
    if (!io) {
        logger.warn('Socket.IO not initialized, cannot broadcast');
        return;
    }
    const roomName = socketConfig.rooms.orderTracking(orderId);
    io.to(roomName).emit(event, data);
    logger.debug(`Broadcasted ${event} to order room ${orderId}`);
};

/**
 * Фиристодани рӯйдод ба курьери мушаххас
 * @param courierId - ID курьер
 * @param event - Номи рӯйдод
 * @param data - Маълумот
 */
export const sendToCourier = (courierId: string, event: string, data: any): void => {
    const io = getIO();
    if (!io) {
        logger.warn('Socket.IO not initialized, cannot send to courier');
        return;
    }
    const roomName = socketConfig.rooms.courierLocation(courierId);
    io.to(roomName).emit(event, data);
    logger.debug(`Sent ${event} to courier ${courierId}`);
};

/**
 * Фиристодани уведомление ба корбари мушаххас
 * @param userId - ID корбар
 * @param notification - Маълумоти уведомление
 */
export const sendNotificationToUser = (userId: string, notification: { title?: string; body: string; data?: any }): void => {
    const io = getIO();
    if (!io) {
        logger.warn('Socket.IO not initialized, cannot send notification');
        return;
    }
    const roomName = socketConfig.rooms.userNotifications(userId);
    io.to(roomName).emit(socketConfig.events.NEW_NOTIFICATION, notification);
    logger.debug(`Sent notification to user ${userId}`);
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
