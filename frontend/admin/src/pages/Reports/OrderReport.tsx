<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>OrderReport.tsx</title>
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
// frontend/admin/src/pages/Reports/OrderReport.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Table, Column } from '../../components/common/Table';
import { ordersApi, Order } from '../../api/orders.api';
import './Reports.module.css';

export const OrderReport: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        toDate: new Date().toISOString().slice(0, 10),
    });
    const [stats, setStats] = useState({
        total: 0,
        delivered: 0,
        cancelled: 0,
        pending: 0,
        totalAmount: 0,
    });

    useEffect(() => {
        fetchOrders();
    }, [dateRange]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await ordersApi.getAllOrders({
                fromDate: dateRange.fromDate,
                toDate: dateRange.toDate,
                page: 1,
                limit: 500,
            });
            if (response.success) {
                setOrders(response.data.data);
                
                const total = response.data.data.length;
                const delivered = response.data.data.filter(o => o.status === 'DELIVERED').length;
                const cancelled = response.data.data.filter(o => o.status === 'CANCELLED').length;
                const pending = response.data.data.filter(o => o.status === 'PENDING').length;
                const totalAmount = response.data.data.reduce((sum, o) => sum + o.totalAmount, 0);
                
                setStats({ total, delivered, cancelled, pending, totalAmount });
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        const headers = ['ID', 'Муштарӣ', 'Маблағ', 'Ҳолат', 'Сана'];
        const rows = orders.map(o => [
            o.id,
            o.clientName,
            o.totalAmount,
            o.status,
            new Date(o.createdAt).toLocaleDateString('tg-TJ'),
        ]);
        
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', `order_report_${dateRange.fromDate}_${dateRange.toDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handlePrint = () => {
        window.print();
    };

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('tg-TJ').format(price) + ' сом';
    };

    const getStatusLabel = (status: string): string => {
        switch (status) {
            case 'PENDING': return 'Интизорӣ';
            case 'ASSIGNED': return 'Таъин шуд';
            case 'PICKED_UP': return 'Гирифта шуд';
            case 'DELIVERED': return 'Расонида шуд';
            case 'CANCELLED': return 'Бекор шуд';
            default: return status;
        }
    };

    const columns: Column<Order>[] = [
        { key: 'id', title: 'ID фармоиш' },
        { key: 'clientName', title: 'Муштарӣ' },
        { key: 'totalAmount', title: 'Маблағ', render: (value) => formatPrice(value) },
        { key: 'status', title: 'Ҳолат', render: (value) => getStatusLabel(value) },
        { key: 'createdAt', title: 'Сана', render: (value) => new Date(value).toLocaleDateString('tg-TJ') },
    ];

    return (
        <div className="order-report-page">
            <div className="report-header">
                <div>
                    <h1 className="report-title">Гузориши фармоишҳо</h1>
                    <p className="report-subtitle">Таҳлили фармоишҳо дар давраи интихобшуда</p>
                </div>
                <div className="report-actions">
                    <Button variant="ghost" onClick={handleExportCSV}>
                        📄 CSV
                    </Button>
                    <Button variant="primary" onClick={handlePrint}>
                        🖨 Чоп
                    </Button>
                </div>
            </div>

            {/* Танзимоти сана */}
            <Card className="report-date-range">
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
                    <Button variant="primary" onClick={fetchOrders} loading={loading}>
                        Навсозӣ
                    </Button>
                </div>
            </Card>

            {/* Омор */}
            <div className="report-stats">
                <div className="stat-card">
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Ҷамъи фармоишҳо</div>
                </div>
                <div className="stat-card success">
                    <div className="stat-value">{stats.delivered}</div>
                    <div className="stat-label">Расонида шуд</div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-value">{stats.pending}</div>
                    <div className="stat-label">Интизорӣ</div>
                </div>
                <div className="stat-card danger">
                    <div className="stat-value">{stats.cancelled}</div>
                    <div className="stat-label">Бекор шуд</div>
                </div>
                <div className="stat-card primary">
                    <div className="stat-value">{formatPrice(stats.totalAmount)}</div>
                    <div className="stat-label">Маблағи умумӣ</div>
                </div>
            </div>

            {/* Матн барои чоп */}
            <div className="print-header">
                <h2>Tojrason - Гузориши фармоишҳо</h2>
                <p>Давра: {dateRange.fromDate} то {dateRange.toDate}</p>
                <p>Санаи чоп: {new Date().toLocaleString('tg-TJ')}</p>
                <hr />
            </div>

            {/* Таблитсаи фармоишҳо */}
            <Card title="Рӯйхати фармоишҳо">
                <Table
                    data={orders}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    striped
                    bordered
                />
            </Card>
        </div>
    );
};

export default OrderReport;
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
