<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>OrderAssign.tsx</title>
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
// frontend/admin/src/pages/Orders/OrderAssign.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { ordersApi, Order } from '../../api/orders.api';
import { usersApi } from '../../api/users.api';
import './Orders.module.css';

interface Courier {
    id: string;
    fullName: string;
    phone: string;
    isAvailable: boolean;
    locationLat?: number | null;
    locationLng?: number | null;
    rating?: number;
    totalDeliveries?: number;
}

export const OrderAssign: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState&lt;Order | null&gt;(null);
    const [couriers, setCouriers] = useState&lt;Courier[]&gt;([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [selectedCourierId, setSelectedCourierId] = useState('');
    const [autoAssignStrategy, setAutoAssignStrategy] = useState<'nearest' | 'cheapest' | 'smart'>('smart');
    const [autoAssignLoading, setAutoAssignLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const [orderRes, couriersRes] = await Promise.all([
                    ordersApi.getOrderById(id),
                    usersApi.getCouriers(),
                ]);
                if (orderRes.success) {
                    setOrder(orderRes.data);
                }
                if (couriersRes.success) {
                    setCouriers(couriersRes.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleAssign = async () => {
        if (!order || !selectedCourierId) return;
        setAssigning(true);
        try {
            await ordersApi.assignCourier(order.id, selectedCourierId);
            navigate(`/orders/${order.id}`);
        } catch (error) {
            console.error('Error assigning courier:', error);
        } finally {
            setAssigning(false);
        }
    };

    const handleAutoAssign = async () => {
        if (!order) return;
        setAutoAssignLoading(true);
        try {
            // Дар лоиҳаи воқеӣ, API барои авто-таъин
            // await dispatchApi.autoAssign(order.id, autoAssignStrategy);
            navigate(`/orders/${order.id}`);
        } catch (error) {
            console.error('Error auto assigning:', error);
        } finally {
            setAutoAssignLoading(false);
        }
    };

    const getAvailableCouriers = () => {
        return couriers.filter(c => c.isAvailable);
    };

    if (loading) {
        return (
            &lt;div className="order-assign-loading"&gt;
                &lt;Loader size="lg" text="Боркунии маълумот..." /&gt;
            &lt;/div&gt;
        );
    }

    if (!order) {
        return (
            &lt;div className="order-assign-error"&gt;
                &lt;p&gt;Фармоиш ёфт нашуд&lt;/p&gt;
                &lt;Button onClick={() =&gt; navigate('/orders')}&gt;Бозгашт&lt;/Button&gt;
            &lt;/div&gt;
        );
    }

    if (order.status !== 'PENDING') {
        return (
            &lt;div className="order-assign-error"&gt;
                &lt;p&gt;Фармоиш дар ҳолати {order.status} мебошад. Танҳо фармоишҳои PENDING-ро таъин кардан мумкин аст.&lt;/p&gt;
                &lt;Button onClick={() =&gt; navigate(`/orders/${order.id}`)}&gt;Бозгашт&lt;/Button&gt;
            &lt;/div&gt;
        );
    }

    const availableCouriers = getAvailableCouriers();

    return (
        &lt;div className="order-assign-page"&gt;
            &lt;div className="order-assign-header"&gt;
                &lt;Button variant="ghost" onClick={() =&gt; navigate(`/orders/${order.id}`)}&gt;
                    ← Бозгашт
                &lt;/Button&gt;
                &lt;h1 className="order-assign-title"&gt;Таъини курьер&lt;/h1&gt;
            &lt;/div&gt;

            &lt;div className="order-assign-content"&gt;
                {/* Маълумоти фармоиш */}
                &lt;Card title="Маълумоти фармоиш" className="order-info-card"&gt;
                    &lt;div className="order-info-grid"&gt;
                        &lt;div className="order-info-item"&gt;
                            &lt;span className="label"&gt;ID фармоиш&lt;/span&gt;
                            &lt;span className="value"&gt;{order.id}&lt;/span&gt;
                        &lt;/div&gt;
                        &lt;div className="order-info-item"&gt;
                            &lt;span className="label"&gt;Муштарӣ&lt;/span&gt;
                            &lt;span className="value"&gt;{order.clientName}&lt;/span&gt;
                        &lt;/div&gt;
                        &lt;div className="order-info-item"&gt;
                            &lt;span className="label"&gt;Маблағ&lt;/span&gt;
                            &lt;span className="value"&gt;{order.totalAmount} сом&lt;/span&gt;
                        &lt;/div&gt;
                        &lt;div className="order-info-item"&gt;
                            &lt;span className="label"&gt;Суроғаи гирифтан&lt;/span&gt;
                            &lt;span className="value"&gt;{order.pickupAddress}&lt;/span&gt;
                        &lt;/div&gt;
                        &lt;div className="order-info-item"&gt;
                            &lt;span className="label"&gt;Суроғаи расонидан&lt;/span&gt;
                            &lt;span className="value"&gt;{order.deliveryAddress}&lt;/span&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;
                &lt;/Card&gt;

                {/* Авто-таъин */}
                &lt;Card title="🚀 Таъини автоматикӣ" className="auto-assign-card"&gt;
                    &lt;div className="auto-assign-content"&gt;
                        &lt;div className="strategy-select"&gt;
                            &lt;label&gt;Стратегияи таъин&lt;/label&gt;
                            &lt;select
                                className="strategy-select-input"
                                value={autoAssignStrategy}
                                onChange={(e) =&gt; setAutoAssignStrategy(e.target.value as any)}
                            &gt;
                                &lt;option value="nearest"&gt;Наздиктарин курьер&lt;/option&gt;
                                &lt;option value="cheapest"&gt;Арзонтарин курьер&lt;/option&gt;
                                &lt;option value="smart"&gt;Стратегияи интеллектуалӣ&lt;/option&gt;
                            &lt;/select&gt;
                        &lt;/div&gt;
                        &lt;Button
                            variant="primary"
                            onClick={handleAutoAssign}
                            loading={autoAssignLoading}
                            disabled={availableCouriers.length === 0}
                            fullWidth
                        &gt;
                            Таъини автоматикӣ
                        &lt;/Button&gt;
                        {availableCouriers.length === 0 && (
                            &lt;p className="warning-text"&gt;Ҳеҷ курьери дастрас нест&lt;/p&gt;
                        )}
                    &lt;/div&gt;
                &lt;/Card&gt;

                {/* Рӯйхати курьерҳо */}
                &lt;Card title="🏍️ Интихоби курьер аз рӯйхат"&gt;
                    {availableCouriers.length === 0 ? (
                        &lt;div className="no-couriers"&gt;
                            &lt;p&gt;Ҳеҷ курьери дастрас нест&lt;/p&gt;
                        &lt;/div&gt;
                    ) : (
                        &lt;div className="couriers-list"&gt;
                            {availableCouriers.map(courier => (
                                &lt;div
                                    key={courier.id}
                                    className={`courier-item ${selectedCourierId === courier.id ? 'selected' : ''}`}
                                    onClick={() =&gt; setSelectedCourierId(courier.id)}
                                &gt;
                                    &lt;div className="courier-avatar"&gt;
                                        {courier.fullName.split(' ').map(n =&gt; n[0]).join('').toUpperCase().slice(0, 2)}
                                    &lt;/div&gt;
                                    &lt;div className="courier-info"&gt;
                                        &lt;div className="courier-name"&gt;{courier.fullName}&lt;/div&gt;
                                        &lt;div className="courier-meta"&gt;
                                            &lt;span&gt;📞 {courier.phone}&lt;/span&gt;
                                            {courier.rating && &lt;span&gt;⭐ {courier.rating}&lt;/span&gt;}
                                            {courier.totalDeliveries && &lt;span&gt;📦 {courier.totalDeliveries}&lt;/span&gt;}
                                        &lt;/div&gt;
                                    &lt;/div&gt;
                                    &lt;Badge variant="success" size="sm"&gt;Онлайн&lt;/Badge&gt;
                                &lt;/div&gt;
                            ))}
                        &lt;/div&gt;
                    )}
                &lt;/Card&gt;

                {/* Тугмаи таъин */}
                {selectedCourierId && (
                    &lt;div className="assign-actions"&gt;
                        &lt;Button
                            variant="success"
                            size="lg"
                            onClick={handleAssign}
                            loading={assigning}
                            fullWidth
                        &gt;
                            Таъин кардан
                        &lt;/Button&gt;
                    &lt;/div&gt;
                )}
            &lt;/div&gt;
        &lt;/div&gt;
    );
};

export default OrderAssign;
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
