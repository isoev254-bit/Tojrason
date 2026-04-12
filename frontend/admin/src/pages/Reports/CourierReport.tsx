<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CourierReport.tsx</title>
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
// frontend/admin/src/pages/Reports/CourierReport.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Table, Column } from '../../components/common/Table';
import { usersApi, User } from '../../api/users.api';
import { ordersApi } from '../../api/orders.api';
import './Reports.module.css';

interface CourierStats {
    courier: User;
    totalDeliveries: number;
    totalEarnings: number;
    averageRating: number;
    activeOrders: number;
}

export const CourierReport: React.FC = () => {
    const [courierStats, setCourierStats] = useState<CourierStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        toDate: new Date().toISOString().slice(0, 10),
    });
    const [stats, setStats] = useState({
        totalCouriers: 0,
        totalDeliveries: 0,
        totalEarnings: 0,
        averageRating: 0,
    });

    useEffect(() => {
        fetchCourierStats();
    }, [dateRange]);

    const fetchCourierStats = async () => {
        setLoading(true);
        try {
            const response = await usersApi.getAllUsers({ role: 'COURIER' });
            if (response.success) {
                const couriers = response.data.data;
                const statsArray: CourierStats[] = [];
                let totalDeliveries = 0;
                let totalEarnings = 0;
                let totalRating = 0;

                for (const courier of couriers) {
                    const ordersRes = await ordersApi.getAllOrders({
                        courierId: courier.id,
                        status: 'DELIVERED',
                        fromDate: dateRange.fromDate,
                        toDate: dateRange.toDate,
                    });
                    
                    const deliveries = ordersRes.success ? ordersRes.data.total : 0;
                    const earnings = ordersRes.success 
                        ? ordersRes.data.data.reduce((sum, o) => sum + o.deliveryFee, 0) 
                        : 0;
                    const rating = (courier as any).rating || 5.0;
                    
                    statsArray.push({
                        courier,
                        totalDeliveries: deliveries,
                        totalEarnings: earnings,
                        averageRating: rating,
                        activeOrders: 0,
                    });
                    
                    totalDeliveries += deliveries;
                    totalEarnings += earnings;
                    totalRating += rating;
                }
                
                setCourierStats(statsArray);
                setStats({
                    totalCouriers: couriers.length,
                    totalDeliveries,
                    totalEarnings,
                    averageRating: totalRating / couriers.length || 0,
                });
            }
        } catch (error) {
            console.error('Error fetching courier stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        const headers = ['Курьер', 'Телефон', 'Фармоишҳо', 'Даромад', 'Рейтинг'];
        const rows = courierStats.map(cs => [
            cs.courier.fullName,
            cs.courier.phone,
            cs.totalDeliveries,
            cs.totalEarnings,
            cs.averageRating,
        ]);
        
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', `courier_report_${dateRange.fromDate}_${dateRange.toDate}.csv`);
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

    const columns: Column<CourierStats>[] = [
        {
            key: 'courier',
            title: 'Курьер',
            render: (_, record) => record.courier.fullName,
        },
        {
            key: 'courier.phone',
            title: 'Телефон',
            render: (_, record) => record.courier.phone,
        },
        {
            key: 'totalDeliveries',
            title: 'Фармоишҳои расонида',
            render: (value) => value,
        },
        {
            key: 'totalEarnings',
            title: 'Даромад',
            render: (value) => formatPrice(value),
        },
        {
            key: 'averageRating',
            title: 'Рейтинг',
            render: (value) => `⭐ ${value.toFixed(1)}`,
        },
    ];

    return (
        <div className="courier-report-page">
            <div className="report-header">
                <div>
                    <h1 className="report-title">Гузориши курьерҳо</h1>
                    <p className="report-subtitle">Таҳлили фаъолияти курьерҳо дар давраи интихобшуда</p>
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
                    <Button variant="primary" onClick={fetchCourierStats} loading={loading}>
                        Навсозӣ
                    </Button>
                </div>
            </Card>

            {/* Омор */}
            <div className="report-stats">
                <div className="stat-card">
                    <div className="stat-value">{stats.totalCouriers}</div>
                    <div className="stat-label">Ҳамаи курьерҳо</div>
                </div>
                <div className="stat-card success">
                    <div className="stat-value">{stats.totalDeliveries}</div>
                    <div className="stat-label">Фармоишҳои расонида</div>
                </div>
                <div className="stat-card primary">
                    <div className="stat-value">{formatPrice(stats.totalEarnings)}</div>
                    <div className="stat-label">Даромади умумӣ</div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-value">⭐ {stats.averageRating.toFixed(1)}</div>
                    <div className="stat-label">Рейтинги миёна</div>
                </div>
            </div>

            {/* Матн барои чоп */}
            <div className="print-header">
                <h2>Tojrason - Гузориши курьерҳо</h2>
                <p>Давра: {dateRange.fromDate} то {dateRange.toDate}</p>
                <p>Санаи чоп: {new Date().toLocaleString('tg-TJ')}</p>
                <hr />
            </div>

            {/* Таблитсаи курьерҳо */}
            <Card title="Рӯйхати курьерҳо">
                <Table
                    data={courierStats}
                    columns={columns}
                    rowKey={(record) => record.courier.id}
                    loading={loading}
                    striped
                    bordered
                />
            </Card>
        </div>
    );
};

export default CourierReport;
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
