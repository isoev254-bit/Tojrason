<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>socket.ts</title>
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
// sockets/socket.ts - Конфигуратсия ва инициализатсияи Socket.IO сервер
import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { verifyToken } from '../common/utils/token';
import { socketConfig } from '../config/socket.config';
import { OrderSocketHandler } from './handlers/order.socket';
import { CourierSocketHandler } from './handlers/courier.socket';
import logger from '../config/logger';

let io: SocketServer | null = null;

export const initSocket = (server: HttpServer): SocketServer => {
    io = new SocketServer(server, {
        path: socketConfig.path,
        cors: socketConfig.cors,
        pingTimeout: socketConfig.pingTimeout,
        pingInterval: socketConfig.pingInterval,
        maxHttpBufferSize: socketConfig.maxHttpBufferSize,
    });

    // Middleware барои аутентификатсияи токен
    io.use(async (socket: Socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Аутентификатсия талаб карда мешавад'));
            }
            const payload = verifyToken(token);
            if (!payload) {
                return next(new Error('Токен беэътибор аст'));
            }
            socket.data.user = payload;
            next();
        } catch (err) {
            next(new Error('Хатогии аутентификатсия'));
        }
    });

    // Рӯйдодҳои асосии пайвастшавӣ ва ҷудошавӣ
    io.on('connection', (socket: Socket) => {
        logger.info(`Socket connected: ${socket.id}, user: ${socket.data.user?.id}`);

        // Инициализатсияи handler'ҳо
        const orderHandler = new OrderSocketHandler();
        const courierHandler = new CourierSocketHandler();

        orderHandler.register(socket);
        courierHandler.register(socket);

        // Рӯйдоди ҷудошавӣ
        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.id}`);
        });

        // Рӯйдоди хатогӣ
        socket.on('error', (err) => {
            logger.error(`Socket error for ${socket.id}: ${err.message}`);
        });
    });

    logger.info('Socket.IO server initialized');
    return io;
};

// Функсия барои гирифтани инстанси io (барои истифода дар ҷойҳои дигар)
export const getIO = (): SocketServer | null => {
    return io;
};

// Экспорти инстанси io барои истифода дар handler'ҳо (вақте ки инициализатсия шуд)
export { io };
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
