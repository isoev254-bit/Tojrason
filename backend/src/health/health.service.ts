<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>health.service.ts</title>
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
// health/health.service.ts - Логикаи санҷиши саломатии сервер
import prisma from '../config/db';
import { redis } from '../config/redis';
import { env } from '../config/env';
import logger from '../config/logger';

export interface HealthStatus {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    uptime: number;
    services: {
        database: boolean;
        redis: boolean;
    };
    version: string;
}

export interface DetailedHealth extends HealthStatus {
    checks: {
        database: { connected: boolean; latency?: number; error?: string };
        redis: { connected: boolean; latency?: number; error?: string };
        memory: { used: number; total: number; percent: number };
    };
}

export class HealthService {
    private startTime: Date;

    constructor() {
        this.startTime = new Date();
    }

    /**
     * Санҷиши асосии саломатӣ
     */
    async check(): Promise&lt;HealthStatus&gt; {
        const [dbOk, redisOk] = await Promise.all([
            this.checkDatabase(),
            this.checkRedis(),
        ]);

        const status = (dbOk && redisOk) ? 'healthy' : 'unhealthy';

        return {
            status,
            timestamp: new Date().toISOString(),
            uptime: this.getUptimeSeconds(),
            services: {
                database: dbOk,
                redis: redisOk,
            },
            version: env.NODE_ENV,
        };
    }

    /**
     * Санҷиши муфассали саломатӣ
     */
    async getDetailedStatus(): Promise&lt;DetailedHealth&gt; {
        const [dbCheck, redisCheck] = await Promise.all([
            this.checkDatabaseDetailed(),
            this.checkRedisDetailed(),
        ]);

        const status = (dbCheck.connected && redisCheck.connected) ? 'healthy' : 'unhealthy';

        const memoryUsage = process.memoryUsage();
        const totalMemory = memoryUsage.heapTotal;
        const usedMemory = memoryUsage.heapUsed;
        const memoryPercent = (usedMemory / totalMemory) * 100;

        return {
            status,
            timestamp: new Date().toISOString(),
            uptime: this.getUptimeSeconds(),
            services: {
                database: dbCheck.connected,
                redis: redisCheck.connected,
            },
            version: env.NODE_ENV,
            checks: {
                database: dbCheck,
                redis: redisCheck,
                memory: {
                    used: Math.round(usedMemory / 1024 / 1024),
                    total: Math.round(totalMemory / 1024 / 1024),
                    percent: Math.round(memoryPercent * 100) / 100,
                },
            },
        };
    }

    /**
     * Санҷиши пайвастшавӣ ба базаи додаҳо
     * @returns true агар пайваст шавад, false дар акси ҳол
     */
    async checkDatabase(): Promise&lt;boolean&gt; {
        try {
            await prisma.$queryRaw`SELECT 1`;
            return true;
        } catch (error) {
            logger.error('Database health check failed:', error);
            return false;
        }
    }

    /**
     * Санҷиши муфассали базаи додаҳо бо вақти вокуниш
     */
    async checkDatabaseDetailed(): Promise<{ connected: boolean; latency?: number; error?: string }> {
        const start = Date.now();
        try {
            await prisma.$queryRaw`SELECT 1`;
            const latency = Date.now() - start;
            return { connected: true, latency };
        } catch (error: any) {
            logger.error('Database health check failed:', error);
            return { connected: false, error: error.message };
        }
    }

    /**
     * Санҷиши пайвастшавӣ ба Redis
     * @returns true агар пайваст шавад, false дар акси ҳол
     */
    async checkRedis(): Promise&lt;boolean&gt; {
        try {
            const result = await redis.ping();
            return result === 'PONG';
        } catch (error) {
            logger.error('Redis health check failed:', error);
            return false;
        }
    }

    /**
     * Санҷиши муфассали Redis бо вақти вокуниш
     */
    async checkRedisDetailed(): Promise<{ connected: boolean; latency?: number; error?: string }> {
        const start = Date.now();
        try {
            const result = await redis.ping();
            const latency = Date.now() - start;
            return { connected: result === 'PONG', latency };
        } catch (error: any) {
            logger.error('Redis health check failed:', error);
            return { connected: false, error: error.message };
        }
    }

    /**
     * Санҷиши омодагӣ барои қабули трафик
     */
    async isReady(): Promise&lt;boolean&gt; {
        const [dbOk, redisOk] = await Promise.all([
            this.checkDatabase(),
            this.checkRedis(),
        ]);
        return dbOk && redisOk;
    }

    /**
     * Гирифтани вақти коркарди сервер (uptime) дар сония
     */
    private getUptimeSeconds(): number {
        return Math.floor((Date.now() - this.startTime.getTime()) / 1000);
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
