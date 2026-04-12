<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CourierDetails.tsx</title>
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
// frontend/admin/src/pages/Couriers/CourierDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge, StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { CourierForm, CourierFormData } from './CourierForm';
import { usersApi, User } from '../../api/users.api';
import { couriersApi, CourierStats } from '../../api/couriers.api';
import './Couriers.module.css';

export const CourierDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [courier, setCourier] = useState&lt;User | null&gt;(null);
    const [stats, setStats] = useState&lt;CourierStats | null&gt;(null);
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchCourier = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const [userRes, statsRes] = await Promise.all([
                    usersApi.getUserById(id),
                    couriersApi.getStats(),
                ]);
                if (userRes.success) {
                    setCourier(userRes.data);
                }
                if (statsRes.success) {
                    setStats(statsRes.data);
                }
            } catch (error) {
                console.error('Error fetching courier:', error);
                navigate('/couriers');
            } finally {
                setLoading(false);
            }
        };
        fetchCourier();
    }, [id, navigate]);

    const handleEdit = async (data: CourierFormData) => {
        if (!courier) return;
        setSaving(true);
        try {
            await usersApi.updateUser(courier.id, {
                fullName: data.fullName,
                phone: data.phone,
                email: data.email,
                isAvailable: data.isAvailable,
            });
            setCourier({
                ...courier,
                fullName: data.fullName,
                phone: data.phone,
                email: data.email,
                isAvailable: data.isAvailable,
            });
            setEditModalOpen(false);
        } catch (error) {
            console.error('Error updating courier:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!courier) return;
        setSaving(true);
        try {
            await usersApi.deleteUser(courier.id);
            navigate('/couriers');
        } catch (error) {
            console.error('Error deleting courier:', error);
        } finally {
            setSaving(false);
            setDeleteModalOpen(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!courier) return;
        try {
            await usersApi.updateUser(courier.id, { isAvailable: !courier.isAvailable });
            setCourier({ ...courier, isAvailable: !courier.isAvailable });
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    const getInitials = (name: string): string => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (loading) {
        return (
            &lt;div className="courier-details-loading"&gt;
                &lt;div className="loading-spinner"&gt;&lt;/div&gt;
                &lt;p&gt;Боркунӣ...&lt;/p&gt;
            &lt;/div&gt;
        );
    }

    if (!courier) {
        return (
            &lt;div className="courier-details-error"&gt;
                &lt;p&gt;Курьер ёфт нашуд&lt;/p&gt;
                &lt;Button onClick={() =&gt; navigate('/couriers')}&gt;Бозгашт&lt;/Button&gt;
            &lt;/div&gt;
        );
    }

    return (
        &lt;div className="courier-details-page"&gt;
            &lt;div className="courier-details-header"&gt;
                &lt;Button variant="ghost" onClick={() =&gt; navigate('/couriers')}&gt;
                    ← Бозгашт ба рӯйхат
                &lt;/Button&gt;
                &lt;div className="courier-details-actions"&gt;
                    &lt;Button variant="primary" onClick={() =&gt; setEditModalOpen(true)}&gt;
                        ✏️ Таҳрир
                    &lt;/Button&gt;
                    &lt;Button variant="danger" onClick={() =&gt; setDeleteModalOpen(true)}&gt;
                        🗑️ Нест кардан
                    &lt;/Button&gt;
                &lt;/div&gt;
            &lt;/div&gt;

            &lt;div className="courier-details-content"&gt;
                &lt;Card className="courier-details-card"&gt;
                    &lt;div className="courier-details-profile"&gt;
                        &lt;div className="courier-details-avatar"&gt;
                            {getInitials(courier.fullName)}
                        &lt;/div&gt;
                        &lt;div className="courier-details-info"&gt;
                            &lt;h1 className="courier-details-name"&gt;{courier.fullName}&lt;/h1&gt;
                            &lt;div className="courier-details-badges"&gt;
                                &lt;Badge variant="success" size="md"&gt;
                                    Курьер
                                &lt;/Badge&gt;
                                {courier.isAvailable ? (
                                    &lt;StatusBadge status="online" showDot /&gt;
                                ) : (
                                    &lt;StatusBadge status="offline" showDot /&gt;
                                )}
                            &lt;/div&gt;
                        &lt;/div&gt;
                        &lt;Button
                            variant={courier.isAvailable ? 'warning' : 'success'}
                            onClick={handleToggleStatus}
                        &gt;
                            {courier.isAvailable ? 'Хомӯш кардан' : 'Фаъол кардан'}
                        &lt;/Button&gt;
                    &lt;/div&gt;

                    &lt;div className="courier-details-stats"&gt;
                        &lt;div className="stat-card"&gt;
                            &lt;div className="stat-value"&gt;{stats?.totalDelivered || 0}&lt;/div&gt;
                            &lt;div className="stat-label"&gt;Фармоишҳои расонида&lt;/div&gt;
                        &lt;/div&gt;
                        &lt;div className="stat-card"&gt;
                            &lt;div className="stat-value"&gt;{stats?.totalEarnings || 0} сом&lt;/div&gt;
                            &lt;div className="stat-label"&gt;Даромад&lt;/div&gt;
                        &lt;/div&gt;
                        &lt;div className="stat-card"&gt;
                            &lt;div className="stat-value"&gt;{stats?.activeOrdersCount || 0}&lt;/div&gt;
                            &lt;div className="stat-label"&gt;Фармоишҳои фаъол&lt;/div&gt;
                        &lt;/div&gt;
                        &lt;div className="stat-card"&gt;
                            &lt;div className="stat-value"&gt;⭐ {stats?.rating || 5.0}&lt;/div&gt;
                            &lt;div className="stat-label"&gt;Рейтинг&lt;/div&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;

                    &lt;div className="courier-details-section"&gt;
                        &lt;h3 className="section-title"&gt;📞 Маълумоти тамос&lt;/h3&gt;
                        &lt;div className="info-grid"&gt;
                            &lt;div className="info-item"&gt;
                                &lt;span className="info-label"&gt;📧 Email&lt;/span&gt;
                                &lt;span className="info-value"&gt;{courier.email}&lt;/span&gt;
                            &lt;/div&gt;
                            &lt;div className="info-item"&gt;
                                &lt;span className="info-label"&gt;📞 Телефон&lt;/span&gt;
                                &lt;span className="info-value"&gt;{courier.phone}&lt;/span&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;

                    &lt;div className="courier-details-section"&gt;
                        &lt;h3 className="section-title"&gt;🚗 Маълумоти нақлиёт&lt;/h3&gt;
                        &lt;div className="info-grid"&gt;
                            &lt;div className="info-item"&gt;
                                &lt;span className="info-label"&gt;Воситаи нақлиёт&lt;/span&gt;
                                &lt;span className="info-value"&gt;{(courier as any).vehicle || '—'}&lt;/span&gt;
                            &lt;/div&gt;
                            &lt;div className="info-item"&gt;
                                &lt;span className="info-label"&gt;Рақами мошин&lt;/span&gt;
                                &lt;span className="info-value"&gt;{(courier as any).licensePlate || '—'}&lt;/span&gt;
                            &lt;/div&gt;
                            &lt;div className="info-item"&gt;
                                &lt;span className="info-label"&gt;Шаҳр&lt;/span&gt;
                                &lt;span className="info-value"&gt;{(courier as any).city || 'Душанбе'}&lt;/span&gt;
                            &lt;/div&gt;
                            &lt;div className="info-item"&gt;
                                &lt;span className="info-label"&gt;Таҷриба&lt;/span&gt;
                                &lt;span className="info-value"&gt;{(courier as any).experience || '—'}&lt;/span&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;

                    &lt;div className="courier-details-section"&gt;
                        &lt;h3 className="section-title"&gt;📅 Маълумоти система&lt;/h3&gt;
                        &lt;div className="info-grid"&gt;
                            &lt;div className="info-item"&gt;
                                &lt;span className="info-label"&gt;🆔 ID&lt;/span&gt;
                                &lt;span className="info-value"&gt;{courier.id}&lt;/span&gt;
                            &lt;/div&gt;
                            &lt;div className="info-item"&gt;
                                &lt;span className="info-label"&gt;📅 Санаи бақайдгирӣ&lt;/span&gt;
                                &lt;span className="info-value"&gt;
                                    {new Date(courier.createdAt).toLocaleDateString('tg-TJ')}
                                &lt;/span&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;
                &lt;/Card&gt;
            &lt;/div&gt;

            {/* Modal таҳрир */}
            &lt;Modal
                isOpen={editModalOpen}
                onClose={() =&gt; setEditModalOpen(false)}
                title="Таҳрири курьер"
                size="md"
            &gt;
                &lt;CourierForm
                    courier={courier}
                    loading={saving}
                    onSubmit={handleEdit}
                    onCancel={() =&gt; setEditModalOpen(false)}
                /&gt;
            &lt;/Modal&gt;

            {/* Modal тасдиқи нест кардан */}
            &lt;Modal
                isOpen={deleteModalOpen}
                onClose={() =&gt; setDeleteModalOpen(false)}
                title="Тасдиқи нест кардан"
                size="sm"
                footer={
                    &lt;&gt;
                        &lt;Button variant="ghost" onClick={() =&gt; setDeleteModalOpen(false)}&gt;
                            Бекор
                        &lt;/Button&gt;
                        &lt;Button variant="danger" onClick={handleDelete} loading={saving}&gt;
                            Нест кардан
                        &lt;/Button&gt;
                    &lt;/&gt;
                }
            &gt;
                &lt;p&gt;Шумо боварӣ доред, ки курьер &lt;strong&gt;{courier.fullName}&lt;/strong&gt; -ро нест кардан мехоҳед?&lt;/p&gt;
                &lt;p className="delete-warning"&gt;Ин амал баргардонда намешавад!&lt;/p&gt;
            &lt;/Modal&gt;
        &lt;/div&gt;
    );
};

export default CourierDetails;
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
