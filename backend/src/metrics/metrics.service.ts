<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>metrics.service.ts</title>
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
// metrics/metrics.service.ts - Хидмати ҷамъоварии метрикаҳо барои мониторинг
import client from 'prom-client';
import logger from '../config/logger';

export class MetricsService {
    private static instance: MetricsService;
    private isInitialized: boolean = false;

    // Метрикаҳои асосӣ
    public httpRequestDuration: client.Histogram&lt;string&gt;;
    public httpRequestsTotal: client.Counter&lt;string&gt;;
    public activeOrders: client.Gauge&lt;string&gt;;
    public couriersOnline: client.Gauge&lt;string&gt;;
    public orderProcessingDuration: client.Histogram&lt;string&gt;;
    public databaseQueryDuration: client.Histogram&lt;string&gt;;

    private constructor() {
        // Регистратсияи метрикаҳо
        this.httpRequestDuration = new client.Histogram({
            name: 'http_request_duration_seconds',
            help: 'Duration of HTTP requests in seconds',
            labelNames: ['method', 'route', 'status_code'],
            buckets: [0.1, 0.5, 1, 2, 5, 10],
        });

        this.httpRequestsTotal = new client.Counter({
            name: 'http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'route', 'status_code'],
        });

        this.activeOrders = new client.Gauge({
            name: 'active_orders_total',
            help: 'Total number of active orders (pending + assigned + picked_up)',
        });

        this.couriersOnline = new client.Gauge({
            name: 'couriers_online_total',
            help: 'Total number of couriers currently online and available',
        });

        this.orderProcessingDuration = new client.Histogram({
            name: 'order_processing_duration_seconds',
            help: 'Time from order creation to delivery',
            buckets: [60, 300, 600, 1800, 3600],
        });

        this.databaseQueryDuration = new client.Histogram({
            name: 'database_query_duration_seconds',
            help: 'Duration of database queries',
            labelNames: ['operation', 'table'],
            buckets: [0.01, 0.05, 0.1, 0.5, 1],
        });
    }

    public static getInstance(): MetricsService {
        if (!MetricsService.instance) {
            MetricsService.instance = new MetricsService();
        }
        return MetricsService.instance;
    }

    /**
     * Инициализатсияи метрикаҳо (барои регистратсия дар Prometheus)
     */
    public init(): void {
        if (this.isInitialized) return;
        client.collectDefaultMetrics({
            prefix: 'tojrason_',
            timeout: 10000,
        });
        this.isInitialized = true;
        logger.info('Metrics service initialized');
    }

    /**
     * Гирифтани метрикаҳо дар формати Prometheus
     * @returns Матни метрикаҳо
     */
    public async getMetrics(): Promise&lt;string&gt; {
        return client.register.metrics();
    }

    /**
     * Баланд бардоштани counter барои дархостҳои HTTP
     */
    public incrementHttpRequests(method: string, route: string, statusCode: number): void {
        this.httpRequestsTotal.inc({ method, route, status_code: statusCode });
    }

    /**
     * Сабти давомнокии дархости HTTP
     */
    public observeHttpDuration(durationSeconds: number, method: string, route: string, statusCode: number): void {
        this.httpRequestDuration.observe({ method, route, status_code: statusCode }, durationSeconds);
    }

    /**
     * Навсозии шумораи фармоишҳои фаъол
     */
    public setActiveOrders(count: number): void {
        this.activeOrders.set(count);
    }

    /**
     * Навсозии шумораи курьерҳои онлайн
     */
    public setCouriersOnline(count: number): void {
        this.couriersOnline.set(count);
    }

    /**
     * Сабти давомнокии коркарди фармоиш (аз эҷод то расонидан)
     */
    public observeOrderProcessingDuration(seconds: number): void {
        this.orderProcessingDuration.observe(seconds);
    }

    /**
     * Сабти давомнокии саволҳои базаи додаҳо
     */
    public observeDatabaseQuery(durationSeconds: number, operation: string, table: string): void {
        this.databaseQueryDuration.observe({ operation, table }, durationSeconds);
    }

    /**
     * Афзоиши counter барои хатогиҳои мушаххас
     */
    public incrementErrors(errorType: string, module: string): void {
        const errorCounter = new client.Counter({
            name: 'errors_total',
            help: 'Total number of errors',
            labelNames: ['error_type', 'module'],
        });
        errorCounter.inc({ error_type: errorType, module });
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
