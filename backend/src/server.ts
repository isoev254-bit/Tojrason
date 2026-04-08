<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>server.ts</title>
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
// server.ts - Нуқтаи вуруди сервер (entry point)
import http from 'http';
import app from './app';
import prisma, { disconnectDB } from './config/db';
import { connectRedis, disconnectRedis } from './config/redis';
import { closeQueues, startWorkers } from './queue';
import { initSocket } from './sockets';
import { env } from './config/env';
import logger from './config/logger';

const PORT = env.PORT;

let server: http.Server | null = null;

/**
 * Оғози сервер ва пайвастшавӣ ба ҳамаи хидматҳо
 */
const startServer = async (): Promise&lt;void&gt; =&gt; {
    try {
        // 1. Пайвастшавӣ ба базаи додаҳо
        await prisma.$connect();
        logger.info('✅ Базаи додаҳо (PostgreSQL) пайваст шуд');

        // 2. Пайвастшавӣ ба Redis
        await connectRedis();
        logger.info('✅ Redis пайваст шуд');

        // 3. Оғози worker'ҳои навбат (queue)
        await startWorkers();
        logger.info('✅ Queue workers оғоз шуданд');

        // 4. Эҷоди сервери HTTP
        server = http.createServer(app);

        // 5. Инициализатсияи Socket.IO
        initSocket(server);
        logger.info('✅ Socket.IO оғоз шуд');

        // 6. Гӯш кардани порт
        server.listen(PORT, () =&gt; {
            logger.info(`🚀 Сервер дар порти ${PORT} кор мекунад`);
            logger.info(`📝 Муҳит: ${env.NODE_ENV}`);
            logger.info(`🌐 API: http://localhost:${PORT}/api`);
            logger.info(`📄 Swagger: http://localhost:${PORT}/api-docs`);
            logger.info(`📊 Метрика: http://localhost:${PORT}/metrics`);
        });

    } catch (error) {
        logger.error('❌ Хатогӣ ҳангоми оғози сервер:', error);
        process.exit(1);
    }
};

/**
 * Пӯшидани сервер ва ҳамаи пайвастҳо (graceful shutdown)
 */
const shutdown = async (signal: string): Promise&lt;void&gt; =&gt; {
    logger.info(`📴 Қабули сигнал: ${signal}. Оғози пӯшидани сервер...`);

    if (server) {
        server.close(async () =&gt; {
            logger.info('HTTP сервер пӯшида шуд');

            // Пӯшидани worker'ҳои навбат
            await closeQueues();
            logger.info('Queue workers пӯшида шуданд');

            // Пӯшидани пайвастҳои базаи додаҳо
            await disconnectDB();
            
            // Пӯшидани пайвасти Redis
            await disconnectRedis();
            
            logger.info('✅ Сервер бомуваффақият пӯшида шуд');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
};

// Сабти сигналҳо барои пӯшидани сервер
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Коркарди хатогиҳои пешбининашуда
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
    shutdown('unhandledRejection');
});

// Оғози сервер
startServer();
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
