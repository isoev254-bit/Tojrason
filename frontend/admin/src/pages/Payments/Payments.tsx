<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Payments.tsx</title>
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
// frontend/admin/src/pages/Payments/Payments.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Table, Column } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { paymentsApi, Payment, PaymentStatus, PaymentMethod } from '../../api/payments.api';
import './Payments.module.css';

export const Payments: React.FC = () => {
    const [payments, setPayments] = useState&lt;Payment[]&gt;([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        totalAmount: 0,
        pending: 0,
        paid: 0,
    });
    const [refundModalOpen, setRefundModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState&lt;Payment | null&gt;(null);
    const [refundAmount, setRefundAmount] = useState('');
    const [refundReason, setRefundReason] = useState('');
    const [refundLoading, setRefundLoading] = useState(false);
    const [filters, setFilters] = useState({
        status: '' as PaymentStatus | '',
        method: '' as PaymentMethod | '',
        search: '',
        fromDate: '',
        toDate: '',
    });

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await paymentsApi.getAllPayments({
                status: filters.status || undefined,
                method: filters.method || undefined,
                page: 1,
                limit: 100,
            });
            if (response.success) {
                setPayments(response.data.data);
                
                // Ҳисоб кардани омор
                const total = response.data.data.length;
                const totalAmount = response.data.data.reduce((sum, p) => sum + p.amount, 0);
                const pending = response.data.data.filter(p => p.status === 'PENDING').length;
                const paid = response.data.data.filter(p => p.status === 'PAID').length;
                
                setStats({ total, totalAmount, pending, paid });
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    }, [filters.status, filters.method]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const handleRefund = (payment: Payment) => {
        if (payment.status !== 'PAID') {
            alert('Танҳо пардохтҳои тасдиқшударо бозгардон кардан мумкин аст');
            return;
        }
        setSelectedPayment(payment);
        setRefundAmount(payment.amount.toString());
        setRefundReason('');
        setRefundModalOpen(true);
    };

    const handleConfirmRefund = async () => {
        if (!selectedPayment) return;
        setRefundLoading(true);
        try {
            await paymentsApi.refundPayment({
                paymentId: selectedPayment.id,
                amount: parseFloat(refundAmount),
                reason: refundReason,
            });
            setRefundModalOpen(false);
            fetchPayments();
        } catch (error) {
            console.error('Error refunding payment:', error);
        } finally {
            setRefundLoading(false);
        }
    };

    const getStatusVariant = (status: PaymentStatus): 'success' | 'warning' | 'danger' | 'default' => {
        switch (status) {
            case 'PAID': return 'success';
            case 'PENDING': return 'warning';
            case 'FAILED': return 'danger';
            case 'REFUNDED': return 'default';
            default: return 'default';
        }
    };

    const getStatusLabel = (status: PaymentStatus): string => {
        switch (status) {
            case 'PENDING': return 'Интизорӣ';
            case 'PAID': return 'Пардохт шуд';
            case 'FAILED': return 'Ноком';
            case 'REFUNDED': return 'Бозгардон';
            default: return status;
        }
    };

    const getMethodLabel = (method: PaymentMethod): string => {
        return method === 'stripe' ? 'Stripe' : 'Нақдӣ';
    };

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('tg-TJ').format(price) + ' сом';
    };

    const formatDate = (date: string): string => {
        return new Date(date).toLocaleString('tg-TJ');
    };

    const columns: Column&lt;Payment&gt;[] = [
        {
            key: 'id',
            title: 'ID',
            render: (value) => <span className="payment-id">{value.slice(0, 8)}...</span>,
        },
        {
            key: 'orderId',
            title: 'ID фармоиш',
            render: (value) => <span className="payment-order-id">{value.slice(0, 8)}...</span>,
        },
        {
            key: 'amount',
            title: 'Маблағ',
            render: (value) => <span className="payment-amount">{formatPrice(value)}</span>,
        },
        {
            key: 'method',
            title: 'Усул',
            render: (value) => getMethodLabel(value),
        },
        {
            key: 'status',
            title: 'Ҳолат',
            render: (value) => (
                <Badge variant={getStatusVariant(value)} size="sm">
                    {getStatusLabel(value)}
                </Badge>
            ),
        },
        {
            key: 'createdAt',
            title: 'Сана',
            render: (value) => formatDate(value),
        },
        {
            key: 'actions',
            title: 'Амалҳо',
            align: 'center',
            render: (_, record) => (
                <div className="payment-actions">
                    {record.status === 'PAID' && (
                        <Button size="xs" variant="warning" onClick={() => handleRefund(record)}>
                            Бозгардон
                        </Button>
                    )}
                    <Button size="xs" variant="ghost" onClick={() => window.open(`/orders/${record.orderId}`, '_blank')}>
                        👁 Фармоиш
                    </Button>
                </div>
            ),
        },
    ];

    const statusOptions = [
        { value: '', label: 'Ҳама' },
        { value: 'PENDING', label: 'Интизорӣ' },
        { value: 'PAID', label: 'Пардохт шуд' },
        { value: 'FAILED', label: 'Ноком' },
        { value: 'REFUNDED', label: 'Бозгардон' },
    ];

    const methodOptions = [
        { value: '', label: 'Ҳама' },
        { value: 'stripe', label: 'Stripe' },
        { value: 'cash', label: 'Нақдӣ' },
    ];

    const filteredPayments = payments.filter(payment => {
        if (filters.search && !payment.id.toLowerCase().includes(filters.search.toLowerCase()) &&
            !payment.orderId.toLowerCase().includes(filters.search.toLowerCase())) {
            return false;
        }
        if (filters.fromDate && new Date(payment.createdAt) < new Date(filters.fromDate)) {
            return false;
        }
        if (filters.toDate && new Date(payment.createdAt) > new Date(filters.toDate)) {
            return false;
        }
        return true;
    });

    return (
        <div className="payments-page">
            <div className="payments-header">
                <div>
                    <h1 className="payments-title">Пардохтҳо</h1>
                    <p className="payments-subtitle">Идоракунии ҳамаи пардохтҳои система</p>
                </div>
            </div>

            {/* Статистика */}
            <div className="payments-stats">
                <div className="stat-card">
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Пардохтҳо</div>
                </div>
                <div className="stat-card primary">
                    <div className="stat-value">{formatPrice(stats.totalAmount)}</div>
                    <div className="stat-label">Маблағи умумӣ</div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-value">{stats.pending}</div>
                    <div className="stat-label">Интизорӣ</div>
                </div>
                <div className="stat-card success">
                    <div className="stat-value">{stats.paid}</div>
                    <div className="stat-label">Пардохт шуд</div>
                </div>
            </div>

            {/* Филтрҳо */}
            <Card className="payments-filters">
                <div className="filters-row">
                    <Input
                        placeholder="Ҷустуҷӯ (ID фармоиш)..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="filter-search"
                    />
                    <select
                        className="filter-select"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value as PaymentStatus | '' })}
                    >
                        {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <select
                        className="filter-select"
                        value={filters.method}
                        onChange={(e) => setFilters({ ...filters, method: e.target.value as PaymentMethod | '' })}
                    >
                        {methodOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <Input
                        type="date"
                        value={filters.fromDate}
                        onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                        className="filter-date"
                        placeholder="Аз сана"
                    />
                    <Input
                        type="date"
                        value={filters.toDate}
                        onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                        className="filter-date"
                        placeholder="То сана"
                    />
                    <Button variant="ghost" onClick={() => setFilters({ status: '', method: '', search: '', fromDate: '', toDate: '' })}>
                        Тоза кардан
                    </Button>
                </div>
            </Card>

            {/* Таблитсаи пардохтҳо */}
            <Table
                data={filteredPayments}
                columns={columns}
                rowKey="id"
                loading={loading}
                striped
                bordered
            />

            {/* Modal бозгардон */}
            <Modal
                isOpen={refundModalOpen}
                onClose={() => setRefundModalOpen(false)}
                title="Бозгардонидани пардохт"
                size="sm"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setRefundModalOpen(false)}>
                            Бекор
                        </Button>
                        <Button variant="warning" onClick={handleConfirmRefund} loading={refundLoading}>
                            Бозгардон
                        </Button>
                    </>
                }
            >
                <div className="refund-form">
                    <p>Пардохт: <strong>{selectedPayment?.id}</strong></p>
                    <p>Фармоиш: <strong>{selectedPayment?.orderId}</strong></p>
                    <Input
                        label="Маблағи бозгардон"
                        type="number"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(e.target.value)}
                        placeholder="Маблағ"
                    />
                    <Input
                        label="Сабаб"
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        placeholder="Сабаби бозгардон"
                    />
                </div>
            </Modal>
        </div>
    );
};

export default Payments;
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
