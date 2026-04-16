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
// frontend/admin/src/utils/socket.ts
import { io, Socket } from 'socket.io-client';

// URL-и сервери Socket.IO
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Инстанси ягонаи сокет
let socket: Socket | null = null;

/**
 * Пайвастшавӣ ба сервери Socket.IO
 * @param token - JWT токен барои аутентификатсия
 * @returns Инстанси Socket
 */
export const connectSocket = (token: string | null): Socket => {
    if (socket && socket.connected) {
        return socket;
    }

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
        console.log('🔌 Socket connected');
    });

    socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
        if (reason === 'io server disconnect') {
            socket?.connect();
        }
    });

    socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
    });

    return socket;
};

/**
 * Гирифтани инстанси сокет (агар мавҷуд бошад)
 * @returns Инстанси Socket ё null
 */
export const getSocket = (): Socket | null => {
    return socket;
};

/**
 * Ҷудошавӣ аз сервер
 */
export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

/**
 * Гӯш кардани рӯйдод
 * @param event - Номи рӯйдод
 * @param callback - Функсияи ҳангоми рӯйдод
 */
export const onSocketEvent = (event: string, callback: (...args: any[]) => void): void => {
    if (socket) {
        socket.on(event, callback);
    }
};

/**
 * Нест кардани гӯшкунӣ
 * @param event - Номи рӯйдод
 * @param callback - Функсияи гӯшкунӣ (ихтиёрӣ)
 */
export const offSocketEvent = (event: string, callback?: (...args: any[]) => void): void => {
    if (socket) {
        if (callback) {
            socket.off(event, callback);
        } else {
            socket.off(event);
        }
    }
};

/**
 * Фиристодани рӯйдод
 * @param event - Номи рӯйдод
 * @param data - Маълумот
 */
export const emitSocketEvent = (event: string, data?: any): void => {
    if (socket && socket.connected) {
        socket.emit(event, data);
    } else {
        console.warn(`Socket not connected, cannot emit ${event}`);
    }
};

/**
 * Рӯйдодҳои маъмулӣ барои фармоишҳо
 */
export const socketEvents = {
    // Аз клиент
    ORDER_TRACK: 'order:track',
    ORDER_STATUS_SUBSCRIBE: 'order:status_subscribe',
    COURIER_UPDATE_LOCATION: 'courier:update-location',
    COURIER_ACCEPT_ORDER: 'courier:accept-order',
    COURIER_UPDATE_STATUS: 'courier:update-status',
    
    // Ба клиент
    ORDER_ASSIGNED: 'order:assigned',
    ORDER_STATUS_UPDATE: 'order:status-update',
    COURIER_LOCATION_UPDATE: 'courier:location-update',
    NEW_NOTIFICATION: 'notification:new',
};
    </pre>
</div>
<script>
function copyCode() {
    const code = document.getElementById('codeBlock').innerText;
    navigator.clipboard.writeText(code).then(() => {
        alert('✅ Код копия карда шуд!');
    }).catch(() => {
        alert('❌ Хатогӣ ҳангоми копия кардан');
    });
}
</script>
</body>
</html>
