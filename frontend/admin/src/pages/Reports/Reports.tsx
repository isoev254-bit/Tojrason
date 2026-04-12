<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Reports.tsx</title>
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
// frontend/admin/src/pages/Reports/Reports.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LineChart, BarChart, PieChart } from '../../components/features/Charts';
import { ordersApi } from '../../api/orders.api';
import { paymentsApi } from '../../api/payments.api';
import './Reports.module.css';

type ReportType = 'orders' | 'revenue' | 'couriers' | 'clients';

export const Reports: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ReportType>('orders');
    const [dateRange, setDateRange] = useState({
        fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        toDate: new Date().toISOString().slice(0, 10),
    });
    const [loading, setLoading] = useState(false);

    // Маълумот барои диаграммаҳо
    const [ordersChartData, setOrdersChartData] = useState({
        labels: ['Душ', 'Сеш', 'Чор', 'Пан', 'Ҷум', 'Шан', 'Якш'],
        datasets: [
            { label: 'Фармоишҳо', data: [65, 72, 88, 95, 102, 118, 145], color: '#4a90ff' },
            { label: 'Фармоишҳои расонида', data: [60, 68, 82, 90, 98, 112, 138], color: '#22d693' },
        ],
    });

    const [revenueChartData, setRevenueChartData] = useState({
        labels: ['Душ', 'Сеш', 'Чор', 'Пан', 'Ҷум', 'Шан', 'Якш'],
        datasets: [
            { label: 'Даромад (сом)', data: [12500, 14800, 16200, 18900, 21200, 23500, 27800], color: '#22d693' },
        ],
    });

    const [statusPieData, setStatusPieData] = useState({
        labels: ['Интизорӣ', 'Таъин шуд', 'Гирифта шуд', 'Расонида шуд', 'Бекор шуд'],
        data: [15, 8, 12, 245, 5],
        colors: ['#ff9f43', '#a78bfa', '#22d3ee', '#22d693', '#ff5c5c'],
    });

    const [courierPieData, setCourierPieData] = useState({
        labels: ['Али', 'Умар', 'Сорбон', 'Баҳром', 'Дигар'],
        data: [45, 38, 52, 30, 80],
        colors: ['#4a90ff', '#22d693', '#ff9f43', '#a78bfa', '#64748b'],
    });

    useEffect(() => {
        fetchReportData();
    }, [dateRange, activeTab]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            // Дар лоиҳаи воқеӣ, маълумотро аз API гиред
            // Барои намуна, маълумоти статикӣ истифода мешавад
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
        // Дар лоиҳаи воқеӣ, файлро экспорт кунед
        alert(`Экспорт ба формати ${format.toUpperCase()}`);
    };

    const handlePrint = () => {
        window.print();
    };

    const tabs = [
        { key: 'orders', label: 'Фармоишҳо', icon: '📦' },
        { key: 'revenue', label: 'Даромад', icon: '💰' },
        { key: 'couriers', label: 'Курерҳо', icon: '🏍️' },
        { key: 'clients', label: 'Муштариён', icon: '👥' },
    ];

    return (
        <div className="reports-page">
            <div className="reports-header">
                <div>
                    <h1 className="reports-title">Гузоришҳо</h1>
                    <p className="reports-subtitle">Таҳлили омор ва гузоришҳои система</p>
                </div>
                <div className="reports-actions">
                    <Button variant="ghost" onClick={() => handleExport('csv')}>
                        📄 CSV
                    </Button>
                    <Button variant="ghost" onClick={() => handleExport('excel')}>
                        📊 Excel
                    </Button>
                    <Button variant="ghost" onClick={() => handleExport('pdf')}>
                        📑 PDF
                    </Button>
                    <Button variant="primary" onClick={handlePrint}>
                        🖨 Чоп
                    </Button>
                </div>
            </div>

            {/* Танзимоти сана */}
            <Card className="reports-date-range">
                <div className="date-range-row">
                    <Input
                        type="date"
                        label="Аз сана"
                        value={dateRange.fromDate}
                        onChange={(e) => setDateRange({ ...dateRange, fromDate: e.target.value })}
                        className="date-input"
                    />
                    <Input
                        type="date"
                        label="То сана"
                        value={dateRange.toDate}
                        onChange={(e) => setDateRange({ ...dateRange, toDate: e.target.value })}
                        className="date-input"
                    />
                    <Button variant="primary" onClick={fetchReportData} loading={loading}>
                        Навсозӣ
                    </Button>
                </div>
            </Card>

            {/* Табҳо */}
            <div className="reports-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key as ReportType)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Матн барои чоп */}
            <div className="print-header">
                <h2>Tojrason - Гузориши {tabs.find(t => t.key === activeTab)?.label}</h2>
                <p>Давра: {dateRange.fromDate} то {dateRange.toDate}</p>
                <p>Санаи чоп: {new Date().toLocaleString('tg-TJ')}</p>
            </div>

            {/* Мазмуни гузориш */}
            <div className="reports-content">
                {activeTab === 'orders' && (
                    <>
                        <Card title="Омори фармоишҳо">
                            <div className="stats-summary">
                                <div className="summary-item">
                                    <div className="summary-value">245</div>
                                    <div className="summary-label">Ҷамъи фармоишҳо</div>
                                </div>
                                <div className="summary-item success">
                                    <div className="summary-value">225</div>
                                    <div className="summary-label">Расонида шуд</div>
                                </div>
                                <div className="summary-item warning">
                                    <div className="summary-value">15</div>
                                    <div className="summary-label">Интизорӣ</div>
                                </div>
                                <div className="summary-item danger">
                                    <div className="summary-value">5</div>
                                    <div className="summary-label">Бекор шуд</div>
                                </div>
                            </div>
                        </Card>

                        <div className="reports-charts">
                            <Card title="Тағйироти фармоишҳо дар як ҳафта">
                                <LineChart data={ordersChartData} height={300} />
                            </Card>
                            <Card title="Тақсимоти фармоишҳо аз рӯи ҳолат">
                                <PieChart data={statusPieData} size={280} />
                            </Card>
                        </div>
                    </>
                )}

                {activeTab === 'revenue' && (
                    <>
                        <Card title="Омори даромад">
                            <div className="stats-summary">
                                <div className="summary-item">
                                    <div className="summary-value">124,850 сом</div>
                                    <div className="summary-label">Ҷамъи даромад</div>
                                </div>
                                <div className="summary-item success">
                                    <div className="summary-value">98,200 сом</div>
                                    <div className="summary-label">Пардохтҳои онлайн</div>
                                </div>
                                <div className="summary-item warning">
                                    <div className="summary-value">26,650 сом</div>
                                    <div className="summary-label">Пардохти нақдӣ</div>
                                </div>
                            </div>
                        </Card>

                        <div className="reports-charts">
                            <Card title="Даромад дар як ҳафта">
                                <BarChart data={revenueChartData} height={300} />
                            </Card>
                        </div>
                    </>
                )}

                {activeTab === 'couriers' && (
                    <>
                        <Card title="Омори курьерҳо">
                            <div className="stats-summary">
                                <div className="summary-item">
                                    <div className="summary-value">18</div>
                                    <div className="summary-label">Ҳамаи курьерҳо</div>
                                </div>
                                <div className="summary-item success">
                                    <div className="summary-value">12</div>
                                    <div className="summary-label">Онлайн</div>
                                </div>
                                <div className="summary-item warning">
                                    <div className="summary-value">3</div>
                                    <div className="summary-label">Банд</div>
                                </div>
                                <div className="summary-item default">
                                    <div className="summary-value">3</div>
                                    <div className="summary-label">Офлайн</div>
                                </div>
                            </div>
                        </Card>

                        <div className="reports-charts">
                            <Card title="Фармоишҳои расонида аз рӯи курьерҳо">
                                <PieChart data={courierPieData} size={280} />
                            </Card>
                        </div>
                    </>
                )}

                {activeTab === 'clients' && (
                    <Card title="Омори муштариён">
                        <div className="stats-summary">
                            <div className="summary-item">
                                <div className="summary-value">156</div>
                                <div className="summary-label">Муштариён</div>
                            </div>
                            <div className="summary-item">
                                <div className="summary-value">89</div>
                                <div className="summary-label">Муштариёни фаъол</div>
                            </div>
                            <div className="summary-item">
                                <div className="summary-value">2,340</div>
                                <div className="summary-label">Ҷамъи фармоишҳо</div>
                            </div>
                            <div className="summary-item">
                                <div className="summary-value">124,850 сом</div>
                                <div className="summary-label">Ҷамъи харид</div>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Reports;
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
