<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>OrderDetails.tsx</title>
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
// frontend/admin/src/pages/Orders/OrderDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge, StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ordersApi, Order, OrderStatus } from '../../api/orders.api';
import { usersApi } from '../../api/users.api';
import './Orders.module.css';

export const OrderDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState&lt;Order | null&gt;(null);
    const [loading, setLoading] = useState(true);
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [couriers, setCouriers] = useState&lt;{ id: string; fullName: string }[]&gt;([]);
    const [selectedCourierId, setSelectedCourierId] = useState('');
    const [newStatus, setNewStatus] = useState&lt;OrderStatus&gt;('PENDING');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const response = await ordersApi.getOrderById(id);
                if (response.success) {
                    setOrder(response.data);
                } else {
                    navigate('/orders');
                }
            } catch (error) {
                console.error('Error fetching order:', error);
                navigate('/orders');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();

        const fetchCouriers = async () => {
            try {
                const response = await usersApi.getCouriers();
                if (response.success) {
                    setCouriers(response.data);
                }
            } catch (error) {
                console.error('Error fetching couriers:', error);
            }
        };
        fetchCouriers();
    }, [id, navigate]);

    const handleStatusChange = async () => {
        if (!order) return;
        setSaving(true);
        try {
            await ordersApi.updateOrderStatus(order.id, newStatus);
            setOrder({ ...order, status: newStatus });
            setStatusModalOpen(false);
        } catch (error) {
            console.error('Error updating order status:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleAssignCourier = async () => {
        if (!order || !selectedCourierId) return;
        setSaving(true);
        try {
            await ordersApi.assignCourier(order.id, selectedCourierId);
            const response = await ordersApi.getOrderById(order.id);
            if (response.success) {
                setOrder(response.data);
            }
            setAssignModalOpen(false);
        } catch (error) {
            console.error('Error assigning courier:', error);
        } finally {
            setSaving(false);
        }
    };

    const getStatusLabel = (status: OrderStatus): string => {
        switch (status) {
            case 'PENDING': return 'Интизорӣ';
            case 'ASSIGNED': return 'Таъин шуд';
            case 'PICKED_UP': return 'Гирифта шуд';
            case 'DELIVERED': return 'Расонида шуд';
            case 'CANCELLED': return 'Бекор шуд';
            default: return status;
        }
    };

    const getStatusVariant = (status: OrderStatus): 'success' | 'warning' | 'danger' | 'info' | 'default' => {
        switch (status) {
            case 'DELIVERED': return 'success';
            case 'PICKED_UP': return 'info';
            case 'ASSIGNED': return 'warning';
            case 'CANCELLED': return 'danger';
            default: return 'default';
        }
    };

    const getPaymentLabel = (status: string): string => {
        switch (status) {
            case 'PENDING': return 'Интизорӣ';
            case 'PAID': return 'Пардохт шуд';
            case 'FAILED': return 'Ноком';
            case 'REFUNDED': return 'Бозгардон';
            default: return status;
        }
    };

    const getPaymentVariant = (status: string): 'success' | 'warning' | 'danger' | 'default' => {
        switch (status) {
            case 'PAID': return 'success';
            case 'PENDING': return 'warning';
            case 'FAILED': return 'danger';
            default: return 'default';
        }
    };

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('tg-TJ').format(price) + ' сом';
    };

    const formatDate = (date: string): string => {
        return new Date(date).toLocaleString('tg-TJ');
    };

    const statusOptions: OrderStatus[] = ['PENDING', 'ASSIGNED', 'PICKED_UP', 'DELIVERED', 'CANCELLED'];

    if (loading) {
        return (
            &lt;div className="order-details-loading"&gt;
                &lt;div className="loading-spinner"&gt;&lt;/div&gt;
                &lt;p&gt;Боркунӣ...&lt;/p&gt;
            &lt;/div&gt;
        );
    }

    if (!order) {
        return (
            &lt;div className="order-details-error"&gt;
                &lt;p&gt;Фармоиш ёфт нашуд&lt;/p&gt;
                &lt;Button onClick={() =&gt; navigate('/orders')}&gt;Бозгашт&lt;/Button&gt;
            &lt;/div&gt;
        );
    }

    return (
        &lt;div className="order-details-page"&gt;
            &lt;div className="order-details-header"&gt;
                &lt;Button variant="ghost" onClick={() =&gt; navigate('/orders')}&gt;
                    ← Бозгашт ба рӯйхат
                &lt;/Button&gt;
                &lt;div className="order-details-actions"&gt;
                    {order.status === 'PENDING' && (
                        &lt;Button variant="primary" onClick={() =&gt; setAssignModalOpen(true)}&gt;
                            Таъини курьер
                        &lt;/Button&gt;
                    )}
                    {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                        &lt;Button variant="warning" onClick={() =&gt; {
                            setNewStatus(order.status);
                            setStatusModalOpen(true);
                        }}&gt;
                            Тағйири статус
                        &lt;/Button&gt;
                    )}
                &lt;/div&gt;
            &lt;/div&gt;

            &lt;div className="order-details-content"&gt;
                &lt;Card className="order-details-card"&gt;
                    &lt;div className="order-details-info"&gt;
                        &lt;div className="order-details-id"&gt;
                            &lt;span className="label"&gt;ID фармоиш&lt;/span&gt;
                            &lt;span className="value"&gt;{order.id}&lt;/span&gt;
                        &lt;/div&gt;
                        &lt;div className="order-details-status"&gt;
                            &lt;span className="label"&gt;Ҳолат&lt;/span&gt;
                            &lt;Badge variant={getStatusVariant(order.status)} size="md"&gt;
                                {getStatusLabel(order.status)}
                            &lt;/Badge&gt;
                        &lt;/div&gt;
                        &lt;div className="order-details-payment"&gt;
                            &lt;span className="label"&gt;Пардохт&lt;/span&gt;
                            &lt;Badge variant={getPaymentVariant(order.paymentStatus)} size="md"&gt;
                                {getPaymentLabel(order.paymentStatus)}
                            &lt;/Badge&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;

                    &lt;div className="order-details-section"&gt;
                        &lt;h3 className="section-title"&gt;👤 Маълумоти муштарӣ&lt;/h3&gt;
                        &lt;div className="info-grid"&gt;
                            &lt;div className="info-item"&gt;
                                &lt;span className="info-label"&gt;Ном&lt;/span&gt;
                                &lt;span className="info-value"&gt;{order.clientName}&lt;/span&gt;
                            &lt;/div&gt;
                            &lt;div className="info-item"&gt;
                                &lt;span className="info-label"&gt;Телефон&lt;/span&gt;
                                &lt;span className="info-value"&gt;{order.clientPhone}&lt;/span&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;

                    &lt;div className="order-details-section"&gt;
                        &lt;h3 className="section-title"&gt;🏍️ Маълумоти курьер&lt;/h3&gt;
                        &lt;div className="info-grid"&gt;
                            &lt;div className="info-item"&gt;
                                &lt;span className="info-label"&gt;Ном&lt;/span&gt;
                                &lt;span className="info-value"&gt;{order.courierName || '—'}&lt;/span&gt;
                            &lt;/div&gt;
                            {order.assignedAt && (
                                &lt;div className="info-item"&gt;
                                    &lt;span className="info-label"&gt;Санаи таъин&lt;/span&gt;
                                    &lt;span className="info-value"&gt;{formatDate(order.assignedAt)}&lt;/span&gt;
                                &lt;/div&gt;
                            )}
                            {order.deliveredAt && (
                                &lt;div className="info-item"&gt;
                                    &lt;span className="info-label"&gt;Санаи расонидан&lt;/span&gt;
                                    &lt;span className="info-value"&gt;{formatDate(order.deliveredAt)}&lt;/span&gt;
                                &lt;/div&gt;
                            )}
                        &lt;/div&gt;
                    &lt;/div&gt;

                    &lt;div className="order-details-section"&gt;
                        &lt;h3 className="section-title"&gt;📍 Суроғаҳо&lt;/h3&gt;
                        &lt;div className="info-grid"&gt;
                            &lt;div className="info-item"&gt;
                                &lt;span className="info-label"&gt;Суроғаи гирифтан&lt;/span&gt;
                                &lt;span className="info-value"&gt;{order.pickupAddress}&lt;/span&gt;
                            &lt;/div&gt;
                            &lt;div className="info-item"&gt;
                                &lt;span className="info-label"&gt;Суроғаи расонидан&lt;/span&gt;
                                &lt;span className="info-value"&gt;{order.deliveryAddress}&lt;/span&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;

                    &lt;div className="order-details-section"&gt;
                        &lt;h3 className="section-title"&gt;💰 Маблағҳо&lt;/h3&gt;
                        &lt;div className="info-grid"&gt;
                            &lt;div className="info-item"&gt;
                                &lt;span className="info-label"&gt;Маблағи фармоиш&lt;/span&gt;
                                &lt;span className="info-value"&gt;{formatPrice(order.amount)}&lt;/span&gt;
                            &lt;/div&gt;
                            &lt;div className="info-item"&gt;
                                &lt;span className="info-label"&gt;Арзиши интиқол&lt;/span&gt;
                                &lt;span className="info-value"&gt;{formatPrice(order.deliveryFee)}&lt;/span&gt;
                            &lt;/div&gt;
                            &lt;div className="info-item"&gt;
                                &lt;span className="info-label"&gt;Маблағи умумӣ&lt;/span&gt;
                                &lt;span className="info-value"&gt;{formatPrice(order.totalAmount)}&lt;/span&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;

                    &lt;div className="order-details-section"&gt;
                        &lt;h3 className="section-title"&gt;📅 Санаҳо&lt;/h3&gt;
                        &lt;div className="info-grid"&gt;
                            &lt;div className="info-item"&gt;
                                &lt;span className="info-label"&gt;Санаи эҷод&lt;/span&gt;
                                &lt;span className="info-value"&gt;{formatDate(order.createdAt)}&lt;/span&gt;
                            &lt;/div&gt;
                            {order.updatedAt && (
                                &lt;div className="info-item"&gt;
                                    &lt;span className="info-label"&gt;Тағйири охирин&lt;/span&gt;
                                    &lt;span className="info-value"&gt;{formatDate(order.updatedAt)}&lt;/span&gt;
                                &lt;/div&gt;
                            )}
                        &lt;/div&gt;
                    &lt;/div&gt;
                &lt;/Card&gt;
            &lt;/div&gt;

            {/* Modal тағйири статус */}
            &lt;Modal
                isOpen={statusModalOpen}
                onClose={() =&gt; setStatusModalOpen(false)}
                title="Тағйири статус"
                size="sm"
                footer={
                    &lt;&gt;
                        &lt;Button variant="ghost" onClick={() =&gt; setStatusModalOpen(false)}&gt;
                            Бекор
                        &lt;/Button&gt;
                        &lt;Button variant="primary" onClick={handleStatusChange} loading={saving}&gt;
                            Тасдиқ
                        &lt;/Button&gt;
                    &lt;/&gt;
                }
            &gt;
                &lt;div className="status-select"&gt;
                    &lt;label&gt;Фармоиш: &lt;strong&gt;{order.id}&lt;/strong&gt;&lt;/label&gt;
                    &lt;select
                        className="status-select-input"
                        value={newStatus}
                        onChange={(e) =&gt; setNewStatus(e.target.value as OrderStatus)}
                    &gt;
                        {statusOptions.map(opt => (
                            &lt;option key={opt} value={opt}&gt;{getStatusLabel(opt)}&lt;/option&gt;
                        ))}
                    &lt;/select&gt;
                &lt;/div&gt;
            &lt;/Modal&gt;

            {/* Modal таъини курьер */}
            &lt;Modal
                isOpen={assignModalOpen}
                onClose={() =&gt; setAssignModalOpen(false)}
                title="Таъини курьер"
                size="sm"
                footer={
                    &lt;&gt;
                        &lt;Button variant="ghost" onClick={() =&gt; setAssignModalOpen(false)}&gt;
                            Бекор
                        &lt;/Button&gt;
                        &lt;Button variant="primary" onClick={handleAssignCourier} loading={saving}&gt;
                            Таъин кардан
                        &lt;/Button&gt;
                    &lt;/&gt;
                }
            &gt;
                &lt;p&gt;Фармоиш: &lt;strong&gt;{order.id}&lt;/strong&gt;&lt;/p&gt;
                &lt;div className="assign-form"&gt;
                    &lt;label className="form-label"&gt;Интихоби курьер&lt;/label&gt;
                    &lt;select
                        className="form-select"
                        value={selectedCourierId}
                        onChange={(e) =&gt; setSelectedCourierId(e.target.value)}
                    &gt;
                        &lt;option value=""&gt;-- Интихоб кунед --&lt;/option&gt;
                        {couriers.map(courier => (
                            &lt;option key={courier.id} value={courier.id}&gt;{courier.fullName}&lt;/option&gt;
                        ))}
                    &lt;/select&gt;
                &lt;/div&gt;
            &lt;/Modal&gt;
        &lt;/div&gt;
    );
};

export default OrderDetails;
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
