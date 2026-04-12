<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Dashboard.tsx</title>
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
// frontend/admin/src/pages/Dashboard/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DefaultStatsCards } from '../../components/features/StatsCards';
import { OrderTable, Order } from '../../components/features/OrderTable';
import { LineChart, BarChart } from '../../components/features/Charts';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { ordersApi } from '../../api/orders.api';
import './Dashboard.module.css';

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [recentOrders, setRecentOrders] = useState&lt;Order[]&gt;([]);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalOrdersChange: 12,
        activeCouriers: 0,
        activeCouriersChange: 3,
        revenue: 0,
        revenueChange: 8,
        avgDeliveryTime: 0,
        avgDeliveryTimeChange: -2,
        complaints: 0,
        complaintsChange: 3,
        rating: 0,
        ratingChange: 0.2,
    });

    // Маълумоти диаграммаҳо
    const [orderChartData, setOrderChartData] = useState({
        labels: ['Душ', 'Сеш', 'Чор', 'Пан', 'Ҷум', 'Шан', 'Якш'],
        datasets: [
            { label: 'Фармоишҳо', data: [65, 72, 88, 95, 102, 118, 145], color: '#4a90ff' },
        ],
    });

    const [revenueChartData, setRevenueChartData] = useState({
        labels: ['Душ', 'Сеш', 'Чор', 'Пан', 'Ҷум', 'Шан', 'Якш'],
        datasets: [
            { label: 'Даромад (сом)', data: [12500, 14800, 16200, 18900, 21200, 23500, 27800], color: '#22d693' },
        ],
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Фармоишҳои охирин
                const ordersRes = await ordersApi.getAllOrders({ page: 1, limit: 5 });
                if (ordersRes.success) {
                    setRecentOrders(ordersRes.data.data);
                }

                // Оморҳои воқеӣ (дар лоиҳаи воқеӣ аз API гирифта мешавад)
                // Барои намуна, қиматҳои статикӣ гузошта шудаанд
                setStats({
                    totalOrders: 1247,
                    totalOrdersChange: 12,
                    activeCouriers: 18,
                    activeCouriersChange: 3,
                    revenue: 48250,
                    revenueChange: 8,
                    avgDeliveryTime: 32,
                    avgDeliveryTimeChange: -2,
                    complaints: 7,
                    complaintsChange: 3,
                    rating: 4.7,
                    ratingChange: 0.2,
                });

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleStatClick = (statKey: string) => {
        switch (statKey) {
            case 'orders':
                navigate('/orders');
                break;
            case 'couriers':
                navigate('/couriers');
                break;
            case 'revenue':
                navigate('/payments');
                break;
            case 'complaints':
                navigate('/complaints');
                break;
            default:
                break;
        }
    };

    const handleOrderRowClick = (order: Order) => {
        navigate(`/orders/${order.id}`);
    };

    const handleViewAllOrders = () => {
        navigate('/orders');
    };

    return (
        &lt;div className="dashboard"&gt;
            &lt;div className="dashboard-header"&gt;
                &lt;div&gt;
                    &lt;h1 className="dashboard-title"&gt;Панели идоракунӣ&lt;/h1&gt;
                    &lt;p className="dashboard-subtitle"&gt;
                        Хуш омадед, {user?.fullName || 'Администратор'}! Ҳамаи чиз дар назорат.
                    &lt;/p&gt;
                &lt;/div&gt;
                &lt;div className="dashboard-actions"&gt;
                    &lt;Button variant="primary" onClick={() => navigate('/orders')}&gt;
                        📦 Фармоиши нав
                    &lt;/Button&gt;
                &lt;/div&gt;
            &lt;/div&gt;

            &lt;DefaultStatsCards
                totalOrders={stats.totalOrders}
                totalOrdersChange={stats.totalOrdersChange}
                activeCouriers={stats.activeCouriers}
                activeCouriersChange={stats.activeCouriersChange}
                revenue={stats.revenue}
                revenueChange={stats.revenueChange}
                avgDeliveryTime={stats.avgDeliveryTime}
                avgDeliveryTimeChange={stats.avgDeliveryTimeChange}
                complaints={stats.complaints}
                complaintsChange={stats.complaintsChange}
                rating={stats.rating}
                ratingChange={stats.ratingChange}
                onStatClick={handleStatClick}
                loading={loading}
            /&gt;

            &lt;div className="dashboard-charts"&gt;
                &lt;Card title="Фармоишҳо дар як ҳафта" className="dashboard-chart-card"&gt;
                    &lt;LineChart
                        data={orderChartData}
                        title="Фармоишҳо"
                        height={280}
                    /&gt;
                &lt;/Card&gt;
                &lt;Card title="Даромад дар як ҳафта" className="dashboard-chart-card"&gt;
                    &lt;BarChart
                        data={revenueChartData}
                        title="Даромад (сомонӣ)"
                        height={280}
                    /&gt;
                &lt;/Card&gt;
            &lt;/div&gt;

            &lt;Card
                title="Фармоишҳои охирин"
                extra={
                    &lt;Button variant="ghost" size="sm" onClick={handleViewAllOrders}&gt;
                        Ҳама →
                    &lt;/Button&gt;
                }
            &gt;
                &lt;OrderTable
                    data={recentOrders}
                    loading={loading}
                    onRowClick={handleOrderRowClick}
                /&gt;
            &lt;/Card&gt;
        &lt;/div&gt;
    );
};

export default Dashboard;
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
