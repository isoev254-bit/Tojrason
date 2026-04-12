<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>PaymentDetails.tsx</title>
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
// frontend/admin/src/pages/Payments/PaymentDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { paymentsApi, Payment, PaymentStatus, PaymentMethod } from '../../api/payments.api';
import './Payments.module.css';

export const PaymentDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [payment, setPayment] = useState&lt;Payment | null&gt;(null);
    const [loading, setLoading] = useState(true);
    const [refundModalOpen, setRefundModalOpen] = useState(false);
    const [refundAmount, setRefundAmount] = useState('');
    const [refundReason, setRefundReason] = useState('');
    const [refundLoading, setRefundLoading] = useState(false);

    useEffect(() => {
        const fetchPayment = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const response = await paymentsApi.getPaymentStatus(id);
                if (response.success) {
                    setPayment(response.data);
                } else {
                    navigate('/payments');
                }
            } catch (error) {
                console.error('Error fetching payment:', error);
                navigate('/payments');
            } finally {
                setLoading(false);
            }
        };
        fetchPayment();
    }, [id, navigate]);

    const handleRefund = async () => {
        if (!payment) return;
        setRefundLoading(true);
        try {
            await paymentsApi.refundPayment({
                paymentId: payment.id,
                amount: parseFloat(refundAmount),
                reason: refundReason,
            });
            setRefundModalOpen(false);
            const response = await paymentsApi.getPaymentStatus(payment.id);
            if (response.success) {
                setPayment(response.data);
            }
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

    if (loading) {
        return (
            <div className="payment-details-loading">
                <div className="loading-spinner"></div>
                <p>Боркунӣ...</p>
            </div>
        );
    }

    if (!payment) {
        return (
            <div className="payment-details-error">
                <p>Пардохт ёфт нашуд</p>
                <Button onClick={() => navigate('/payments')}>Бозгашт</Button>
            </div>
        );
    }

    return (
        <div className="payment-details-page">
            <div className="payment-details-header">
                <Button variant="ghost" onClick={() => navigate('/payments')}>
                    ← Бозгашт ба рӯйхат
                </Button>
                <div className="payment-details-actions">
                    {payment.status === 'PAID' && (
                        <Button variant="warning" onClick={() => {
                            setRefundAmount(payment.amount.toString());
                            setRefundReason('');
                            setRefundModalOpen(true);
                        }}>
                            Бозгардон
                        </Button>
                    )}
                </div>
            </div>

            <div className="payment-details-content">
                <Card className="payment-details-card">
                    <div className="payment-details-info">
                        <div className="payment-details-id">
                            <span className="label">ID пардохт</span>
                            <span className="value">{payment.id}</span>
                        </div>
                        <div className="payment-details-status">
                            <span className="label">Ҳолат</span>
                            <Badge variant={getStatusVariant(payment.status)} size="md">
                                {getStatusLabel(payment.status)}
                            </Badge>
                        </div>
                        <div className="payment-details-method">
                            <span className="label">Усули пардохт</span>
                            <span className="value">{getMethodLabel(payment.method)}</span>
                        </div>
                    </div>

                    <div className="payment-details-section">
                        <h3 className="section-title">💰 Маблағҳо</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Маблағ</span>
                                <span className="info-value">{formatPrice(payment.amount)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Валюта</span>
                                <span className="info-value">{payment.currency}</span>
                            </div>
                        </div>
                    </div>

                    <div className="payment-details-section">
                        <h3 className="section-title">📋 Маълумоти фармоиш</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">ID фармоиш</span>
                                <span className="info-value">
                                    <Button variant="ghost" size="xs" onClick={() => navigate(`/orders/${payment.orderId}`)}>
                                        {payment.orderId}
                                    </Button>
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">ID корбар</span>
                                <span className="info-value">{payment.userId}</span>
                            </div>
                        </div>
                    </div>

                    <div className="payment-details-section">
                        <h3 className="section-title">📅 Санаҳо</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Санаи эҷод</span>
                                <span className="info-value">{formatDate(payment.createdAt)}</span>
                            </div>
                            {payment.paidAt && (
                                <div className="info-item">
                                    <span className="info-label">Санаи пардохт</span>
                                    <span className="info-value">{formatDate(payment.paidAt)}</span>
                                </div>
                            )}
                            {payment.refundedAt && (
                                <div className="info-item">
                                    <span className="info-label">Санаи бозгардон</span>
                                    <span className="info-value">{formatDate(payment.refundedAt)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {payment.providerPaymentId && (
                        <div className="payment-details-section">
                            <h3 className="section-title">🔗 Маълумоти провайдер</h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">ID дар провайдер</span>
                                    <span className="info-value">{payment.providerPaymentId}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {payment.metadata && Object.keys(payment.metadata).length > 0 && (
                        <div className="payment-details-section">
                            <h3 className="section-title">📝 Маълумоти иловагӣ</h3>
                            <div className="info-grid">
                                {Object.entries(payment.metadata).map(([key, value]) => (
                                    <div key={key} className="info-item">
                                        <span className="info-label">{key}</span>
                                        <span className="info-value">{String(value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </div>

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
                        <Button variant="warning" onClick={handleRefund} loading={refundLoading}>
                            Бозгардон
                        </Button>
                    </>
                }
            >
                <div className="refund-form">
                    <p>Пардохт: <strong>{payment.id}</strong></p>
                    <p>Фармоиш: <strong>{payment.orderId}</strong></p>
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

export default PaymentDetails;
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
