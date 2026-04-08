<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>cache.service.ts</title>
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
// cache/cache.service.ts - Сервиси кэш барои кор бо Redis
import { redis } from '../config/redis';
import logger from '../config/logger';

export class CacheService {
    /**
     * Гирифтани маълумот аз кэш бо калид
     * @param key - Калиди кэш
     * @returns Маълумот дар формати JSON ё null
     */
    async get&lt;T&gt;(key: string): Promise&lt;T | null&gt; {
        try {
            const data = await redis.get(key);
            if (!data) return null;
            return JSON.parse(data) as T;
        } catch (error) {
            logger.error(`Cache get error for key ${key}:`, error);
            return null;
        }
    }

    /**
     * Нигоҳдории маълумот дар кэш
     * @param key - Калиди кэш
     * @param value - Маълумот (объект ё массив)
     * @param ttlSeconds - Вақти зинда мондан (сония), агар набошад - абадӣ
     */
    async set(key: string, value: any, ttlSeconds?: number): Promise&lt;boolean&gt; {
        try {
            const serialized = JSON.stringify(value);
            if (ttlSeconds) {
                await redis.set(key, serialized, 'EX', ttlSeconds);
            } else {
                await redis.set(key, serialized);
            }
            return true;
        } catch (error) {
            logger.error(`Cache set error for key ${key}:`, error);
            return false;
        }
    }

    /**
     * Нест кардани маълумот аз кэш
     * @param key - Калиди кэш
     */
    async del(key: string): Promise&lt;boolean&gt; {
        try {
            await redis.del(key);
            return true;
        } catch (error) {
            logger.error(`Cache del error for key ${key}:`, error);
            return false;
        }
    }

    /**
     * Нест кардани ҳамаи калидҳо бо префикси додашуда (масалан "order:*")
     * @param pattern - Намуна (pattern) барои ҷустуҷӯ, масалан "order:*"
     */
    async delByPattern(pattern: string): Promise&lt;number&gt; {
        try {
            let cursor = '0';
            let deletedCount = 0;
            do {
                const reply = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
                cursor = reply[0];
                const keys = reply[1];
                if (keys.length) {
                    await redis.del(...keys);
                    deletedCount += keys.length;
                }
            } while (cursor !== '0');
            return deletedCount;
        } catch (error) {
            logger.error(`Cache delByPattern error for pattern ${pattern}:`, error);
            return 0;
        }
    }

    /**
     * Санҷидани мавҷудияти калид дар кэш
     * @param key - Калиди кэш
     */
    async exists(key: string): Promise&lt;boolean&gt; {
        try {
            const result = await redis.exists(key);
            return result === 1;
        } catch (error) {
            logger.error(`Cache exists error for key ${key}:`, error);
            return false;
        }
    }

    /**
     * Тоза кардани ҳамаи кэш (бо эҳтиёт)
     */
    async flushAll(): Promise&lt;boolean&gt; {
        try {
            await redis.flushall();
            logger.warn('Cache flushed all');
            return true;
        } catch (error) {
            logger.error('Cache flushAll error:', error);
            return false;
        }
    }

    /**
     * Гирифтани вақти боқимондаи зиндагии калид (TTL)
     * @param key - Калиди кэш
     * @returns TTL дар сония, -1 агар абадӣ, -2 агар мавҷуд набошад
     */
    async getTTL(key: string): Promise&lt;number&gt; {
        try {
            return await redis.ttl(key);
        } catch (error) {
            logger.error(`Cache getTTL error for key ${key}:`, error);
            return -2;
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
