<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Orders.tsx</title>
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
// frontend/admin/src/pages/Orders/Orders.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderTable, Order, OrderStatus } from '../../components/features/OrderTable';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ordersApi } from '../../api/orders.api';
import { usersApi } from '../../api/users.api';
import './Orders.module.css';

export const Orders: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState&lt;Order[]&gt;([]);
    const [loading, setLoading] = useState(true);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState&lt;Order | null&gt;(null);
    const [couriers, setCouriers] = useState&lt;{ id: string; fullName: string }[]&gt;([]);
    const [selectedCourierId, setSelectedCourierId] = useState('');
    const [assignLoading, setAssignLoading] = useState(false);
    const [filters, setFilters] = useState({
        status: '' as OrderStatus | '',
        search: '',
        fromDate: '',
        toDate: '',
    });

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const response = await ordersApi.getAllOrders({
                status: filters.status || undefined,
                page: 1,
                limit: 100,
            });
            if (response.success) {
                setOrders(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    }, [filters.status]);

    const fetchCouriers = useCallback(async () => {
        try {
            const response = await usersApi.getCouriers();
            if (response.success) {
                setCouriers(response.data);
            }
        } catch (error) {
            console.error('Error fetching couriers:', error);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
        fetchCouriers();
    }, [fetchOrders, fetchCouriers]);

    const handleOrderClick = (order: Order) => {
        navigate(`/orders/${order.id}`);
    };

    const handleAssignClick = (order: Order) => {
        setSelectedOrder(order);
        setSelectedCourierId('');
        setAssignModalOpen(true);
    };

    const handleAssignSubmit = async () => {
        if (!selectedOrder || !selectedCourierId) return;
        setAssignLoading(true);
        try {
            await ordersApi.assignCourier(selectedOrder.id, selectedCourierId);
            setAssignModalOpen(false);
            fetchOrders();
        } catch (error) {
            console.error('Error assigning courier:', error);
        } finally {
            setAssignLoading(false);
        }
    };

    const handleStatusChange = async (order: Order, status: OrderStatus) => {
        try {
            await ordersApi.updateOrderStatus(order.id, status);
            fetchOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const handleDelete = async (order: Order) => {
        if (!confirm(`Шумо боварӣ доред, ки фармоиши ${order.id} -ро нест кардан мехоҳед?`)) {
            return;
        }
        try {
            await ordersApi.cancelOrder(order.id);
            fetchOrders();
        } catch (error) {
            console.error('Error deleting order:', error);
        }
    };

    const statusOptions = [
        { value: '', label: 'Ҳама' },
        { value: 'PENDING', label: 'Интизорӣ' },
        { value: 'ASSIGNED', label: 'Таъин шуд' },
        { value: 'PICKED_UP', label: 'Гирифта шуд' },
        { value: 'DELIVERED', label: 'Расонида шуд' },
        { value: 'CANCELLED', label: 'Бекор шуд' },
    ];

    const filteredOrders = orders.filter(order => {
        if (filters.search && !order.id.toLowerCase().includes(filters.search.toLowerCase()) &&
            !order.clientName.toLowerCase().includes(filters.search.toLowerCase())) {
            return false;
        }
        if (filters.fromDate && new Date(order.createdAt) < new Date(filters.fromDate)) {
            return false;
        }
        if (filters.toDate && new Date(order.createdAt) > new Date(filters.toDate)) {
            return false;
        }
        return true;
    });

    return (
        &lt;div className="orders-page"&gt;
            &lt;div className="orders-header"&gt;
                &lt;div&gt;
                    &lt;h1 className="orders-title"&gt;Фармоишҳо&lt;/h1&gt;
                    &lt;p className="orders-subtitle"&gt;Идоракунии ҳамаи фармоишҳои система&lt;/p&gt;
                &lt;/div&gt;
            &lt;/div&gt;

            &lt;Card className="orders-filters"&gt;
                &lt;div className="filters-row"&gt;
                    &lt;Input
                        placeholder="Ҷустуҷӯ (ID ё номи муштарӣ)..."
                        value={filters.search}
                        onChange={(e) =&gt; setFilters({ ...filters, search: e.target.value })}
                        className="filter-search"
                    /&gt;
                    &lt;select
                        className="filter-select"
                        value={filters.status}
                        onChange={(e) =&gt; setFilters({ ...filters, status: e.target.value as OrderStatus | '' })}
                    &gt;
                        {statusOptions.map(opt => (
                            &lt;option key={opt.value} value={opt.value}&gt;{opt.label}&lt;/option&gt;
                        ))}
                    &lt;/select&gt;
                    &lt;Input
                        type="date"
                        value={filters.fromDate}
                        onChange={(e) =&gt; setFilters({ ...filters, fromDate: e.target.value })}
                        className="filter-date"
                        placeholder="Аз сана"
                    /&gt;
                    &lt;Input
                        type="date"
                        value={filters.toDate}
                        onChange={(e) =&gt; setFilters({ ...filters, toDate: e.target.value })}
                        className="filter-date"
                        placeholder="То сана"
                    /&gt;
                    &lt;Button variant="ghost" onClick={() =&gt; setFilters({ status: '', search: '', fromDate: '', toDate: '' })}&gt;
                        Тоза кардан
                    &lt;/Button&gt;
                &lt;/div&gt;
            &lt;/Card&gt;

            &lt;OrderTable
                data={filteredOrders}
                loading={loading}
                onRowClick={handleOrderClick}
                onAssign={handleAssignClick}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
            /&gt;

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
                        &lt;Button variant="primary" onClick={handleAssignSubmit} loading={assignLoading}&gt;
                            Таъин кардан
                        &lt;/Button&gt;
                    &lt;/&gt;
                }
            &gt;
                &lt;p&gt;Фармоиш: &lt;strong&gt;{selectedOrder?.id}&lt;/strong&gt;&lt;/p&gt;
                &lt;p&gt;Муштарӣ: &lt;strong&gt;{selectedOrder?.clientName}&lt;/strong&gt;&lt;/p&gt;
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

export default Orders;
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
